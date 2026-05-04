import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth, clerkClient } from "@clerk/nextjs/server";
import { masterPrisma, getTenantPrisma } from "@/utils/lib/prisma";
import { notifyBusinessStaff } from "@/utils/server/novu";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    const { userId: clerkId } = getAuth(req);

    if (!clerkId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    // 1. Fetch User and Business context from Master DB
    const user = await masterPrisma.user.findUnique({
        where: { clerkId },
        select: {
            id: true,
            businessId: true,
            role: true,
            firstName: true,
            lastName: true,
            storeId: true,
        },
    });

    if (!user || !user.businessId) {
        return res
            .status(403)
            .json({ error: "User or Business profile not found" });
    }

    const { businessId, role, id: masterUserId } = user;
    const activeStoreHeader = req.headers["x-store-id"] as string;

    // 2. Get Tenant Prisma client
    const tenantPrisma = await getTenantPrisma(businessId);

    // Fetch user store access from Tenant DB if not admin
    let userStoreId: string | null = null;
    if (role !== "admin") {
        if (user.storeId) {
            userStoreId = user.storeId;
        } else {
            const tenantUser = await tenantPrisma.tenantUser.findUnique({
                where: { clerkId },
                select: { storeId: true }
            });
            userStoreId = tenantUser?.storeId || null;
        }
    }

    switch (req.method) {
        case "GET":
            try {
                const isAll =
                    !activeStoreHeader ||
                    activeStoreHeader === "All" ||
                    activeStoreHeader === "all";
                const targetStoreId =
                    role === "admin"
                        ? isAll
                            ? null
                            : activeStoreHeader
                        : userStoreId;

                const expenses = await tenantPrisma.expense.findMany({
                    where: {
                        businessId,
                        status: "ACTIVE",
                        ...(role === "admin"
                            ? targetStoreId
                                ? {
                                      OR: [
                                          { storeId: targetStoreId },
                                          { storeId: null },
                                      ],
                                  }
                                : {}
                            : { storeId: targetStoreId }),
                    },
                    include: {
                        Store: { select: { name: true } },
                    },
                    orderBy: { date: "desc" },
                });

                // Get unique internal User IDs from Master DB for enrichment
                const creatorIds = Array.from(
                    new Set(
                        expenses
                            .map((e) => e.createdById)
                            .filter((id) => id !== null),
                    ),
                ) as string[];

                // Fetch team members from Master DB
                const dbUsers = await masterPrisma.user.findMany({
                    where: { id: { in: creatorIds } },
                    select: {
                        id: true,
                        clerkId: true,
                        firstName: true,
                        lastName: true,
                        role: true,
                    },
                });

                const clerk = await clerkClient();
                const usersMap = new Map();

                const clerkUsersResults = await Promise.allSettled(
                    dbUsers.map((u) => clerk.users.getUser(u.clerkId)),
                );

                dbUsers.forEach((dbU, index) => {
                    const result = clerkUsersResults[index];

                    if (result.status === "fulfilled") {
                        const clerkUser = result.value;
                        usersMap.set(dbU.id, {
                            firstName: dbU.firstName || clerkUser.firstName,
                            lastName: dbU.lastName || clerkUser.lastName,
                            role: dbU.role,
                            imageUrl: clerkUser.imageUrl,
                        });
                    } else {
                        usersMap.set(dbU.id, {
                            firstName: dbU.firstName,
                            lastName: dbU.lastName,
                            role: dbU.role,
                            imageUrl: null,
                        });
                    }
                });

                const updatedExpenses = expenses.map((expense) => ({
                    ...expense,
                    CreatedBy: usersMap.get(expense.createdById) || null,
                }));

                return res.status(200).json(updatedExpenses);
            } catch (error) {
                console.error("GET_EXPENSES_ERROR", error);
                return res.status(500).json({ error: "Internal Server Error" });
            }

        case "POST":
            try {
                const {
                    title,
                    category,
                    amount,
                    storeId: payloadStoreId,
                    notes,
                    date,
                } = req.body;

                if (!title || !category || amount === undefined) {
                    return res
                        .status(400)
                        .json({ error: "Missing required fields" });
                }

                let targetStoreId: string | null = null;

                if (role !== "admin") {
                    targetStoreId = userStoreId;
                } else {
                    const explicitStoreId = payloadStoreId || activeStoreHeader;
                    targetStoreId =
                        explicitStoreId &&
                        explicitStoreId !== "All" &&
                        explicitStoreId !== "all"
                            ? explicitStoreId
                            : null;
                }

                if (
                    targetStoreId === "" ||
                    targetStoreId === "null" ||
                    targetStoreId === "undefined"
                ) {
                    targetStoreId = null;
                }

                // Create Expense in Tenant DB
                const expense = await tenantPrisma.expense.create({
                    data: {
                        title,
                        category,
                        amount: parseFloat(amount),
                        notes: notes || null,
                        date: date ? new Date(date) : new Date(),
                        businessId, // Logical reference
                        storeId: targetStoreId,
                        createdById: masterUserId,
                    },
                });

                // NOTIFY via Novu (Master Plane context)
                await notifyBusinessStaff({
                    businessId,
                    workflowId: "expense-created",
                    payload: {
                        title: expense.title,
                        amount: String(expense.amount),
                        category: expense.category,
                        loggedBy: user.firstName
                            ? `${user.firstName} ${user.lastName || ""}`.trim()
                            : "Unknown User",
                    },
                    roles: ["admin"],
                });

                return res.status(201).json(expense);
            } catch (error) {
                console.error("POST_EXPENSE_ERROR", error);
                return res.status(500).json({ error: "Internal Server Error" });
            }

        default:
            res.setHeader("Allow", ["GET", "POST"]);
            return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

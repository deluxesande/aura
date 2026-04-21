import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/utils/lib/client";
import { notifyBusinessStaff } from "@/utils/server/novu";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { userId: clerkId } = getAuth(req);

    if (!clerkId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
        where: { clerkId },
        select: { id: true, businessId: true, role: true, storeId: true },
    });

    if (!user || !user.businessId) {
        return res.status(403).json({ error: "User or Business profile not found" });
    }

    const { businessId, role, storeId, id: userId } = user;
    const activeStoreHeader = req.headers["x-store-id"] as string;

    switch (req.method) {
        case "GET":
            try {
                const isAll = !activeStoreHeader || activeStoreHeader === "All" || activeStoreHeader === "all";
                const targetStoreId = role === "admin" ? (isAll ? null : activeStoreHeader) : storeId;

                const expenses = await prisma.expense.findMany({
                    where: {
                        businessId,
                        status: "ACTIVE",
                        ...(role === "admin" 
                            ? (targetStoreId ? { OR: [{ storeId: targetStoreId }, { storeId: null }] } : {})
                            : { storeId: targetStoreId } 
                        ),
                    },
                    include: {
                        Store: { select: { name: true } },
                    },
                    orderBy: { date: "desc" },
                });

                // Get creator IDs (internal User IDs), filtering out nulls
                const creatorIds = Array.from(new Set(expenses.map(e => e.createdById).filter(id => id !== null))) as string[];

                // Fetch internal users to get their clerkIds
                const dbUsers = await prisma.user.findMany({
                    where: { id: { in: creatorIds } },
                    select: {
                        id: true,
                        clerkId: true,
                        firstName: true,
                        lastName: true,
                        role: true,
                    }
                });

                const clerkIds = dbUsers.map(u => u.clerkId);

                // Fetch Clerk user details
                const clerk = await clerkClient();
                const clerkUsersResults = await Promise.allSettled(
                    clerkIds.map((cid) => clerk.users.getUser(cid))
                );

                const usersMap = new Map();
                dbUsers.forEach((dbU) => {
                    const result = clerkUsersResults.find(
                        (r) => r.status === "fulfilled" && r.value.id === dbU.clerkId
                    );

                    if (result && result.status === "fulfilled") {
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

                const updatedExpenses = expenses.map(expense => ({
                    ...expense,
                    CreatedBy: usersMap.get(expense.createdById) || null
                }));

                return res.status(200).json(updatedExpenses);
            } catch (error) {
                console.error("GET_EXPENSES_ERROR", error);
                return res.status(500).json({ error: "Internal Server Error" });
            }

        case "POST":
            try {
                const { title, category, amount, storeId: payloadStoreId, notes, date } = req.body;

                if (!title || !category || amount === undefined) {
                    return res.status(400).json({ error: "Missing required fields" });
                }

                let targetStoreId: string | null = null;
                
                if (role !== "admin") {
                    targetStoreId = storeId;
                } else {
                    const explicitStoreId = payloadStoreId || activeStoreHeader;
                    targetStoreId = (explicitStoreId && explicitStoreId !== "All" && explicitStoreId !== "all") 
                        ? explicitStoreId 
                        : null;
                }

                if (targetStoreId === "" || targetStoreId === "null" || targetStoreId === "undefined") {
                    targetStoreId = null;
                }

                const expense = await prisma.expense.create({
                    data: {
                        title,
                        category,
                        amount: parseFloat(amount),
                        notes: notes || null,
                        date: date ? new Date(date) : new Date(),
                        businessId,
                        storeId: targetStoreId,
                        createdById: userId,
                    },
                });

                // NOTIFY
                await notifyBusinessStaff({
                    businessId,
                    workflowId: "expense-created",
                    payload: {
                        title: expense.title,
                        amount: expense.amount,
                        category: expense.category,
                        loggedBy: clerkId, // Using clerkId as a temporary identifier
                    },
                    roles: ["admin"], // Only notify admins for expenses
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

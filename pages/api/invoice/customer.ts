import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/utils/lib/client";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { userId } = getAuth(req);
        const { customerId } = req.query;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        if (!customerId || typeof customerId !== "string") {
            return res.status(400).json({ error: "Customer ID is required" });
        }

        // Get current user with their business
        const currentUser = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { businessId: true },
        });

        if (!currentUser || !currentUser.businessId) {
            return res
                .status(404)
                .json({ error: "User or business not found" });
        }

        // Get all users in the same business (to ensure we only fetch invoices for this business)
        const businessUsers = await prisma.user.findMany({
            where: { businessId: currentUser.businessId },
            select: { clerkId: true },
        });

        const userIds = businessUsers.map((user) => user.clerkId);

        // Get invoices specifically for this customer, created by anyone in the business
        const invoices = await prisma.invoice.findMany({
            where: {
                customerId: customerId,
                createdBy: {
                    in: userIds,
                },
            },
            orderBy: {
                createdAt: "desc",
            },
            include: {
                invoiceItems: {
                    select: {
                        quantity: true,
                        Product: {
                            select: {
                                name: true,
                                price: true,
                            },
                        },
                    },
                },
                Customer: {
                    select: {
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });

        // Get Clerk client to fetch user images
        const clerk = await clerkClient();
        const usersMap = new Map();

        // Optimization: Only fetch unique creators from the filtered invoices
        const uniqueCreatorIds = Array.from(
            new Set(invoices.map((inv) => inv.createdBy).filter(Boolean))
        ) as string[];

        for (const clerkId of uniqueCreatorIds) {
            const dbUser = await prisma.user.findUnique({
                where: { clerkId },
                select: {
                    clerkId: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                },
            });

            if (dbUser) {
                try {
                    const clerkUser = await clerk.users.getUser(clerkId);
                    usersMap.set(clerkId, {
                        firstName: dbUser.firstName || clerkUser.firstName,
                        lastName: dbUser.lastName || clerkUser.lastName,
                        role: dbUser.role,
                        imageUrl: clerkUser.imageUrl,
                    });
                } catch (error) {
                    // If Clerk fetch fails, use database info only
                    usersMap.set(clerkId, {
                        firstName: dbUser.firstName,
                        lastName: dbUser.lastName,
                        role: dbUser.role,
                        imageUrl: "/images/user.png",
                    });
                }
            }
        }

        const updatedInvoices = invoices.map((invoice) => {
            let mostExpensiveItem: any = null;
            let totalQuantity = 0;

            invoice.invoiceItems.forEach((item) => {
                totalQuantity += item.quantity;
                if (
                    !mostExpensiveItem ||
                    item.Product.price > mostExpensiveItem.Product.price
                ) {
                    mostExpensiveItem = item;
                }
            });

            // Get creator user info
            const creator = invoice.createdBy
                ? usersMap.get(invoice.createdBy)
                : null;
            return {
                ...invoice,
                itemName: mostExpensiveItem?.Product.name,
                totalQuantity,
                creator: creator || null,
            };
        });

        res.status(200).json(updatedInvoices);
    } catch (error) {
        console.error("Error fetching customer invoices:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

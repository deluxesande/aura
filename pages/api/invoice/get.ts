import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/utils/lib/client";

export const getInvoices = async (
    req: NextApiRequest,
    res: NextApiResponse
) => {
    try {
        const { userId } = getAuth(req);

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
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

        // Get all users in the same business
        const businessUsers = await prisma.user.findMany({
            where: { businessId: currentUser.businessId },
            select: { clerkId: true },
        });

        const userIds = businessUsers.map((user) => user.clerkId);

        // Get invoices created by any user in the same business
        const invoices = await prisma.invoice.findMany({
            where: {
                createdBy: {
                    in: userIds,
                },
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
                    },
                },
            },
        });

        // Get Clerk client to fetch user images
        const clerk = await clerkClient();

        // Fetch user details from database and Clerk
        const usersMap = new Map();
        for (const clerkId of userIds) {
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
                        imageUrl: null,
                    });
                }
            }
        }

        const updatedInvoices = invoices.map((invoice) => {
            let mostExpensiveItem: any = null;
            let totalQuantity = 0;

            invoice.invoiceItems.forEach((item) => {
                // Calculate total quantity
                totalQuantity += item.quantity;

                // Check for most expensive item
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

            // Attach the most expensive item name and total quantity to the invoice object
            return {
                ...invoice,
                itemName: mostExpensiveItem?.Product.name,
                totalQuantity,
                creator: creator || null,
            };
        });

        res.status(200).json(updatedInvoices);
    } catch (error) {
        console.error("Error fetching invoices:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

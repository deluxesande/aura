import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
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

            // Attach the most expensive item name and total quantity to the invoice object
            return {
                ...invoice,
                itemName: mostExpensiveItem?.Product.name,
                totalQuantity,
            };
        });

        res.status(200).json(updatedInvoices);
    } catch (error) {
        console.error("Error fetching invoices:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

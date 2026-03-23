import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/utils/lib/client";

export const getInvoices = async (
    req: NextApiRequest,
    res: NextApiResponse,
) => {
    try {
        const { userId } = getAuth(req);

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // 1. Get current user with their business
        const currentUser = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { businessId: true },
        });

        if (!currentUser || !currentUser.businessId) {
            return res
                .status(404)
                .json({ error: "User or business not found" });
        }

        // SELF-HEALING LOGIC: Handle Inventory Sync (Restock & Re-deduct) - Isolated to THIS business

        // Find FAILED/CANCELLED invoices where stock hasn't been returned yet
        const failedInvoices = await prisma.invoice.findMany({
            where: {
                status: { in: ["FAILED", "CANCELLED"] },
                stockRestored: false,
                businessId: currentUser.businessId, // FIXED: Isolated to business
            },
            include: { invoiceItems: true },
        });

        if (failedInvoices.length > 0) {
            await prisma.$transaction(async (tx) => {
                for (const invoice of failedInvoices) {
                    for (const item of invoice.invoiceItems) {
                        await tx.product.update({
                            where: { id: item.productId },
                            data: {
                                quantity: { increment: item.quantity },
                                inStock: true,
                            },
                        });
                    }
                    await tx.invoice.update({
                        where: { id: invoice.id },
                        data: { stockRestored: true },
                    });
                }
            });
        }

        // Find PAID invoices that were previously restocked (e.g. late payment)
        const recoveredInvoices = await prisma.invoice.findMany({
            where: {
                status: { in: ["PAID", "COMPLETED"] },
                stockRestored: true, // This means we previously put items back! We must take them again.
                businessId: currentUser.businessId, // FIXED: Isolated to business
            },
            include: { invoiceItems: true },
        });

        if (recoveredInvoices.length > 0) {
            await prisma.$transaction(async (tx) => {
                for (const invoice of recoveredInvoices) {
                    for (const item of invoice.invoiceItems) {
                        const product = await tx.product.findUnique({
                            where: { id: item.productId },
                        });

                        if (product) {
                            const newQuantity =
                                product.quantity - item.quantity;
                            const isStillInStock = newQuantity > 0;

                            await tx.product.update({
                                where: { id: item.productId },
                                data: {
                                    quantity: { decrement: item.quantity },
                                    inStock: isStillInStock,
                                },
                            });
                        }
                    }
                    // Mark stockRestored as false because the items are "sold" again
                    await tx.invoice.update({
                        where: { id: invoice.id },
                        data: { stockRestored: false },
                    });
                }
            });
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
                                type: true,
                                attributeValues: {
                                    include: {
                                        attributeOption: true
                                    }
                                }
                            },
                        },
                    },
                },
                Customer: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                        phoneNumber: true,
                    },
                },
            },
        });

        // Get Clerk client to fetch user images
        const clerk = await clerkClient();

        // Fetch user details from database and Clerk in Parallel
        const dbUsers = await prisma.user.findMany({
            where: { clerkId: { in: userIds } },
            select: {
                clerkId: true,
                firstName: true,
                lastName: true,
                role: true,
            },
        });

        const clerkUsersResults = await Promise.allSettled(
            userIds.map((clerkId) => clerk.users.getUser(clerkId))
        );

        const usersMap = new Map();
        
        dbUsers.forEach((dbUser) => {
            const result = clerkUsersResults.find(
                (r) => r.status === "fulfilled" && r.value.id === dbUser.clerkId
            );

            if (result && result.status === "fulfilled") {
                const clerkUser = result.value;
                usersMap.set(dbUser.clerkId, {
                    firstName: dbUser.firstName || clerkUser.firstName,
                    lastName: dbUser.lastName || clerkUser.lastName,
                    role: dbUser.role,
                    imageUrl: clerkUser.imageUrl,
                });
            } else {
                usersMap.set(dbUser.clerkId, {
                    firstName: dbUser.firstName,
                    lastName: dbUser.lastName,
                    role: dbUser.role,
                    imageUrl: null,
                });
            }
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

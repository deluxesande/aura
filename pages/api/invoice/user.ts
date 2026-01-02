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
        const { userId: loggedInUserId } = getAuth(req);
        const { userId: targetUserId } = req.query;

        if (!loggedInUserId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        if (!targetUserId || typeof targetUserId !== "string") {
            return res
                .status(400)
                .json({ error: "Target User ID is required" });
        }

        // 1. Get current admin's business context
        const currentUser = await prisma.user.findUnique({
            where: { clerkId: loggedInUserId },
            select: { businessId: true },
        });

        if (!currentUser || !currentUser.businessId) {
            return res
                .status(404)
                .json({ error: "User or business not found" });
        }

        const targetUserVerification = await prisma.user.findFirst({
            where: {
                clerkId: targetUserId,
                businessId: currentUser.businessId,
            },
        });

        if (!targetUserVerification) {
            return res
                .status(403)
                .json({ error: "User not found in your business" });
        }

        const invoices = await prisma.invoice.findMany({
            where: {
                createdBy: targetUserId,
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

        const clerk = await clerkClient();
        let creatorInfo = {
            firstName: targetUserVerification.firstName,
            lastName: targetUserVerification.lastName,
            role: targetUserVerification.role,
            imageUrl: "/images/user.png",
        };

        try {
            const clerkUser = await clerk.users.getUser(targetUserId);
            creatorInfo = {
                firstName:
                    targetUserVerification.firstName || clerkUser.firstName,
                lastName: targetUserVerification.lastName || clerkUser.lastName,
                role: targetUserVerification.role,
                imageUrl: clerkUser.imageUrl,
            };
        } catch (error) {
            console.warn(`Could not fetch Clerk image for ${targetUserId}`);
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

            return {
                ...invoice,
                itemName: mostExpensiveItem?.Product.name,
                totalQuantity,
                creator: creatorInfo,
            };
        });

        res.status(200).json(updatedInvoices);
    } catch (error) {
        console.error("Error fetching user invoices:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

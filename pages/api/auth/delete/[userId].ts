// pages/api/auth/delete/[userId].ts
import { clerkClient } from "@clerk/nextjs/server";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/utils/lib/client";
import { Prisma } from "@prisma/client"; // <--- 1. Import Types

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { userId } = req.query;

    if (req.method !== "DELETE") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    if (!userId || typeof userId !== "string") {
        return res.status(400).json({ error: "Invalid userId" });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
            include: { Business: true },
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const client = await clerkClient();
        try {
            await client.users.deleteUser(userId);
        } catch (clerkError) {
            // Continue if Clerk user is missing
        }

        // 2. Explicitly type 'tx' to satisfy the linter
        await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const userInvoices = await tx.invoice.findMany({
                where: { createdBy: userId },
                select: { id: true },
            });
            const invoiceIds = userInvoices.map((inv) => inv.id);

            if (invoiceIds.length > 0) {
                await tx.successfulCallback.deleteMany({
                    where: { invoiceId: { in: invoiceIds } },
                });
                await tx.failedCallback.deleteMany({
                    where: { invoiceId: { in: invoiceIds } },
                });

                await tx.mpesaPayment.deleteMany({
                    where: {
                        OR: [
                            { invoiceId: { in: invoiceIds } },
                            { userId: user.id },
                        ],
                    },
                });
            }

            await tx.invoiceItem.deleteMany({
                where: { createdBy: userId },
            });

            await tx.invoice.deleteMany({
                where: { createdBy: userId },
            });

            await tx.customer.deleteMany({
                where: { createdBy: userId },
            });

            await tx.product.deleteMany({
                where: { createdBy: userId },
            });

            await tx.category.deleteMany({
                where: { createdBy: userId },
            });

            if (user.businessId) {
                await tx.mpesaPayment.deleteMany({
                    where: { businessId: user.businessId },
                });

                await tx.userInvitation.deleteMany({
                    where: { businessId: user.businessId },
                });

                await tx.user.deleteMany({
                    where: {
                        businessId: user.businessId,
                        clerkId: { not: userId },
                    },
                });

                await tx.business.delete({
                    where: { id: user.businessId },
                });
            }

            await tx.user.delete({
                where: { id: user.id },
            });
        });

        return res.status(200).json({
            message: "User and all associated data deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting user:", error);
        return res.status(500).json({
            error: "Error deleting user",
            details: error instanceof Error ? error.message : "Unknown error",
        });
    }
}

import { clerkClient } from "@clerk/nextjs/server";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/utils/lib/client";

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

        // 1. Delete from Clerk (Authentication)
        const client = await clerkClient();
        try {
            await client.users.deleteUser(userId);
        } catch (clerkError) {
            // Continue if Clerk user is missing
        }

        await prisma.$transaction(async (tx: any) => {
            if (user.role === "admin") {
                const userInvoices = await tx.invoice.findMany({
                    where: { createdBy: userId },
                    select: { id: true },
                });
                const invoiceIds = userInvoices.map((inv: any) => inv.id);

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
                await tx.invoice.deleteMany({ where: { createdBy: userId } });
                await tx.customer.deleteMany({ where: { createdBy: userId } });
                await tx.product.deleteMany({ where: { createdBy: userId } });
                await tx.category.deleteMany({ where: { createdBy: userId } });

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
            } else {
                // We set 'createdBy' to null so the records stay but don't point to the dead user.

                await tx.invoice.updateMany({
                    where: { createdBy: userId },
                    data: { createdBy: null },
                });

                await tx.invoiceItem.updateMany({
                    where: { createdBy: userId },
                    data: { createdBy: null },
                });

                await tx.product.updateMany({
                    where: { createdBy: userId },
                    data: { createdBy: null },
                });

                await tx.category.updateMany({
                    where: { createdBy: userId },
                    data: { createdBy: null },
                });

                await tx.customer.updateMany({
                    where: { createdBy: userId },
                    data: { createdBy: null },
                });

                // MpesaPayment has a strict 'userId' foreign key. We cannot set it to null.
                // We must reassign these payments to the Business Admin so the financial record is kept.
                if (user.businessId) {
                    const admin = await tx.user.findFirst({
                        where: { businessId: user.businessId, role: "admin" },
                        select: { id: true },
                    });

                    if (admin) {
                        await tx.mpesaPayment.updateMany({
                            where: { userId: user.id },
                            data: { userId: admin.id },
                        });
                    } else {
                        // Edge case: No admin found? We must delete the payments to allow user deletion.
                        // (The Invoices will survive because we unlinked them above)
                        await tx.mpesaPayment.deleteMany({
                            where: { userId: user.id },
                        });
                    }
                }

                if (user.email) {
                    await tx.userInvitation.deleteMany({
                        where: { email: user.email },
                    });
                }
            }

            await tx.user.delete({
                where: { id: user.id },
            });
        });

        return res.status(200).json({
            message: "User deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting user:", error);
        return res.status(500).json({
            error: "Error deleting user",
            details: error instanceof Error ? error.message : "Unknown error",
        });
    }
}

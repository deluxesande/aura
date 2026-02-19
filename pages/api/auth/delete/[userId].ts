import { clerkClient } from "@clerk/nextjs/server";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/utils/lib/client";
import { utapi, extractFileKey } from "@/utils/server/uploadthingServer";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
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

        if (user.role === "admin" && user.businessId) {
            const otherUsersCount = await prisma.user.count({
                where: {
                    businessId: user.businessId,
                    clerkId: { not: userId },
                },
            });

            if (otherUsersCount > 0) {
                return res.status(403).json({
                    error: "Forbidden",
                    details:
                        "You cannot delete your account while other team members are still in the business.",
                });
            }
        }

        if (user.role === "admin") {
            try {
                const productsWithImages = await prisma.product.findMany({
                    where: {
                        createdBy: userId,
                        image: { contains: "utfs.io" },
                    },
                    select: { image: true },
                });

                if (productsWithImages.length > 0) {
                    const fileKeys = productsWithImages
                        .map((p) => extractFileKey(p.image!))
                        .filter(Boolean) as string[];

                    if (fileKeys.length > 0) {
                        await utapi.deleteFiles(fileKeys);
                    }
                }
            } catch (utError) {
                console.error(
                    "Failed to clean up UploadThing images:",
                    utError,
                );
            }
        }

        let invoiceIds: string[] = [];
        let assigneeClerkId: string | null = null;
        let assigneeUuid: string | null = null;

        if (user.role === "admin") {
            const userInvoices = await prisma.invoice.findMany({
                where: { createdBy: userId },
                select: { id: true },
            });
            invoiceIds = userInvoices.map((inv: any) => inv.id);
        } else {
            let assignee = null;
            if (user.email && user.businessId) {
                const invitation = await prisma.userInvitation.findFirst({
                    where: { email: user.email, businessId: user.businessId },
                });
                if (invitation?.invitedBy) {
                    assignee = await prisma.user.findUnique({
                        where: { id: invitation.invitedBy },
                    });
                }
            }
            if (!assignee && user.businessId) {
                assignee = await prisma.user.findFirst({
                    where: { businessId: user.businessId, role: "admin" },
                });
            }
            if (assignee) {
                assigneeClerkId = assignee.clerkId;
                assigneeUuid = assignee.id;
            }
        }

        await prisma.$transaction(async (tx: any) => {
            if (user.role === "admin") {
                const tier1Deletes = [
                    tx.invoiceItem.deleteMany({ where: { createdBy: userId } }),
                    tx.customer.deleteMany({ where: { createdById: user.id } }),
                ];

                if (invoiceIds.length > 0) {
                    tier1Deletes.push(
                        tx.successfulCallback.deleteMany({
                            where: { invoiceId: { in: invoiceIds } },
                        }),
                        tx.failedCallback.deleteMany({
                            where: { invoiceId: { in: invoiceIds } },
                        }),
                    );
                }

                if (user.businessId || invoiceIds.length > 0) {
                    tier1Deletes.push(
                        tx.mpesaPayment.deleteMany({
                            where: {
                                OR: [
                                    { invoiceId: { in: invoiceIds } },
                                    { userId: user.id },
                                    {
                                        businessId:
                                            user.businessId || undefined,
                                    },
                                ],
                            },
                        }),
                    );
                }

                if (user.businessId) {
                    tier1Deletes.push(
                        tx.subscriptionPayment.deleteMany({
                            where: { userId: userId },
                        }),
                        tx.userInvitation.deleteMany({
                            where: { businessId: user.businessId },
                        }),
                    );
                }

                await Promise.all(tier1Deletes);

                const tier2Deletes = [
                    tx.invoice.deleteMany({ where: { createdBy: userId } }),
                    tx.product.deleteMany({ where: { createdBy: userId } }),
                    tx.category.deleteMany({ where: { createdBy: userId } }),
                ];

                if (user.businessId) {
                    tier2Deletes.push(
                        tx.subscription.deleteMany({
                            where: { businessId: user.businessId },
                        }),
                    );
                }

                await Promise.all(tier2Deletes);

                if (user.businessId) {
                    await tx.business.delete({
                        where: { id: user.businessId },
                    });
                }
            } else {
                if (assigneeClerkId && assigneeUuid) {
                    await Promise.all([
                        tx.invoice.updateMany({
                            where: { createdBy: userId },
                            data: { createdBy: assigneeClerkId },
                        }),
                        tx.invoiceItem.updateMany({
                            where: { createdBy: userId },
                            data: { createdBy: assigneeClerkId },
                        }),
                        tx.product.updateMany({
                            where: { createdBy: userId },
                            data: { createdBy: assigneeClerkId },
                        }),
                        tx.category.updateMany({
                            where: { createdBy: userId },
                            data: { createdBy: assigneeClerkId },
                        }),
                        tx.customer.updateMany({
                            where: { createdById: user.id },
                            data: { createdById: assigneeUuid },
                        }),
                        tx.mpesaPayment.updateMany({
                            where: { userId: user.id },
                            data: { userId: assigneeUuid },
                        }),
                    ]);
                }

                if (user.email) {
                    await tx.userInvitation.deleteMany({
                        where: { email: user.email },
                    });
                }
            }

            await tx.user.delete({ where: { id: user.id } });
        });

        const client = await clerkClient();
        try {
            await client.users.deleteUser(userId);
        } catch (clerkError) {
            console.warn("Clerk user already deleted or not found");
        }

        return res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Delete Error:", error);
        return res.status(500).json({
            error: "Error deleting user",
            details: error instanceof Error ? error.message : "Unknown error",
        });
    }
}

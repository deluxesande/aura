import { clerkClient } from "@clerk/nextjs/server";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/utils/lib/client";
import { utapi, extractFileKey } from "@/utils/server/uploadthingServer";

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

        // Check if admin has other users
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
                // Find all products created by this user that have UploadThing URLs
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
                        // Delete batch from UploadThing
                        await utapi.deleteFiles(fileKeys);
                    }
                }
            } catch (utError) {
                console.error(
                    "Failed to clean up UploadThing images, proceeding with DB deletion:",
                    utError
                );
            }
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

                if (user.businessId) {
                    await tx.subscriptionPayment.deleteMany({
                        where: { userId: userId },
                    });

                    await tx.subscription.deleteMany({
                        where: { businessId: user.businessId },
                    });
                }

                await tx.invoiceItem.deleteMany({
                    where: { createdBy: userId },
                });
                await tx.invoice.deleteMany({ where: { createdBy: userId } });

                await tx.customer.deleteMany({
                    where: { createdById: user.id },
                });

                await tx.product.deleteMany({ where: { createdBy: userId } });
                await tx.category.deleteMany({ where: { createdBy: userId } });

                if (user.businessId) {
                    await tx.mpesaPayment.deleteMany({
                        where: { businessId: user.businessId },
                    });
                    await tx.userInvitation.deleteMany({
                        where: { businessId: user.businessId },
                    });

                    await tx.business.delete({
                        where: { id: user.businessId },
                    });
                }
            } else {
                // REGULAR USER LOGIC (Reassignment)
                let assignee = null;

                if (user.email && user.businessId) {
                    const invitation = await tx.userInvitation.findFirst({
                        where: {
                            email: user.email,
                            businessId: user.businessId,
                        },
                    });

                    if (invitation && invitation.invitedBy) {
                        assignee = await tx.user.findUnique({
                            where: { id: invitation.invitedBy },
                        });
                    }
                }

                if (!assignee && user.businessId) {
                    assignee = await tx.user.findFirst({
                        where: {
                            businessId: user.businessId,
                            role: "admin",
                        },
                    });
                }

                if (assignee) {
                    const assigneeClerkId = assignee.clerkId;
                    const assigneeUuid = assignee.id;

                    await tx.invoice.updateMany({
                        where: { createdBy: userId },
                        data: { createdBy: assigneeClerkId },
                    });

                    await tx.invoiceItem.updateMany({
                        where: { createdBy: userId },
                        data: { createdBy: assigneeClerkId },
                    });

                    await tx.product.updateMany({
                        where: { createdBy: userId },
                        data: { createdBy: assigneeClerkId },
                    });

                    await tx.category.updateMany({
                        where: { createdBy: userId },
                        data: { createdBy: assigneeClerkId },
                    });

                    await tx.customer.updateMany({
                        where: { createdById: user.id },
                        data: { createdById: assigneeUuid },
                    });

                    await tx.mpesaPayment.updateMany({
                        where: { userId: user.id },
                        data: { userId: assigneeUuid },
                    });
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

        const client = await clerkClient();
        try {
            await client.users.deleteUser(userId);
        } catch (clerkError) {
            console.warn("Clerk user already deleted or not found");
        }

        return res.status(200).json({
            message: "User deleted successfully",
        });
    } catch (error) {
        console.error("Delete Error:", error);
        return res.status(500).json({
            error: "Error deleting user",
            details: error instanceof Error ? error.message : "Unknown error",
        });
    }
}

import { clerkClient } from "@clerk/nextjs/server";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/utils/lib/client";
import { utapi, extractFileKey } from "@/utils/server/uploadthingServer";

// Optional safety net: Tells Vercel to allow up to 30s just in case of a cold start.
// This code will normally run in < 1 second.
export const maxDuration = 30;

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
        });

        if (!user) {
            // Clean up Clerk if DB record is already missing to prevent ghost accounts
            const client = await clerkClient();
            await client.users.deleteUser(userId).catch(() => {});
            return res
                .status(200)
                .json({ message: "User not found in DB, cleaned up Clerk." });
        }

        const isAdmin = user.role === "admin";
        const hasBusiness = !!user.businessId;

        // 1. Validation (Fast check)
        if (isAdmin && hasBusiness) {
            const otherUsersCount = await prisma.user.count({
                where: {
                    businessId: user.businessId!,
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

        // 2. Pre-fetch required data outside the transaction concurrently
        // FIX: Added explicit Promise types to resolve TypeScript 'never[]' error
        let productsWithImagesPromise: Promise<{ image: string | null }[]> =
            Promise.resolve([]);
        let userInvoicesPromise: Promise<{ id: string }[]> = Promise.resolve(
            [],
        );
        let invitationPromise: Promise<any> = Promise.resolve(null);

        if (isAdmin) {
            productsWithImagesPromise = prisma.product.findMany({
                where: { createdBy: userId, image: { contains: "utfs.io" } },
                select: { image: true },
            });
            userInvoicesPromise = prisma.invoice.findMany({
                where: { createdBy: userId },
                select: { id: true },
            });
        } else if (hasBusiness && user.email) {
            invitationPromise = prisma.userInvitation.findFirst({
                where: { email: user.email, businessId: user.businessId! },
            });
        }

        const [productsWithImages, userInvoices, invitation] =
            await Promise.all([
                productsWithImagesPromise,
                userInvoicesPromise,
                invitationPromise,
            ]);

        const invoiceIds = userInvoices.map((inv) => inv.id);
        const fileKeys = productsWithImages
            .map((p) => extractFileKey(p.image!))
            .filter(Boolean) as string[];

        // Handle re-assignment logic for non-admins
        let assigneeClerkId: string | null = null;
        let assigneeUuid: string | null = null;

        if (!isAdmin && hasBusiness) {
            let assignee: any = null;
            if (invitation?.invitedBy) {
                assignee = await prisma.user.findUnique({
                    where: { id: invitation.invitedBy },
                });
            }
            if (!assignee) {
                assignee = await prisma.user.findFirst({
                    where: { businessId: user.businessId!, role: "admin" },
                });
            }
            if (assignee) {
                assigneeClerkId = assignee.clerkId;
                assigneeUuid = assignee.id;
            }
        }

        // 3. BACKGROUND TASKS
        // Fire-and-forget UploadThing deletion so we don't waste 2-3 seconds waiting for it.
        if (fileKeys.length > 0) {
            utapi
                .deleteFiles(fileKeys)
                .catch((e) => console.warn("UT Error:", e));
        }

        // 4. DATABASE DELETION TRANSACTION
        await prisma.$transaction(async (tx: any) => {
            if (isAdmin) {
                const tier1Deletes = [];

                // Short-circuit: Only run invoice-related queries if they actually have invoices
                if (invoiceIds.length > 0) {
                    tier1Deletes.push(
                        tx.invoiceItem.deleteMany({
                            where: { createdBy: userId },
                        }),
                        tx.successfulCallback.deleteMany({
                            where: { invoiceId: { in: invoiceIds } },
                        }),
                        tx.failedCallback.deleteMany({
                            where: { invoiceId: { in: invoiceIds } },
                        }),
                        tx.mpesaPayment.deleteMany({
                            where: {
                                OR: [
                                    { invoiceId: { in: invoiceIds } },
                                    { userId: user.id },
                                    ...(hasBusiness
                                        ? [{ businessId: user.businessId }]
                                        : []),
                                ],
                            },
                        }),
                    );
                } else {
                    // Lighter fallback if no invoices exist
                    tier1Deletes.push(
                        tx.mpesaPayment.deleteMany({
                            where: {
                                OR: [
                                    { userId: user.id },
                                    ...(hasBusiness
                                        ? [{ businessId: user.businessId }]
                                        : []),
                                ],
                            },
                        }),
                    );
                }

                if (hasBusiness) {
                    tier1Deletes.push(
                        tx.customer.deleteMany({
                            where: { createdById: user.id },
                        }),
                        tx.subscriptionPayment.deleteMany({
                            where: { userId: userId },
                        }),
                        tx.userInvitation.deleteMany({
                            where: { businessId: user.businessId },
                        }),
                    );
                }

                if (tier1Deletes.length > 0) await Promise.all(tier1Deletes);

                const tier2Deletes = [
                    tx.product.deleteMany({ where: { createdBy: userId } }),
                    tx.category.deleteMany({ where: { createdBy: userId } }),
                ];

                if (invoiceIds.length > 0) {
                    tier2Deletes.push(
                        tx.invoice.deleteMany({ where: { createdBy: userId } }),
                    );
                }

                if (hasBusiness) {
                    tier2Deletes.push(
                        tx.subscription.deleteMany({
                            where: { businessId: user.businessId },
                        }),
                    );
                }

                await Promise.all(tier2Deletes);

                if (hasBusiness) {
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

            // Finally, delete the user itself
            await tx.user.delete({ where: { id: user.id } });
        });

        // 5. Delete Clerk User (AFTER Database succeeds)
        const client = await clerkClient();
        await client.users.deleteUser(userId).catch((err) => {
            console.warn("Clerk user already deleted or not found");
        });

        return res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Delete Error:", error);
        return res.status(500).json({
            error: "Error deleting user",
            details: error instanceof Error ? error.message : "Unknown error",
        });
    }
}

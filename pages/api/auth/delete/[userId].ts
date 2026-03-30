import { clerkClient } from "@clerk/nextjs/server";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/utils/lib/client";
import { utapi, extractFileKey } from "@/utils/server/uploadthingServer";

export const maxDuration = 30;

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    const { userId } = req.query; // Clerk ID

    if (req.method !== "DELETE") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    if (!userId || typeof userId !== "string") {
        return res.status(400).json({ error: "Invalid userId" });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
            include: { Business: true }
        });

        if (!user) {
            const client = await clerkClient();
            await client.users.deleteUser(userId).catch(() => {});
            return res.status(200).json({ message: "User not found in DB, cleaned up Clerk." });
        }

        const isAdmin = user.role.toLowerCase() === "admin";
        const businessId = user.businessId;

        // 1. Validation: If Admin, only allow deletion if they are the ONLY user in the business
        if (isAdmin && businessId) {
            const otherUsersCount = await prisma.user.count({
                where: {
                    businessId: businessId,
                    clerkId: { not: userId },
                },
            });

            if (otherUsersCount > 0) {
                return res.status(403).json({
                    error: "Forbidden",
                    details: "Transfer ownership or delete other team members before deleting your admin account.",
                });
            }
        }

        // 2. Find a fallback user for re-assignment if this is NOT an admin-sole-user deletion
        let assigneeUuid: string | null = null;
        let assigneeClerkId: string | null = null;

        if (!isAdmin && businessId) {
            const adminUser = await prisma.user.findFirst({
                where: { businessId: businessId, role: "admin" },
            });
            if (adminUser) {
                assigneeUuid = adminUser.id;
                assigneeClerkId = adminUser.clerkId;
            }
        }

        // 3. Database Operations
        await prisma.$transaction(async (tx) => {
            if (isAdmin && businessId) {
                // COMPLETE BUSINESS PURGE
                // Delete everything linked to this businessId
                const bId = businessId;

                // Tier 1: Leaf nodes/Dependencies
                await tx.invoiceItem.deleteMany({ where: { Invoice: { businessId: bId } } });
                await tx.successfulCallback.deleteMany({ where: { Invoice: { businessId: bId } } });
                await tx.failedCallback.deleteMany({ where: { Invoice: { businessId: bId } } });
                await tx.mpesaPayment.deleteMany({ where: { businessId: bId } });
                await tx.storeInventory.deleteMany({ where: { Store: { businessId: bId } } });
                await tx.stockTransfer.deleteMany({ where: { OriginStore: { businessId: bId } } });
                await tx.purchaseOrderItem.deleteMany({ where: { PurchaseOrder: { businessId: bId } } });
                
                // Tier 2: Parent entities
                await tx.stockReceipt.deleteMany({ where: { businessId: bId } });
                await tx.purchaseOrder.deleteMany({ where: { businessId: bId } });
                await tx.delivery.deleteMany({ where: { businessId: bId } });
                await tx.invoice.deleteMany({ where: { businessId: bId } });
                await tx.expense.deleteMany({ where: { businessId: bId } });
                await tx.customer.deleteMany({ where: { businessId: bId } });
                await tx.product.deleteMany({ where: { businessId: bId } });
                await tx.category.deleteMany({ where: { businessId: bId } });
                await tx.supplier.deleteMany({ where: { businessId: bId } });
                await tx.userInvitation.deleteMany({ where: { businessId: bId } });
                await tx.subscriptionPayment.deleteMany({ where: { userId: userId } });
                await tx.subscription.deleteMany({ where: { businessId: bId } });
                await tx.kraTotReturn.deleteMany({ where: { businessId: bId } });
                await tx.kraDetails.deleteMany({ where: { businessId: bId } });
                
                // Tier 3: Stores and Business
                await tx.store.deleteMany({ where: { businessId: bId } });
                await tx.user.deleteMany({ where: { businessId: bId, clerkId: { not: userId } } });
                
                // Finally the user and business
                await tx.user.delete({ where: { id: user.id } });
                await tx.business.delete({ where: { id: bId } });
            } else {
                // STAFF MEMBER DELETION: Re-assign data to Admin
                if (assigneeUuid && assigneeClerkId) {
                    const staffId = user.id;
                    const staffClerkId = user.clerkId;

                    await tx.invoice.updateMany({ where: { createdBy: staffClerkId }, data: { createdBy: assigneeClerkId } });
                    await tx.invoiceItem.updateMany({ where: { createdBy: staffClerkId }, data: { createdBy: assigneeClerkId } });
                    await tx.product.updateMany({ where: { createdBy: staffClerkId }, data: { createdBy: assigneeClerkId } });
                    await tx.category.updateMany({ where: { createdBy: staffClerkId }, data: { createdBy: assigneeClerkId } });
                    await tx.customer.updateMany({ where: { createdById: staffId }, data: { createdById: assigneeUuid } });
                    await tx.supplier.updateMany({ where: { createdById: staffId }, data: { createdById: assigneeUuid } });
                    await tx.expense.updateMany({ where: { createdById: staffId }, data: { createdById: assigneeUuid } });
                    await tx.purchaseOrder.updateMany({ where: { createdById: staffId }, data: { createdById: assigneeUuid } });
                    await tx.stockReceipt.updateMany({ where: { createdById: staffId }, data: { createdById: assigneeUuid } });
                    await tx.stockTransfer.updateMany({ where: { createdById: staffId }, data: { createdById: assigneeUuid } });
                    await tx.delivery.updateMany({ where: { createdById: staffId }, data: { createdById: assigneeUuid } });
                    await tx.mpesaPayment.updateMany({ where: { userId: staffId }, data: { userId: assigneeUuid } });
                }

                // Cleanup invitations and delete user
                if (user.email) {
                    await tx.userInvitation.deleteMany({ where: { email: user.email } });
                }
                await tx.user.delete({ where: { id: user.id } });
            }
        }, { timeout: 30000 });

        // 4. Cleanup Clerk User
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

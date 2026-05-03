import { clerkClient } from "@clerk/nextjs/server";
import { NextApiRequest, NextApiResponse } from "next";
import { masterPrisma, getTenantPrisma } from "@/utils/lib/prisma";

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
        const user = await masterPrisma.user.findUnique({
            where: { clerkId: userId },
        });

        if (!user) {
            const client = await clerkClient();
            await client.users.deleteUser(userId).catch(() => {});
            return res.status(200).json({ message: "User not found in DB, cleaned up Clerk." });
        }

        const isAdmin = user.role.toLowerCase() === "admin";
        const businessId = user.businessId;

        if (!businessId) {
            // User without business, just delete
            await masterPrisma.user.delete({ where: { id: user.id } });
            const client = await clerkClient();
            await client.users.deleteUser(userId).catch(() => {});
            return res.status(200).json({ message: "User deleted successfully" });
        }

        const tenantPrisma = await getTenantPrisma(businessId);

        // 1. Validation: If Admin, only allow deletion if they are the ONLY user in the business
        if (isAdmin) {
            const otherUsersCount = await masterPrisma.user.count({
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

        if (!isAdmin) {
            const adminUser = await masterPrisma.user.findFirst({
                where: { businessId: businessId, role: "admin" },
            });
            if (adminUser) {
                assigneeUuid = adminUser.id;
                assigneeClerkId = adminUser.clerkId;
            }
        }

        // 3. Database Operations
        if (isAdmin) {
            // COMPLETE BUSINESS PURGE
            const bId = businessId;

            // Delete everything in Tenant DB
            await tenantPrisma.$transaction(async (tx) => {
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
                await tx.kraTotReturn.deleteMany({ where: { businessId: bId } });
                await tx.kraDetails.deleteMany({ where: { businessId: bId } });
                
                // Tier 3: Stores and Mirror Users
                await tx.store.deleteMany({ where: { businessId: bId } });
                await tx.tenantUser.deleteMany({ where: { clerkId: { not: userId } } }); // Note: clerkId used in TenantUser
                await tx.tenantUser.deleteMany({ where: { clerkId: userId } });
            });

            // Delete everything in Master DB
            await masterPrisma.$transaction(async (tx) => {
                await tx.userInvitation.deleteMany({ where: { businessId: bId } });
                await tx.subscriptionPayment.deleteMany({ where: { userId: userId } });
                await tx.subscription.deleteMany({ where: { businessId: bId } });
                await tx.user.deleteMany({ where: { businessId: bId, clerkId: { not: userId } } });
                await tx.user.delete({ where: { id: user.id } });
                await tx.business.delete({ where: { id: bId } });
            });
        } else {
            // STAFF MEMBER DELETION: Re-assign data to Admin
            if (assigneeUuid && assigneeClerkId) {
                const staffId = user.id;
                const staffClerkId = user.clerkId;

                await tenantPrisma.$transaction(async (tx) => {
                    await tx.invoice.updateMany({ where: { createdBy: staffClerkId }, data: { createdBy: assigneeClerkId } });
                    await tx.invoiceItem.updateMany({ where: { createdBy: staffClerkId }, data: { createdBy: assigneeClerkId } });
                    await tx.product.updateMany({ where: { createdBy: staffClerkId }, data: { createdBy: assigneeClerkId } });
                    await tx.category.updateMany({ where: { createdBy: staffClerkId }, data: { createdBy: assigneeClerkId } });
                    await tx.customer.updateMany({ where: { createdById: staffId }, data: { createdById: assigneeUuid as string } });
                    await tx.supplier.updateMany({ where: { createdById: staffId }, data: { createdById: assigneeUuid as string } });
                    await tx.expense.updateMany({ where: { createdById: staffId }, data: { createdById: assigneeUuid as string } });
                    await tx.purchaseOrder.updateMany({ where: { createdById: staffId }, data: { createdById: assigneeUuid as string } });
                    await tx.stockReceipt.updateMany({ where: { createdById: staffId }, data: { createdById: assigneeUuid as string } });
                    await tx.stockTransfer.updateMany({ where: { createdById: staffId }, data: { createdById: assigneeUuid as string } });
                    await tx.delivery.updateMany({ where: { createdById: staffId }, data: { createdById: assigneeUuid as string } });
                    await tx.mpesaPayment.updateMany({ where: { userId: staffId }, data: { userId: assigneeUuid as string } });
                    await tx.tenantUser.delete({ where: { clerkId: staffClerkId } });
                });
            }

            // Cleanup invitations and delete user from Master
            await masterPrisma.$transaction(async (tx) => {
                if (user.email) {
                    await tx.userInvitation.deleteMany({ where: { email: user.email } });
                }
                await tx.user.delete({ where: { id: user.id } });
            });
        }

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

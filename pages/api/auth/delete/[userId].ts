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
        const bId = businessId;

        const tenantTask = (async () => {
            if (isAdmin) {
                // COMPLETE BUSINESS PURGE in Tenant DB
                await tenantPrisma.$transaction(async (tx) => {
                    // Tier 1: Leaf nodes/Dependencies (Independent)
                    await Promise.all([
                        tx.invoiceItem.deleteMany({ where: { Invoice: { businessId: bId } } }),
                        tx.successfulCallback.deleteMany({ where: { Invoice: { businessId: bId } } }),
                        tx.failedCallback.deleteMany({ where: { Invoice: { businessId: bId } } }),
                        tx.mpesaPayment.deleteMany({ where: { businessId: bId } }),
                        tx.storeInventory.deleteMany({ where: { Store: { businessId: bId } } }),
                        tx.stockTransfer.deleteMany({ where: { OriginStore: { businessId: bId } } }),
                        tx.purchaseOrderItem.deleteMany({ where: { PurchaseOrder: { businessId: bId } } }),
                        tx.reconciliationItem.deleteMany({ where: { Reconciliation: { businessId: bId } } }),
                        tx.productAttributeValue.deleteMany({ where: { product: { businessId: bId } } }),
                        tx.stockReceipt.deleteMany({ where: { businessId: bId } }),
                    ]);
                    
                    // Tier 2: Intermediate Parents
                    await Promise.all([
                        tx.invoice.deleteMany({ where: { businessId: bId } }),
                        tx.purchaseOrder.deleteMany({ where: { businessId: bId } }),
                        tx.delivery.deleteMany({ where: { businessId: bId } }),
                        tx.inventoryReconciliation.deleteMany({ where: { businessId: bId } }),
                        tx.product.deleteMany({ where: { businessId: bId } }),
                        tx.attributeOption.deleteMany({ where: { attribute: { businessId: bId } } }),
                    ]);
                    
                    // Tier 3: Root Parents
                    await Promise.all([
                        tx.category.deleteMany({ where: { businessId: bId } }),
                        tx.customer.deleteMany({ where: { businessId: bId } }),
                        tx.supplier.deleteMany({ where: { businessId: bId } }),
                        tx.store.deleteMany({ where: { businessId: bId } }),
                        tx.attribute.deleteMany({ where: { businessId: bId } }),
                        tx.expense.deleteMany({ where: { businessId: bId } }),
                        tx.kraTotReturn.deleteMany({ where: { businessId: bId } }),
                        tx.kraDetails.deleteMany({ where: { businessId: bId } }),
                        tx.auditLog.deleteMany({ where: { businessId: bId } }),
                    ]);

                    // Tier 4: Tenant Users
                    await tx.tenantUser.deleteMany({ where: { businessId: bId } });
                }, { timeout: 25000 });
            } else if (assigneeUuid && assigneeClerkId) {
                // STAFF MEMBER DELETION: Re-assign data to Admin in Tenant DB
                const staffId = user.id;
                const staffClerkId = user.clerkId;

                await tenantPrisma.$transaction(async (tx) => {
                    await Promise.all([
                        tx.invoice.updateMany({ where: { createdBy: staffClerkId }, data: { createdBy: assigneeClerkId } }),
                        tx.invoiceItem.updateMany({ where: { createdBy: staffClerkId }, data: { createdBy: assigneeClerkId } }),
                        tx.product.updateMany({ where: { createdBy: staffClerkId }, data: { createdBy: assigneeClerkId } }),
                        tx.category.updateMany({ where: { createdBy: staffClerkId }, data: { createdBy: assigneeClerkId } }),
                        tx.customer.updateMany({ where: { createdById: staffId }, data: { createdById: assigneeUuid as string } }),
                        tx.supplier.updateMany({ where: { createdById: staffId }, data: { createdById: assigneeUuid as string } }),
                        tx.expense.updateMany({ where: { createdById: staffId }, data: { createdById: assigneeUuid as string } }),
                        tx.purchaseOrder.updateMany({ where: { createdById: staffId }, data: { createdById: assigneeUuid as string } }),
                        tx.stockReceipt.updateMany({ where: { createdById: staffId }, data: { createdById: assigneeUuid as string } }),
                        tx.stockTransfer.updateMany({ where: { createdById: staffId }, data: { createdById: assigneeUuid as string } }),
                        tx.delivery.updateMany({ where: { createdById: staffId }, data: { createdById: assigneeUuid as string } }),
                        tx.mpesaPayment.updateMany({ where: { userId: staffId }, data: { userId: assigneeUuid as string } }),
                    ]);
                    await tx.tenantUser.delete({ where: { clerkId: staffClerkId } });
                });
            }
        })();

        const masterTask = (async () => {
            if (isAdmin) {
                // Hierarchical deletion in Master DB to respect Foreign Keys
                await masterPrisma.$transaction(async (tx) => {
                    // 1. Delete all Leaf nodes across the business
                    await Promise.all([
                        tx.userInvitation.deleteMany({ where: { businessId: bId } }),
                        tx.subscriptionPayment.deleteMany({ where: { Subscription: { businessId: bId } } }),
                        tx.mpesaRouting.deleteMany({ where: { businessId: bId } }),
                    ]);

                    // 2. Delete intermediate Parents (other users, subscriptions)
                    await Promise.all([
                        tx.user.deleteMany({ where: { businessId: bId, clerkId: { not: userId } } }),
                        tx.subscription.deleteMany({ where: { businessId: bId } }),
                    ]);

                    // 3. Delete Root Parents (Admin user and Business)
                    await tx.user.delete({ where: { id: user.id } });
                    await tx.business.delete({ where: { id: bId } });
                }, { timeout: 20000 });
            } else {
                // STAFF MEMBER DELETION: Master DB Cleanup
                await masterPrisma.$transaction(async (tx) => {
                    // Delete invitations first (child) then the user (parent)
                    if (user.email) {
                        await tx.userInvitation.deleteMany({ where: { email: user.email } });
                    }
                    await tx.user.delete({ where: { id: user.id } });
                });
            }
        })();

        // Execute both database purges in parallel to beat the 10s limit
        await Promise.all([tenantTask, masterTask]);

        // 4. Cleanup Clerk User
        const client = await clerkClient();
        await client.users.deleteUser(userId).catch((err) => {
            console.warn("Clerk user already deleted or not found");
        });

        return res.status(200).json({ message: "User deleted successfully" });
    } catch (error: any) {
        console.error("Delete User Error:", {
            message: error.message,
            stack: error.stack
        });
        return res.status(500).json({
            error: "An unexpected error occurred while deleting the user",
        });
    }
}

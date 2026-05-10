import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import { masterPrisma, getTenantPrisma } from "@/utils/lib/prisma";
import { logAction } from "@/utils/server/audit";
import { verifyStoreAccess } from "@/utils/server/auth";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    const { userId: clerkId } = getAuth(req);
    if (!clerkId) return res.status(401).json({ error: "Unauthorized" });

    // 1. Fetch User and Business context from Master DB
    const user = await masterPrisma.user.findUnique({
        where: { clerkId },
        select: { id: true, businessId: true, role: true },
    });

    if (!user || !user.businessId) {
        return res.status(403).json({ error: "Access denied." });
    }

    const businessId = user.businessId;
    const tenantPrisma = await getTenantPrisma(businessId);

    if (req.method === "GET") {
        try {
            const reconciliations = await tenantPrisma.inventoryReconciliation.findMany({
                where: { businessId: businessId },
                orderBy: { createdAt: "desc" },
                include: {
                    Store: { select: { name: true } },
                    User: { select: { firstName: true, lastName: true } }, // Synced TenantUser
                    items: {
                        include: {
                            Product: { select: { name: true, sku: true } },
                        },
                    },
                },
            });
            return res.status(200).json(reconciliations);
        } catch (error) {
            console.error("GET_RECONCILIATION_ERROR", error);
            return res.status(500).json({ error: "Failed to fetch reconciliation history" });
        }
    }

    if (req.method === "POST") {
        if (user.role === "user") {
            return res.status(403).json({ error: "Access denied. Managers or Admins only." });
        }

        try {
            const { storeId, reference, notes, items } = req.body;

            if (!storeId || !items || !Array.isArray(items) || items.length === 0) {
                return res.status(400).json({ error: "Missing required reconciliation data." });
            }

            // Verify store access to prevent leakage
            const validatedStoreId = await verifyStoreAccess(businessId, storeId);
            if (!validatedStoreId) {
                return res.status(403).json({ error: "Unauthorized store access" });
            }

            const result = await tenantPrisma.$transaction(async (tx) => {
                const reconciliation = await tx.inventoryReconciliation.create({
                    data: {
                        reference: reference || null,
                        notes: notes || null,
                        storeId: validatedStoreId,
                        userId: user.id,
                        businessId: businessId, // Logical reference
                    },
                });

                for (const item of items) {
                    const { productId, physicalQuantity } = item;
                    
                    const inventory = await tx.storeInventory.findUnique({
                        where: {
                            storeId_productId: {
                                storeId: validatedStoreId,
                                productId,
                            },
                        },
                    });

                    const pendingPOItems = await tx.purchaseOrderItem.findMany({
                        where: {
                            productId,
                            PurchaseOrder: {
                                storeId: validatedStoreId,
                                status: { in: ["PENDING", "IN_TRANSIT"] },
                                isDeleted: false,
                            },
                        },
                        select: { quantity: true },
                    });

                    const inventoryQty = inventory?.quantity || 0;
                    const pendingQty = pendingPOItems.reduce((sum, po) => sum + po.quantity, 0);
                    
                    const systemQuantity = inventoryQty + pendingQty;
                    const discrepancy = physicalQuantity - systemQuantity;

                    await tx.reconciliationItem.create({
                        data: {
                            reconciliationId: reconciliation.id,
                            productId,
                            systemQuantity,
                            physicalQuantity,
                            discrepancy,
                            businessId: businessId,
                        },
                    });

                    await tx.storeInventory.upsert({
                        where: {
                            storeId_productId: {
                                storeId: validatedStoreId,
                                productId,
                            },
                        },
                        update: {
                            quantity: physicalQuantity,
                        },
                        create: {
                            storeId: validatedStoreId,
                            productId,
                            quantity: physicalQuantity,
                            businessId: businessId,
                        },
                    });
                }

                return reconciliation;
            });

            // Log Audit Action (tenantPrisma)
            await logAction({
                action: "INVENTORY_RECONCILIATION",
                entityType: "INVENTORY_RECONCILIATION",
                entityId: result.id,
                details: { storeId, reference, itemsCount: items.length },
                userId: user.id,
                businessId: businessId,
                ipAddress: req.headers["x-forwarded-for"] as string || req.socket.remoteAddress,
                userAgent: req.headers["user-agent"],
            });

            return res.status(201).json(result);
        } catch (error: any) {
            console.error("POST_RECONCILIATION_ERROR", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }

    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
}

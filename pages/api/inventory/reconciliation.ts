import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/utils/lib/client";
import { logAction } from "@/utils/server/audit";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    const { userId: clerkId } = getAuth(req);
    if (!clerkId) return res.status(401).json({ error: "Unauthorized" });

    const user = await prisma.user.findUnique({
        where: { clerkId },
        select: { id: true, businessId: true, role: true },
    });

    if (!user || !user.businessId) {
        return res.status(403).json({ error: "Access denied." });
    }

    if (req.method === "GET") {
        try {
            const reconciliations = await prisma.inventoryReconciliation.findMany({
                where: { businessId: user.businessId },
                orderBy: { createdAt: "desc" },
                include: {
                    Store: { select: { name: true } },
                    User: { select: { firstName: true, lastName: true } },
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

            const result = await prisma.$transaction(async (tx) => {
                const reconciliation = await tx.inventoryReconciliation.create({
                    data: {
                        reference: reference || null,
                        notes: notes || null,
                        storeId,
                        userId: user.id,
                        businessId: user.businessId!,
                    },
                });

                for (const item of items) {
                    const { productId, physicalQuantity } = item;
                    
                    // Get current system quantity
                    const inventory = await tx.storeInventory.findUnique({
                        where: {
                            storeId_productId: {
                                storeId,
                                productId,
                            },
                        },
                    });

                    const systemQuantity = inventory?.quantity || 0;
                    const discrepancy = physicalQuantity - systemQuantity;

                    await tx.reconciliationItem.create({
                        data: {
                            reconciliationId: reconciliation.id,
                            productId,
                            systemQuantity,
                            physicalQuantity,
                            discrepancy,
                        },
                    });

                    // Update system quantity to match physical count
                    await tx.storeInventory.upsert({
                        where: {
                            storeId_productId: {
                                storeId,
                                productId,
                            },
                        },
                        update: {
                            quantity: physicalQuantity,
                        },
                        create: {
                            storeId,
                            productId,
                            quantity: physicalQuantity,
                        },
                    });
                }

                return reconciliation;
            });

            // Log the action
            await logAction({
                action: "INVENTORY_RECONCILIATION",
                entityType: "INVENTORY_RECONCILIATION",
                entityId: result.id,
                details: { storeId, reference, itemsCount: items.length },
                userId: user.id,
                businessId: user.businessId,
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

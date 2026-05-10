import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import { masterPrisma as prisma, getTenantPrisma } from "@/utils/lib/prisma";
import { logAction } from "@/utils/server/audit";
import { verifyStoreAccess } from "@/utils/server/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") return res.status(405).end();
    const { userId: clerkId } = getAuth(req);
    const { orderId } = req.query;
    if (!clerkId || typeof orderId !== "string") return res.status(401).json({ error: "Unauthorized" });

    const user = await prisma.user.findUnique({
        where: { clerkId },
        select: { id: true, businessId: true },
    });

    if (!user || !user.businessId) return res.status(403).json({ error: "Forbidden" });
    const { businessId, id: userId } = user;
    const tenantPrisma = await getTenantPrisma(businessId);

    try {
        const { items, storeId, reference } = req.body; // items: { productId, receivedQty, unitCost }[]

        if (!items || !storeId) return res.status(400).json({ error: "Missing items or storeId" });

        // Verify store access to prevent leakage
        const validatedStoreId = await verifyStoreAccess(businessId, storeId);
        if (!validatedStoreId) {
            return res.status(403).json({ error: "Unauthorized store access" });
        }

        const result = await tenantPrisma.$transaction(async (tx) => {
            // 1. Verify PO belongs to business
            const poToUpdate = await tx.purchaseOrder.findFirst({
                where: { id: orderId, businessId },
            });
            if (!poToUpdate) throw new Error("Purchase Order not found");

            // 2. Update PO Status
            const po = await tx.purchaseOrder.update({
                where: { id: orderId },
                data: { status: "DELIVERED" },
            });

            for (const item of items) {
                const qty = parseInt(item.receivedQty);
                const cost = parseFloat(item.unitCost);

                // 2. Create Stock Receipt
                await tx.stockReceipt.create({
                    data: {
                        quantity: qty,
                        unitCost: cost,
                        totalCost: qty * cost,
                        reference: reference || po.reference,
                        productId: item.productId,
                        storeId: validatedStoreId,
                        supplierId: po.supplierId,
                        businessId: businessId,
                        createdById: userId,
                    },
                });

                // 3. Update Store Inventory (Upsert)
                await tx.storeInventory.upsert({
                    where: {
                        storeId_productId: { storeId: validatedStoreId, productId: item.productId },
                    },
                    update: {
                        quantity: { increment: qty },
                    },
                    create: {
                        storeId: validatedStoreId,
                        productId: item.productId,
                        quantity: qty,
                        businessId: businessId,
                    },
                });

                // 4. Ensure product is marked as inStock
                await tx.product.update({
                    where: { id: item.productId },
                    data: { inStock: true },
                });
            }

            return { success: true, reference: reference || po.reference };
        });

        // Log Audit Action
        await logAction({
            action: "PROCESS_DELIVERY",
            entityType: "STOCK_RECEIPT",
            entityId: orderId,
            details: { reference: result.reference, itemsCount: items.length, storeId },
            userId: user.id,
            businessId: user.businessId,
            ipAddress: req.headers["x-forwarded-for"] as string || req.socket.remoteAddress,
            userAgent: req.headers["user-agent"],
        });

        return res.status(200).json(result);
    } catch (error) {
        console.error("DELIVERY_PROCESS_ERROR", error);
        return res.status(500).json({ error: "Delivery processing failed" });
    }
}


import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/utils/lib/client";

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
    const { businessId } = user;

    try {
        const { items, storeId, reference } = req.body; // items: { productId, receivedQty, unitCost }[]

        if (!items || !storeId) return res.status(400).json({ error: "Missing items or storeId" });

        const result = await prisma.$transaction(async (tx) => {
            // 1. Update PO Status
            const po = await tx.purchaseOrder.update({
                where: { id: orderId, businessId },
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
                        storeId: storeId,
                        supplierId: po.supplierId,
                        businessId: businessId,
                        createdBy: clerkId,
                    },
                });

                // 3. Update Store Inventory (Upsert)
                await tx.storeInventory.upsert({
                    where: {
                        storeId_productId: { storeId, productId: item.productId },
                    },
                    update: {
                        quantity: { increment: qty },
                    },
                    create: {
                        storeId,
                        productId: item.productId,
                        quantity: qty,
                    },
                });

                // 4. Ensure product is marked as inStock
                await tx.product.update({
                    where: { id: item.productId },
                    data: { inStock: true },
                });
            }

            return { success: true };
        });

        return res.status(200).json(result);
    } catch (error) {
        console.error("DELIVERY_PROCESS_ERROR", error);
        return res.status(500).json({ error: "Delivery processing failed" });
    }
}

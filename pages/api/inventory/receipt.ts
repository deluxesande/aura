import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/utils/lib/client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        res.setHeader("Allow", ["POST"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { userId: clerkId } = getAuth(req);
    if (!clerkId) return res.status(401).json({ error: "Unauthorized" });

    const user = await prisma.user.findUnique({
        where: { clerkId },
        select: { id: true, businessId: true, role: true },
    });

    if (!user || !user.businessId || user.role === "user") {
        return res.status(403).json({ error: "Access denied. Managers or Admins only." });
    }

    try {
        const { productId, storeId, supplierId, quantity, unitCost, reference, notes } = req.body;

        if (!productId || !storeId || !quantity || !unitCost) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const qty = parseInt(quantity);
        const uCost = parseFloat(unitCost);
        const tCost = qty * uCost;

        const result = await prisma.$transaction(async (tx) => {
            // 1. Create Stock Receipt record
            const receipt = await tx.stockReceipt.create({
                data: {
                    quantity: qty,
                    unitCost: uCost,
                    totalCost: tCost,
                    reference: reference || null,
                    notes: notes || null,
                    productId,
                    storeId,
                    supplierId: (supplierId && supplierId !== "null" && supplierId !== "") ? supplierId : null,
                    createdById: user.id,
                    businessId: user.businessId!,
                },
            });

            // 2. Update Store Inventory
            const inventory = await tx.storeInventory.upsert({
                where: {
                    storeId_productId: { storeId, productId },
                },
                update: {
                    quantity: { increment: qty },
                },
                create: {
                    storeId,
                    productId,
                    quantity: qty,
                },
            });

            // 3. Mark Product as inStock
            await tx.product.update({
                where: { id: productId },
                data: { inStock: true }
            });

            return { receipt, inventory };
        });

        return res.status(201).json(result);
    } catch (error) {
        console.error("STOCK_RECEIPT_ERROR", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

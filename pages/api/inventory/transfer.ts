import { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/utils/lib/client";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    if (req.method !== "POST") return res.status(405).end();

    const { userId: clerkId } = getAuth(req);
    if (!clerkId) return res.status(401).json({ error: "Unauthorized" });

    const { productId, fromStoreId, toStoreId, quantity } = req.body;

    if (
        !productId ||
        !fromStoreId ||
        !toStoreId ||
        !quantity ||
        quantity <= 0
    ) {
        return res.status(400).json({ error: "Invalid transfer parameters." });
    }

    if (fromStoreId === toStoreId) {
        return res
            .status(400)
            .json({ error: "Cannot transfer to the same branch." });
    }

    try {
        const requestor = await prisma.user.findUnique({
            where: { clerkId },
            select: { businessId: true, role: true },
        });

        if (!requestor || !requestor.businessId) {
            return res
                .status(403)
                .json({ error: "Forbidden: No business linked." });
        }

        if (requestor.role !== "admin" && requestor.role !== "manager") {
            return res
                .status(403)
                .json({ error: "Insufficient permissions to transfer stock." });
        }

        const parsedQty = Number(quantity);

        const result = await prisma.$transaction(async (tx) => {
            // 1. Fetch origin stock and lock row via dummy update or rely on tx isolation
            const originStock = await tx.storeInventory.findFirst({
                where: {
                    storeId: fromStoreId,
                    productId: productId,
                    businessId: requestor.businessId,
                },
            });

            if (!originStock || originStock.quantity < parsedQty) {
                throw new Error("Insufficient stock at the origin branch.");
            }

            // 2. Decrement origin stock safely
            await tx.storeInventory.update({
                where: { id: originStock.id },
                data: { quantity: { decrement: parsedQty } },
            });

            // 3. Find destination stock
            const destStock = await tx.storeInventory.findFirst({
                where: {
                    storeId: toStoreId,
                    productId: productId,
                    businessId: requestor.businessId,
                },
            });

            // 4. Increment existing or create new destination stock
            if (destStock) {
                await tx.storeInventory.update({
                    where: { id: destStock.id },
                    data: { quantity: { increment: parsedQty } },
                });
            } else {
                await tx.storeInventory.create({
                    data: {
                        storeId: toStoreId,
                        productId: productId,
                        businessId: requestor.businessId,
                        quantity: parsedQty,
                    },
                });
            }

            return true;
        });

        return res
            .status(200)
            .json({ message: "Stock transferred successfully", result });
    } catch (error: any) {
        console.error("Stock Transfer Error:", error);
        return res
            .status(400)
            .json({ error: error.message || "Failed to transfer stock" });
    }
}

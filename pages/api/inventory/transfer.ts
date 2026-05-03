import { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import { masterPrisma, getTenantPrisma } from "@/utils/lib/prisma";

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
        // 1. Fetch Requestor context from Master DB
        const requestor = await masterPrisma.user.findUnique({
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

        const businessId = requestor.businessId;
        const tenantPrisma = await getTenantPrisma(businessId);
        const parsedQty = Number(quantity);

        // 2. Perform Atomic Transfer in Tenant DB
        const result = await tenantPrisma.$transaction(async (tx) => {
            const originStock = await tx.storeInventory.findFirst({
                where: {
                    storeId: fromStoreId,
                    productId: productId,
                    Store: { businessId: businessId },
                },
            });

            if (!originStock || originStock.quantity < parsedQty) {
                throw new Error("Insufficient stock at the origin branch.");
            }

            await tx.storeInventory.update({
                where: { id: originStock.id },
                data: { quantity: { decrement: parsedQty } },
            });

            const destStock = await tx.storeInventory.findFirst({
                where: {
                    storeId: toStoreId,
                    productId: productId,
                    Store: { businessId: businessId },
                },
            });

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

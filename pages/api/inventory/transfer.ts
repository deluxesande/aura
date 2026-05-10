import { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import { masterPrisma, getTenantPrisma } from "@/utils/lib/prisma";
import { verifyStoreAccess } from "@/utils/server/auth";

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

        // Verify store access to prevent leakage
        const [vFromStoreId, vToStoreId] = await Promise.all([
            verifyStoreAccess(businessId, fromStoreId),
            verifyStoreAccess(businessId, toStoreId)
        ]);

        if (!vFromStoreId || !vToStoreId) {
            return res.status(403).json({ error: "Unauthorized store access" });
        }

        const tenantPrisma = await getTenantPrisma(businessId);
        const parsedQty = Number(quantity);

        // 2. Perform Atomic Transfer in Tenant DB
        const result = await tenantPrisma.$transaction(async (tx) => {
            const originStock = await tx.storeInventory.findFirst({
                where: {
                    storeId: vFromStoreId,
                    productId: productId,
                    businessId: businessId,
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
                    storeId: vToStoreId,
                    productId: productId,
                    businessId: businessId,
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
                        storeId: vToStoreId,
                        productId: productId,
                        quantity: parsedQty,
                        businessId: businessId,
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

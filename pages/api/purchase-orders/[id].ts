import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/utils/lib/client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { userId: clerkId } = getAuth(req);
    const { id } = req.query;
    if (!clerkId || typeof id !== "string") return res.status(401).json({ error: "Unauthorized" });

    const user = await prisma.user.findUnique({
        where: { clerkId },
        select: { id: true, businessId: true },
    });

    if (!user || !user.businessId) return res.status(403).json({ error: "Forbidden" });
    const { businessId } = user;

    switch (req.method) {
        case "GET":
            try {
                const po = await prisma.purchaseOrder.findFirst({
                    where: { id, businessId, isDeleted: false },
                    include: { 
                        Supplier: true, 
                        items: { include: { Product: { select: { name: true, sku: true } } } } 
                    },
                });
                if (!po) return res.status(404).json({ error: "PO not found" });
                return res.status(200).json(po);
            } catch (error) {
                return res.status(500).json({ error: "Fetch failed" });
            }

        case "PATCH":
            try {
                const { supplierId, storeId, reference, totalAmount, status, items } = req.body;

                const result = await prisma.$transaction(async (tx) => {
                    // 1. Delete existing items
                    await tx.purchaseOrderItem.deleteMany({ where: { purchaseOrderId: id } });

                    // 2. Update PO and recreate items
                    return await tx.purchaseOrder.update({
                        where: { id, businessId },
                        data: {
                            supplierId,
                            storeId: storeId || null,
                            reference,
                            totalAmount: parseFloat(totalAmount),
                            status,
                            items: {
                                create: items.map((item: any) => ({
                                    productId: item.productId,
                                    quantity: parseInt(item.quantity),
                                    unitCost: parseFloat(item.unitCost),
                                })),
                            },
                        },
                        include: { items: true },
                    });
                });
                return res.status(200).json(result);
            } catch (error) {
                console.error("PATCH_PO_ERROR", error);
                return res.status(500).json({ error: "Update failed" });
            }

        case "DELETE":
            try {
                await prisma.purchaseOrder.update({
                    where: { id, businessId },
                    data: { isDeleted: true },
                });
                return res.status(200).json({ message: "PO soft-deleted" });
            } catch (error) {
                return res.status(500).json({ error: "Delete failed" });
            }

        default:
            res.setHeader("Allow", ["GET", "PATCH", "DELETE"]);
            return res.status(405).end();
    }
}

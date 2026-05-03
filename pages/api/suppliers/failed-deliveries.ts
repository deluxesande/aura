import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import { masterPrisma, getTenantPrisma } from "@/utils/lib/prisma";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { userId: clerkId } = getAuth(req);
        if (!clerkId) return res.status(401).json({ error: "Unauthorized" });

        const user = await masterPrisma.user.findUnique({
            where: { clerkId },
            select: { id: true, businessId: true },
        });

        if (!user || !user.businessId) {
            return res.status(403).json({ error: "Forbidden" });
        }

        const businessId = user.businessId;
        const tenantPrisma = await getTenantPrisma(businessId);

        // Fetch deliveries that are linked to a PurchaseOrder
        const deliveries = await tenantPrisma.delivery.findMany({
            where: {
                businessId,
                purchaseOrderId: { not: null },
            },
            include: {
                PurchaseOrder: {
                    include: {
                        items: {
                            include: {
                                Product: { select: { name: true, sku: true } },
                            },
                        },
                    },
                },
                receipts: {
                    include: {
                        Product: { select: { name: true, sku: true } },
                    },
                },
                Supplier: { select: { name: true } },
                Store: { select: { name: true } },
            },
            orderBy: { createdAt: "desc" },
        });

        const failedDeliveries = [];

        for (const delivery of deliveries) {
            if (!delivery.PurchaseOrder) continue;

            const poItems = delivery.PurchaseOrder.items;
            const receipts = delivery.receipts;

            const discrepancies = [];
            let isFailed = false;

            // Check for missing items or shortfalls
            for (const poItem of poItems) {
                const receipt = receipts.find(
                    (r: any) => r.productId === poItem.productId
                );

                if (!receipt) {
                    isFailed = true;
                    discrepancies.push({
                        productName: poItem.Product.name,
                        sku: poItem.Product.sku,
                        expected: poItem.quantity,
                        received: 0,
                        type: "MISSING",
                    });
                } else if (receipt.quantity < poItem.quantity) {
                    isFailed = true;
                    discrepancies.push({
                        productName: poItem.Product.name,
                        sku: poItem.Product.sku,
                        expected: poItem.quantity,
                        received: receipt.quantity,
                        type: "SHORTFALL",
                    });
                }
            }

            if (isFailed) {
                failedDeliveries.push({
                    id: delivery.id,
                    reference: delivery.reference,
                    poReference: delivery.PurchaseOrder.reference,
                    supplierName: delivery.Supplier?.name || "Direct / Cash",
                    storeName: delivery.Store?.name || "Unknown Branch",
                    createdAt: delivery.createdAt,
                    discrepancies,
                });
            }
        }

        return res.status(200).json(failedDeliveries);
    } catch (error) {
        console.error("GET_FAILED_DELIVERIES_ERROR", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

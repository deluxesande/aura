import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/utils/lib/client";

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
            const deliveries = await prisma.delivery.findMany({
                where: { businessId: user.businessId },
                orderBy: { createdAt: "desc" },
                include: {
                    Store: { select: { name: true } },
                    Supplier: { select: { name: true } },
                    PurchaseOrder: { select: { reference: true, id: true } },
                    CreatedBy: {
                        select: {
                            firstName: true,
                            lastName: true,
                            role: true,
                            clerkId: true,
                        },
                    },
                    receipts: {
                        include: {
                            Product: { select: { name: true, sku: true } },
                        },
                    },
                },
            });

            const clerk = await clerkClient();
            const clerkIds = Array.from(
                new Set(
                    deliveries.map((d) => d.CreatedBy?.clerkId).filter(Boolean),
                ),
            );

            const clerkUsersResults = await Promise.allSettled(
                clerkIds.map((id) => clerk.users.getUser(id as string)),
            );

            const imageMap = new Map();
            clerkUsersResults.forEach((result) => {
                if (result.status === "fulfilled") {
                    imageMap.set(result.value.id, result.value.imageUrl);
                }
            });

            const deliveriesWithImages = deliveries.map((delivery) => {
                const clerkUserImg = delivery.CreatedBy?.clerkId
                    ? imageMap.get(delivery.CreatedBy.clerkId)
                    : null;
                return {
                    ...delivery,
                    creator: delivery.CreatedBy
                        ? {
                              firstName: delivery.CreatedBy.firstName,
                              lastName: delivery.CreatedBy.lastName,
                              role: delivery.CreatedBy.role,
                              imageUrl: clerkUserImg || "/images/user.png",
                          }
                        : null,
                };
            });

            return res.status(200).json(deliveriesWithImages);
        } catch (error) {
            console.error("GET_DELIVERIES_ERROR", error);
            return res
                .status(500)
                .json({ error: "Failed to fetch delivery history" });
        }
    }

    if (req.method === "POST") {
        if (user.role === "user") {
            return res
                .status(403)
                .json({ error: "Access denied. Managers or Admins only." });
        }

        try {
            const {
                storeId,
                supplierId,
                purchaseOrderId,
                reference,
                items,
                productId,
                quantity,
                unitCost,
            } = req.body;

            if (!storeId) {
                return res
                    .status(400)
                    .json({ error: "Missing required storeId field" });
            }

            let normalizedItems = [];
            if (items && Array.isArray(items) && items.length > 0) {
                normalizedItems = items;
            } else if (productId && quantity && unitCost) {
                normalizedItems = [{ productId, quantity, unitCost }];
            } else {
                return res
                    .status(400)
                    .json({ error: "Missing required item data." });
            }

            let totalDeliveryCost = 0;

            for (const item of normalizedItems) {
                if (
                    !item.productId ||
                    item.quantity == null ||
                    item.unitCost == null
                ) {
                    return res
                        .status(400)
                        .json({
                            error: "One or more items are missing a product, quantity, or cost.",
                        });
                }
                const qty = parseInt(item.quantity.toString());
                const uCost = parseFloat(item.unitCost.toString());
                totalDeliveryCost += qty * uCost;
            }

            const result = await prisma.$transaction(async (tx) => {
                const delivery = await tx.delivery.create({
                    data: {
                        reference: reference || null,
                        totalCost: totalDeliveryCost,
                        storeId,
                        supplierId:
                            supplierId &&
                            supplierId !== "null" &&
                            supplierId !== ""
                                ? supplierId
                                : null,
                        purchaseOrderId:
                            purchaseOrderId &&
                            purchaseOrderId !== "null" &&
                            purchaseOrderId !== ""
                                ? purchaseOrderId
                                : null,
                        createdById: user.id,
                        businessId: user.businessId!,
                    },
                });

                if (purchaseOrderId) {
                    await tx.purchaseOrder.update({
                        where: { id: purchaseOrderId },
                        data: { status: "DELIVERED" },
                    });
                }

                const newReceipts = [];

                for (const item of normalizedItems) {
                    const qty = parseInt(item.quantity.toString());
                    const uCost = parseFloat(item.unitCost.toString());
                    const tCost = qty * uCost;

                    const receipt = await tx.stockReceipt.create({
                        data: {
                            deliveryId: delivery.id,
                            quantity: qty,
                            unitCost: uCost,
                            totalCost: tCost,
                            reference: reference || null,
                            productId: item.productId,
                            storeId,
                            supplierId:
                                supplierId &&
                                supplierId !== "null" &&
                                supplierId !== ""
                                    ? supplierId
                                    : null,
                            createdById: user.id,
                            businessId: user.businessId!,
                        },
                    });
                    newReceipts.push(receipt);

                    await tx.storeInventory.upsert({
                        where: {
                            storeId_productId: {
                                storeId,
                                productId: item.productId,
                            },
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

                    await tx.product.update({
                        where: { id: item.productId },
                        data: { inStock: true },
                    });
                }

                return { delivery, receipts: newReceipts };
            });

            return res.status(201).json(result);
        } catch (error: any) {
            console.error("STOCK_RECEIPT_ERROR", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }

    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
}

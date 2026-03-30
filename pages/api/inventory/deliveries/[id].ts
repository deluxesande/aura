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

    const deliveryId = req.query.id as string;
    if (!deliveryId)
        return res.status(400).json({ error: "Missing delivery ID" });

    if (req.method === "GET") {
        try {
            const delivery = await prisma.delivery.findUnique({
                where: {
                    id: deliveryId,
                    businessId: user.businessId,
                },
                include: {
                    Store: { select: { name: true } },
                    Supplier: {
                        select: {
                            name: true,
                            email: true,
                            phoneNumber: true,
                        },
                    },
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

            if (!delivery) {
                return res.status(404).json({ error: "Delivery not found" });
            }

            // Fetch creator's image from Clerk
            let creatorImage = "/images/user.png";
            if (delivery.CreatedBy?.clerkId) {
                const clerk = await clerkClient();
                try {
                    const clerkUser = await clerk.users.getUser(
                        delivery.CreatedBy.clerkId,
                    );
                    creatorImage = clerkUser.imageUrl;
                } catch (e) {
                    console.error("Clerk fetch error", e);
                }
            }

            const deliveryWithImage = {
                ...delivery,
                creator: delivery.CreatedBy
                    ? {
                          firstName: delivery.CreatedBy.firstName,
                          lastName: delivery.CreatedBy.lastName,
                          role: delivery.CreatedBy.role,
                          imageUrl: creatorImage,
                      }
                    : null,
            };

            return res.status(200).json(deliveryWithImage);
        } catch (error) {
            console.error("GET_DELIVERY_ERROR", error);
            return res
                .status(500)
                .json({ error: "Failed to fetch delivery details" });
        }
    }

    if (req.method === "DELETE") {
        if (user.role === "user") {
            return res.status(403).json({ error: "Managers/Admins only" });
        }

        try {
            await prisma.$transaction(async (tx) => {
                const delivery = await tx.delivery.findUnique({
                    where: { id: deliveryId, businessId: user.businessId as string },
                    include: { receipts: true },
                });

                if (!delivery) throw new Error("Delivery not found");

                // 1. Revert Inventory
                for (const receipt of delivery.receipts) {
                    await tx.storeInventory.update({
                        where: {
                            storeId_productId: {
                                storeId: receipt.storeId,
                                productId: receipt.productId,
                            },
                        },
                        data: {
                            quantity: { decrement: receipt.quantity },
                        },
                    });
                }

                // 2. Revert PO status if applicable
                if (delivery.purchaseOrderId) {
                    await tx.purchaseOrder.update({
                        where: { id: delivery.purchaseOrderId },
                        data: { status: "PENDING" },
                    });
                }

                // 3. Delete Receipts
                await tx.stockReceipt.deleteMany({
                    where: { deliveryId: delivery.id },
                });

                // 4. Delete Delivery
                await tx.delivery.delete({
                    where: { id: delivery.id },
                });
            });

            return res.status(200).json({ message: "Delivery deleted" });
        } catch (error: any) {
            console.error("DELETE_DELIVERY_ERROR", error);
            return res.status(500).json({ error: error.message || "Failed" });
        }
    }

    if (req.method === "PATCH") {
        if (user.role === "user") {
            return res.status(403).json({ error: "Managers/Admins only" });
        }

        try {
            const { storeId, supplierId, purchaseOrderId, reference, items } =
                req.body;

            await prisma.$transaction(async (tx) => {
                const oldDelivery = await tx.delivery.findUnique({
                    where: { id: deliveryId, businessId: user.businessId as string },
                    include: { receipts: true },
                });

                if (!oldDelivery) throw new Error("Delivery not found");

                // 1. Revert OLD Inventory
                for (const receipt of oldDelivery.receipts) {
                    await tx.storeInventory.update({
                        where: {
                            storeId_productId: {
                                storeId: receipt.storeId,
                                productId: receipt.productId,
                            },
                        },
                        data: {
                            quantity: { decrement: receipt.quantity },
                        },
                    });
                }

                // 2. If PO changed, revert old PO
                if (
                    oldDelivery.purchaseOrderId &&
                    oldDelivery.purchaseOrderId !== purchaseOrderId
                ) {
                    await tx.purchaseOrder.update({
                        where: { id: oldDelivery.purchaseOrderId },
                        data: { status: "PENDING" },
                    });
                }

                // 3. Delete old receipts
                await tx.stockReceipt.deleteMany({
                    where: { deliveryId: oldDelivery.id },
                });

                // 4. Update Delivery metadata
                let totalDeliveryCost = 0;
                for (const item of items) {
                    totalDeliveryCost +=
                        Number(item.quantity) * Number(item.unitCost);
                }

                await tx.delivery.update({
                    where: { id: deliveryId },
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
                    },
                });

                // 5. Create NEW receipts and APPLY new inventory
                for (const item of items) {
                    const qty = parseInt(item.quantity.toString());
                    const uCost = parseFloat(item.unitCost.toString());
                    const tCost = qty * uCost;

                    await tx.stockReceipt.create({
                        data: {
                            deliveryId: deliveryId,
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
                }

                // 6. Update NEW PO status
                if (purchaseOrderId) {
                    await tx.purchaseOrder.update({
                        where: { id: purchaseOrderId },
                        data: { status: "DELIVERED" },
                    });
                }
            });

            return res.status(200).json({ message: "Delivery updated" });
        } catch (error: any) {
            console.error("PATCH_DELIVERY_ERROR", error);
            return res.status(500).json({ error: error.message || "Failed" });
        }
    }

    res.setHeader("Allow", ["GET", "DELETE", "PATCH"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
}

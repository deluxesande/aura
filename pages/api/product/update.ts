import { NextApiRequest, NextApiResponse } from "next";
import { masterPrisma, getTenantPrisma } from "@/utils/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { logAction } from "@/utils/server/audit";

export const updateProduct = async (
    req: NextApiRequest,
    res: NextApiResponse
) => {
    const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
    const { name, description, price, quantity, categoryId, image, sku, type } =
        req.body;

    const { userId } = getAuth(req);
    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    if (!id) {
        return res.status(400).json({ error: "Invalid or missing product ID" });
    }

    try {
        // 1. Fetch User and Business context from Master DB
        const user = await masterPrisma.user.findUnique({
            where: { clerkId: userId },
            select: { id: true, role: true, businessId: true }
        });

        if (!user || !user.businessId) return res.status(404).json({ error: "User or business not found" });

        const businessId = user.businessId;
        const tenantPrisma = await getTenantPrisma(businessId);

        const product = await tenantPrisma.product.findUnique({
            where: { id },
        });

        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        const activeStoreHeader = req.headers["x-store-id"] as string;

        // Fetch user store access from Tenant DB if not admin
        let targetStoreId = activeStoreHeader;
        if (user.role !== "admin") {
            const tenantUser = await tenantPrisma.tenantUser.findUnique({
                where: { clerkId: userId },
                select: { storeId: true }
            });
            if (tenantUser?.storeId) targetStoreId = tenantUser.storeId;
        }

        if (!targetStoreId) {
            return res.status(400).json({ error: "No active store selected." });
        }

        if (sku) {
            const existingSku = await tenantPrisma.product.findFirst({
                where: {
                    sku: sku,
                    id: { not: id },
                },
            });

            if (existingSku) {
                return res.status(409).json({
                    error: "A product with this SKU/Barcode already exists.",
                });
            }
        }

        const data: any = {
            name,
            description,
            categoryId,
            image,
            sku,
            price: parseFloat(price) || 0,
        };

        // If it's not a template, we can update price and inventory
        if (product.type !== "TEMPLATE") {
            data.inStock = quantity > 0 ? true : false;

            await tenantPrisma.$transaction([
                tenantPrisma.product.update({
                    where: { id: id },
                    data,
                }),
                tenantPrisma.storeInventory.upsert({
                    where: {
                        storeId_productId: {
                            storeId: targetStoreId,
                            productId: id,
                        },
                    },
                    update: { quantity },
                    create: {
                        storeId: targetStoreId,
                        productId: id,
                        quantity,
                    },
                }),
            ]);
        } else {
            data.price = 0;
            data.inStock = false;

            await tenantPrisma.product.update({
                where: { id: id },
                data,
            });
        }

        const updatedProduct = await tenantPrisma.product.findUnique({
            where: { id },
            include: {
                storeInventories: {
                    where: { storeId: targetStoreId },
                },
                purchaseOrderItems: {
                    where: {
                        PurchaseOrder: {
                            storeId: targetStoreId,
                            status: { in: ["PENDING", "IN_TRANSIT"] },
                            isDeleted: false,
                        },
                    },
                    select: { quantity: true },
                },
            },
        });

        // Log Audit Action
        await logAction({
            action: "UPDATE_PRODUCT",
            entityType: "PRODUCT",
            entityId: id,
            details: { name, sku, price, quantity, storeId: targetStoreId },
            userId: user.id,
            businessId: businessId,
            ipAddress: req.headers["x-forwarded-for"] as string || req.socket.remoteAddress,
            userAgent: req.headers["user-agent"],
        });

        const inventoryQty = updatedProduct?.storeInventories[0]?.quantity || 0;
        const pendingQty = updatedProduct?.purchaseOrderItems.reduce((sum, po) => sum + po.quantity, 0) || 0;

        const productWithQty = {
            ...updatedProduct,
            quantity: inventoryQty + pendingQty,
        };

        res.status(200).json(productWithQty);
    } catch (error: any) {
        if (error.code === "P2002") {
            return res
                .status(409)
                .json({ error: "A product with this SKU already exists." });
        }

        console.error("Update Error:", error);
        res.status(500).json({ error: "Failed to update product" });
    }
};

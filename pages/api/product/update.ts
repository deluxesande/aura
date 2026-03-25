import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/utils/lib/client";
import { getAuth } from "@clerk/nextjs/server";

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
        const product = await prisma.product.findUnique({
            where: { id },
        });

        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        const activeStoreHeader = req.headers["x-store-id"] as string;

        // Fetch User role and fixed storeId
        const userWithRole = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { role: true, storeId: true }
        });

        const targetStoreId = userWithRole?.role === "admin" ? activeStoreHeader : (userWithRole?.storeId as string);

        if (!targetStoreId) {
            return res.status(400).json({ error: "No active store selected." });
        }

        if (sku) {
            const existingSku = await prisma.product.findFirst({
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
        };

        // If it's not a template, we can update price and inventory
        if (product.type !== "TEMPLATE") {
            data.price = price;
            // We no longer update quantity on the global Product model
            // instead we update StoreInventory
            data.inStock = quantity > 0 ? true : false;

            await prisma.$transaction([
                prisma.product.update({
                    where: { id: id },
                    data,
                }),
                prisma.storeInventory.upsert({
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
            // For templates, we don't update price/quantity directly (they are 0)
            data.price = 0;
            data.quantity = 0;
            data.inStock = false;

            await prisma.product.update({
                where: { id: id },
                data,
            });
        }

        const updatedProduct = await prisma.product.findUnique({
            where: { id },
            include: {
                storeInventories: {
                    where: { storeId: targetStoreId },
                },
            },
        });

        const productWithQty = {
            ...updatedProduct,
            quantity: updatedProduct?.storeInventories[0]?.quantity || 0,
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

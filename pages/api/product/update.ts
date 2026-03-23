import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/utils/lib/client";

export const updateProduct = async (
    req: NextApiRequest,
    res: NextApiResponse
) => {
    const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
    const { name, description, price, quantity, categoryId, image, sku, type } =
        req.body;

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

        // If it's not a template, we can update price and quantity
        if (product.type !== "TEMPLATE") {
            data.price = price;
            data.quantity = quantity;
            data.inStock = quantity > 0 ? true : false;
        } else {
            // For templates, we don't update price/quantity directly (they are 0)
            data.price = 0;
            data.quantity = 0;
            data.inStock = false;
        }

        const updatedProduct = await prisma.product.update({
            where: {
                id: id,
            },
            data,
        });

        res.status(200).json(updatedProduct);
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

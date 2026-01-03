import { NextApiRequest, NextApiResponse } from "next";
import { generateSKU } from "@/utils/generateSKU";
import { addCreatedBy } from "../middleware";
import { prisma } from "@/utils/lib/client";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const {
            name,
            description,
            price,
            quantity,
            inStock,
            categoryId,
            sku,
            image,
            createdBy,
        } = req.body;

        if (!image) {
            return res.status(400).json({ error: "Image URL is required" });
        }

        const finalSku = sku && sku.trim() !== "" ? sku : generateSKU(name);

        const parsedQuantity = parseInt(quantity, 10);
        const parsedPrice = parseFloat(price);

        const existingProduct = await prisma.product.findFirst({
            where: {
                name,
                categoryId,
            },
        });

        if (existingProduct) {
            const updatedProduct = await prisma.product.update({
                where: { id: existingProduct.id },
                data: {
                    quantity: existingProduct.quantity + parsedQuantity,
                },
            });
            return res.status(200).json(updatedProduct);
        }

        const skuCheck = await prisma.product.findUnique({
            where: { sku: finalSku },
        });

        if (skuCheck) {
            return res.status(409).json({
                error: "A product with this SKU/Barcode already exists.",
            });
        }

        const newProduct = await prisma.product.create({
            data: {
                name,
                description,
                price: parsedPrice,
                sku: finalSku,
                quantity: parsedQuantity,
                image: image,
                inStock: inStock,
                Category: {
                    connect: { id: categoryId },
                },
                createdBy: createdBy,
            },
        });

        res.status(201).json(newProduct);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to add or update product" });
    }
};

export const addProduct = addCreatedBy(handler);

import { NextApiRequest, NextApiResponse } from "next";
import { generateSKU } from "@/utils/generateSKU";
import { addCreatedBy } from "../middleware";
import { prisma } from "@/utils/lib/client";
import { getAuth } from "@clerk/nextjs/server";
import { checkSubscription } from "@/utils/subscription/checkSubscription";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { userId } = getAuth(req);

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const { authorized, error, businessId } =
            await checkSubscription(userId);

        if (!authorized) {
            return res.status(403).json({ error });
        }

        const {
            name,
            description,
            price,
            quantity,
            inStock,
            categoryId,
            sku,
            image,
        } = req.body;

        const finalSku = sku && sku.trim() !== "" ? sku : generateSKU(name);
        const parsedQuantity = parseInt(quantity, 10);
        const parsedPrice = parseFloat(price);

        // Check if product already exists for this business
        const existingProduct = await prisma.product.findFirst({
            where: {
                name,
                categoryId,
                Business: {
                    id: businessId as string,
                },
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

        // Check for duplicate SKU
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
                image: image ?? "/images/default-product.png",
                inStock,
                Category: {
                    connect: { id: categoryId },
                },
                Business: {
                    connect: { id: businessId as string }, // ← relation instead of raw field
                },
                createdBy: userId,
            },
        });

        return res.status(201).json(newProduct);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to add or update product" });
    }
};

export const addProduct = addCreatedBy(handler);

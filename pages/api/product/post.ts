import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { generateSKU } from "@/utils/generateSKU";

const prisma = new PrismaClient();

export const addProduct = async (req: NextApiRequest, res: NextApiResponse) => {
    const { name, description, price, quantity, categoryId } = req.body;

    try {
        // Generate SKU for the new product
        const sku = generateSKU(name);

        // Check if a product with the same name exists in the specified category
        const existingProduct = await prisma.product.findFirst({
            where: {
                name,
                categoryId,
            },
        });

        if (existingProduct) {
            // If the product exists, update the quantity
            const updatedProduct = await prisma.product.update({
                where: { id: existingProduct.id },
                data: {
                    quantity: existingProduct.quantity + quantity,
                },
            });

            res.status(200).json(updatedProduct);
        } else {
            // If the product does not exist, create a new product
            const newProduct = await prisma.product.create({
                data: {
                    name,
                    description,
                    price,
                    sku, // Use the generated SKU
                    quantity,
                    categoryId,
                },
            });

            res.status(201).json(newProduct);
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to add or update product" });
    }
};

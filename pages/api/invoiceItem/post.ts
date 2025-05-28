import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { addCreatedBy } from "../middleware";

const prisma = new PrismaClient();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const { invoiceId = null, productId, quantity, price } = req.body;

    try {
        // Check if the productId exists
        const product = await prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product) {
            return res.status(400).json({ error: "Invalid productId" });
        }

        // Check if the product has enough quantity
        if (product.quantity < quantity) {
            return res
                .status(400)
                .json({ error: "Insufficient product quantity" });
        }

        // Reduce the product quantity
        await prisma.product.update({
            where: { id: productId },
            data: {
                quantity: {
                    decrement: quantity, // Decrease the quantity
                },
            },
        });

        const invoiceItem = await prisma.invoiceItem.create({
            data: {
                invoiceId,
                quantity,
                price,
                productId,
                createdBy: req.body.createdBy,
            },
        });
        res.status(201).json(invoiceItem);
    } catch (error) {
        res.status(400).json({ error: "Failed to add or update invoice item" });
    }
};

export const addInvoiceItem = addCreatedBy(handler);

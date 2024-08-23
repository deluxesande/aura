import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export const addInvoiceItem = async (
    req: NextApiRequest,
    res: NextApiResponse
) => {
    const { invoiceId = null, productId, quantity, price } = req.body;

    try {
        // Check if the productId exists
        const product = await prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product) {
            return res.status(400).json({ error: "Invalid productId" });
        }

        const invoiceItem = await prisma.invoiceItem.create({
            data: {
                invoiceId,
                quantity,
                price,
                productId, // Directly use productId to reference the product
            },
        });
        res.status(201).json(invoiceItem);
    } catch (error) {
        console.log(error);
        res.status(400).json({ error: "Failed to add or update invoice item" });
    }
};

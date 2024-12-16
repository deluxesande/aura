import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export const updateProduct = async (
    req: NextApiRequest,
    res: NextApiResponse
) => {
    const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
    const { name, description, price, quantity, categoryId, image } = req.body;

    if (!id) {
        return res.status(400).json({ error: "Invalid or missing product ID" });
    }

    try {
        const updatedProduct = await prisma.product.update({
            where: {
                id: id,
            },
            data: {
                name,
                description,
                price,
                quantity,
                categoryId,
                image,
            },
        });

        res.status(200).json(updatedProduct);
    } catch (error) {
        res.status(500).json({ error: "Failed to update product" });
    }
};

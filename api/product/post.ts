import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const addProduct = async (req: NextApiRequest, res: NextApiResponse) => {
    const { name, description, price } = req.body;

    try {
        const newProduct = await prisma.product.create({
            data: {
                name,
                description,
                price,
            },
        });

        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ error: "Failed to add product" });
    }
};

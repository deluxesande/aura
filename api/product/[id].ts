import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export default async function getProductById(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { id } = req.query;

    try {
        const product = await prisma.product.findUnique({
            where: {
                id: Number(id),
            },
        });

        if (product) {
            res.status(200).json(product);
        } else {
            res.status(404).json({ message: "Product not found" });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch product" });
    }
}

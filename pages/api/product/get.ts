import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getProducts = async (
    req: NextApiRequest,
    res: NextApiResponse
) => {
    try {
        const products = await prisma.product.findMany();

        if (products.length === 0) {
            return res.status(200).json({ message: "No products found" });
        }

        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    } finally {
        await prisma.$disconnect();
    }
};

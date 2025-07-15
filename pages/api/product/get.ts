import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/utils/lib/client";

export const getProducts = async (
    req: NextApiRequest,
    res: NextApiResponse
) => {
    try {
        const { userId } = getAuth(req);

        const products = await prisma.product.findMany({
            where: {
                createdBy: userId,
            },
            include: {
                Category: true,
            },
        });

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

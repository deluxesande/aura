import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getProducts = async (
    req: NextApiRequest,
    res: NextApiResponse
) => {
    const products = await prisma.product.findMany();
    res.status(200).json(products);
};

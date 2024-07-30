import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getCategories = async (
    req: NextApiRequest,
    res: NextApiResponse
) => {
    const categories = await prisma.category.findMany();
    res.status(200).json(categories);
};

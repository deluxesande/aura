import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getBusiness = async (
    req: NextApiRequest,
    res: NextApiResponse
) => {
    const categories = await prisma.business.findMany();
    res.status(200).json(categories);
};

import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getCustomers = async (
    req: NextApiRequest,
    res: NextApiResponse
) => {
    const categories = await prisma.customer.findMany();
    res.status(200).json(categories);
};

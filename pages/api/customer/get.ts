import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/utils/lib/client";

export const getCustomers = async (
    req: NextApiRequest,
    res: NextApiResponse
) => {
    const categories = await prisma.customer.findMany();
    res.status(200).json(categories);
};

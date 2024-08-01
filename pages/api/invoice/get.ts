import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getInvoices = async (
    req: NextApiRequest,
    res: NextApiResponse
) => {
    const invoices = await prisma.invoice.findMany();
    res.status(200).json(invoices);
};

import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getInvoiceItem = async (
    req: NextApiRequest,
    res: NextApiResponse
) => {
    const invoiceItem = await prisma.invoiceItem.findMany({
        select: {
            quantity: true,
            Product: {
                select: {
                    name: true,
                    price: true,
                },
            },
        },
    });
    res.status(200).json(invoiceItem);
};

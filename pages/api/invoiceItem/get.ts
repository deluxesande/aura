import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/utils/lib/client";

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

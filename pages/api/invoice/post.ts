import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { InvoiceItem } from "@/pages/utils/typesDefinitions";

const prisma = new PrismaClient();

export const addInvoice = async (req: NextApiRequest, res: NextApiResponse) => {
    const { customerId, invoiceItems, totalAmount } = req.body;

    try {
        const invoice = await prisma.invoice.create({
            data: {
                customerId,
                totalAmount,
                invoiceItems: {
                    connect: invoiceItems.map((item: InvoiceItem) => ({
                        id: item.id,
                    })),
                },
            },
        });
        res.status(201).json(invoice);
    } catch (error) {
        res.status(400).json({ error: "Failed to add or update invoice" });
    }
};

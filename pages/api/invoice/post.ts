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
                    create: invoiceItems.map((item: InvoiceItem) => ({
                        quantity: item.quantity,
                        price: item.price,
                        productId: item.productId,
                    })),
                },
            },
        });
        res.status(201).json(invoice);
    } catch (error) {
        res.status(400).json({ error: "Failed to add or update invoice" });
    }
};

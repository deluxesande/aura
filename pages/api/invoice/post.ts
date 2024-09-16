import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { InvoiceItem } from "@/utils/typesDefinitions";

const prisma = new PrismaClient();

export const addInvoice = async (req: NextApiRequest, res: NextApiResponse) => {
    const { customerId, invoiceItems, totalAmount } = req.body;

    try {
        // Check if customer exists
        const customerExists = await prisma.customer.findUnique({
            where: { id: customerId },
        });

        if (!customerExists) {
            return res.status(400).json({ error: "Customer not found" });
        }

        // Check if any invoiceItem is already linked to another invoice
        const existingInvoiceItems = await prisma.invoiceItem.findMany({
            where: {
                id: {
                    in: invoiceItems.map((item: InvoiceItem) => item.id),
                },
                invoiceId: {
                    not: null,
                },
            },
        });

        if (existingInvoiceItems.length > 0) {
            return res.status(400).json({
                error: "One or more invoice items are already linked to another invoice",
            });
        }

        // Create invoice
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

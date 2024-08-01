import { InvoiceItem } from "@/pages/utils/typesDefinitions";
import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export const updateInvoice = async (
    req: NextApiRequest,
    res: NextApiResponse
) => {
    const id = Number(req.query.id);
    const { customerId, invoiceItems, totalAmount } = req.body;

    if (!id || typeof id !== "number") {
        return res.status(400).json({ error: "Invalid or missing invoice ID" });
    }

    try {
        const updatedInvoice = await prisma.invoice.update({
            where: {
                id: id,
            },
            data: {
                customerId,
                totalAmount,
                invoiceItems: {
                    deleteMany: {},
                    create: invoiceItems.map((item: InvoiceItem) => ({
                        quantity: item.quantity,
                        price: item.price,
                        productId: item.productId,
                    })),
                },
            },
        });

        res.status(200).json(updatedInvoice);
    } catch (error) {
        res.status(500).json({ error: "Failed to update invoice" });
    }
};

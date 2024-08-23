import { InvoiceItem } from "@/pages/utils/typesDefinitions";
import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export const updateInvoiceItem = async (
    req: NextApiRequest,
    res: NextApiResponse
) => {
    const id = Number(req.query.id);
    const { invoiceId, productId, quantity, price } = req.body;

    if (!id || typeof id !== "number") {
        return res
            .status(400)
            .json({ error: "Invalid or missing invoice item ID" });
    }

    try {
        const updatedInvoiceItem = await prisma.invoiceItem.update({
            where: {
                id: id,
            },
            data: {
                invoiceId,
                productId,
                quantity,
                price,
            },
        });

        res.status(200).json(updatedInvoiceItem);
    } catch (error) {
        res.status(500).json({ error: "Failed to update invoice item" });
    }
};

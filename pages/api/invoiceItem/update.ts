import { InvoiceItem } from "@/utils/typesDefinitions";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/utils/lib/client";

export const updateInvoiceItem = async (
    req: NextApiRequest,
    res: NextApiResponse
) => {
    const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
    const { invoiceId, productId, quantity, price } = req.body;

    if (!id) {
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

import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/utils/lib/client";

export const deleteInvoiceItem = async (
    req: NextApiRequest,
    res: NextApiResponse
) => {
    const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;

    try {
        await prisma.invoiceItem.delete({
            where: {
                id: id,
            },
        });
        res.status(204).end();
    } catch (error) {
        res.status(404).json({ error: "Failed to delete invoice item" });
    }
};

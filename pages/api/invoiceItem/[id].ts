import type { NextApiRequest, NextApiResponse } from "next";
import { updateInvoiceItem } from "./update";
import { deleteInvoiceItem } from "./delete";
import { prisma } from "@/utils/lib/client";

async function getInvoiceItemById(req: NextApiRequest, res: NextApiResponse) {
    const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;

    try {
        const invoiceItem = await prisma.invoiceItem.findUnique({
            where: {
                id: id,
            },
        });

        if (invoiceItem) {
            res.status(200).json(invoiceItem);
        } else {
            res.status(404).json({ message: "Invoice item not found" });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch invoice item" });
    }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case "GET":
            return getInvoiceItemById(req, res);
        case "PUT":
            return updateInvoiceItem(req, res);
        case "DELETE":
            return deleteInvoiceItem(req, res);
        default:
            res.setHeader("Allow", ["PUT", "DELETE"]);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

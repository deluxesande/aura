import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { updateInvoice } from "./update";
import { deleteInvoice } from "./delete";

const prisma = new PrismaClient();

async function getInvoiceById(req: NextApiRequest, res: NextApiResponse) {
    const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;

    try {
        const invoice = await prisma.invoice.findUnique({
            where: {
                id: id,
            },
            include: {
                invoiceItems: {
                    select: {
                        quantity: true,
                        Product: {
                            select: {
                                name: true,
                                image: true,
                                price: true,
                            },
                        },
                    },
                },
                Customer: {
                    select: {
                        firstName: true,
                    },
                },
            },
        });

        if (invoice) {
            res.status(200).json(invoice);
        } else {
            res.status(404).json({ message: "Invoice not found" });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch invoice" });
    }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case "GET":
            return getInvoiceById(req, res);
        case "PUT":
            return updateInvoice(req, res);
        case "DELETE":
            return deleteInvoice(req, res);
        default:
            res.setHeader("Allow", ["PUT", "DELETE"]);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

import type { NextApiRequest, NextApiResponse } from "next";
import { updateInvoice } from "./update";
import { deleteInvoice } from "./delete";
import { masterPrisma, getTenantPrisma } from "@/utils/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";

async function getInvoiceById(req: NextApiRequest, res: NextApiResponse) {
    const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
    const { userId } = getAuth(req);

    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    try {
        // 1. Fetch User context from Master DB
        const user = await masterPrisma.user.findUnique({
            where: { clerkId: userId },
            select: { businessId: true }
        });

        if (!user?.businessId) return res.status(404).json({ error: "Business not found" });

        const tenantPrisma = await getTenantPrisma(user.businessId);

        const invoice = await tenantPrisma.invoice.findUnique({
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
                                type: true,
                                attributeValues: {
                                    include: {
                                        attributeOption: true
                                    }
                                }
                            },
                        },
                    },
                },
                Customer: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                        phoneNumber: true,
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
        console.error("Fetch Invoice Error:", error);
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

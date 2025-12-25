import type { NextApiRequest, NextApiResponse } from "next";
import { InvoiceItem } from "@/utils/typesDefinitions";
import { addCreatedBy } from "../middleware";
import { prisma } from "@/utils/lib/client";
import { Novu } from "@novu/api";

const novu = new Novu({
    secretKey: process.env.NOVU_SECRET_KEY!,
});

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const { customerId, invoiceItems, totalAmount } = req.body;

    const currentDate = new Date();
    const formattedDate = currentDate
        .toISOString()
        .replace("T", "-")
        .split(".")[0]; // Format as YYYY-MM-DD-HH:MM:SS
    const invoiceName = `Invoice-${formattedDate}`;

    try {
        if (customerId) {
            const customerExists = await prisma.customer.findUnique({
                where: { id: customerId },
            });

            if (!customerExists) {
                return res.status(400).json({ error: "Customer not found" });
            }
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

        // Create invoice omit customerId if not provided
        const invoiceData: any = {
            invoiceName,
            totalAmount,
            invoiceItems: {
                connect: invoiceItems.map((item: InvoiceItem) => ({
                    id: item.id,
                })),
            },
            paymentType: req.body.paymentType,
            status: req.body.status ?? "PENDING",
            createdBy: req.body.createdBy,
        };

        if (customerId) {
            invoiceData.customerId = customerId;
        }

        const invoice = await prisma.invoice.create({
            data: invoiceData,
        });

        // Send Novu notification
        try {
            await novu.trigger({
                to: {
                    subscriberId: process.env.NEXT_PUBLIC_SUBSCRIBER_ID!,
                },
                workflowId: "invoice-generated",
                payload: {
                    invoiceId: invoice.id,
                    invoiceName: invoice.invoiceName,
                    totalAmount: invoice.totalAmount,
                },
            });
        } catch (error) {
            console.error("Failed to send Novu notification:", error);
        }

        res.status(201).json(invoice);
    } catch (error) {
        res.status(400).json({ error: "Failed to add or update invoice" });
    }
};

export const addInvoice = addCreatedBy(handler);

import type { NextApiRequest, NextApiResponse } from "next";
import { InvoiceItem } from "@/utils/typesDefinitions";
import { addCreatedBy } from "../middleware";
import { prisma } from "@/utils/lib/client";
import { Novu } from "@novu/api";

const novu = new Novu({
    secretKey: process.env.NOVU_SECRET_KEY!,
});

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const { customerId, invoiceItems, totalAmount, mpesaDetails, paymentType } =
        req.body;

    const currentDate = new Date();
    const formattedDate = currentDate
        .toISOString()
        .replace("T", "-")
        .split(".")[0];
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

        // Check for already linked items
        const existingInvoiceItems = await prisma.invoiceItem.findMany({
            where: {
                id: { in: invoiceItems.map((item: InvoiceItem) => item.id) },
                invoiceId: { not: null },
            },
        });

        if (existingInvoiceItems.length > 0) {
            return res.status(400).json({
                error: "One or more invoice items are already linked to another invoice",
            });
        }

        // If paymentType is CASH, automatically mark as PAID.
        // Otherwise, use the status passed in body or default to PENDING.
        const invoiceStatus =
            paymentType === "CASH" ? "PAID" : req.body.status ?? "PENDING";

        const invoiceData: any = {
            invoiceName,
            totalAmount,
            invoiceItems: {
                connect: invoiceItems.map((item: InvoiceItem) => ({
                    id: item.id,
                })),
            },
            paymentType: paymentType,
            status: invoiceStatus,
            createdBy: req.body.createdBy,
        };

        if (customerId) {
            invoiceData.customerId = customerId;
        }

        const invoice = await prisma.invoice.create({
            data: invoiceData,
        });

        const creator = await prisma.user.findUnique({
            where: { clerkId: req.body.createdBy },
        });

        if (!creator || !creator.businessId) {
            console.error("Creator or business not found");
        } else {
            if (mpesaDetails && paymentType === "MPESA") {
                try {
                    await prisma.mpesaPayment.create({
                        data: {
                            invoiceId: invoice.id,
                            businessId: creator.businessId,
                            userId: creator.id,
                            amount: parseFloat(totalAmount),
                            phoneNumber: mpesaDetails.phoneNumber,
                            accountReference: "Salesense",
                            transactionDesc: "Invoice Payment",
                            merchantRequestId: mpesaDetails.merchantRequestId,
                            checkoutRequestId: mpesaDetails.checkoutRequestId,
                            status: "PENDING",
                        },
                    });
                } catch (mpesaError) {
                    console.error(
                        "Failed to link M-Pesa payment to invoice:",
                        mpesaError
                    );
                }
            }

            // 3. Send Novu Notifications
            const adminsAndManagers = await prisma.user.findMany({
                where: {
                    businessId: creator.businessId,
                    OR: [
                        { role: { in: ["admin", "manager"] } }, // Admins & Managers
                        { clerkId: creator.clerkId }, // Plus the Creator (even if they are just a 'user')
                    ],
                },
            });

            for (const admin of adminsAndManagers) {
                try {
                    await novu.trigger({
                        to: { subscriberId: admin.clerkId },
                        workflowId: "invoice-generated",
                        payload: {
                            invoiceId: invoice.id,
                            invoiceName: invoice.invoiceName,
                            totalAmount: invoice.totalAmount,
                            createdBy:
                                creator.firstName + " " + creator.lastName,
                        },
                    });
                } catch (error) {
                    console.error(`Failed to notify ${admin.email}:`, error);
                }
            }
        }

        res.status(201).json(invoice);
    } catch (error) {
        res.status(400).json({ error: "Failed to add or update invoice" });
    }
};

export const addInvoice = addCreatedBy(handler);

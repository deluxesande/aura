import type { NextApiRequest, NextApiResponse } from "next";
import { InvoiceItem } from "@/utils/typesDefinitions";
import { addCreatedBy } from "../middleware";
import { prisma } from "@/utils/lib/client";
import { Novu } from "@novu/api";
import { buffer } from "stream/consumers";
import { getAuth } from "@clerk/nextjs/server";
import { checkSubscription } from "@/utils/subscription/checkSubscription";

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

    const { userId } = getAuth(req);

    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const activeStoreHeader = req.headers["x-store-id"] as string;

    const { authorized, error: subError, businessId } = await checkSubscription(userId);

    if (!authorized) {
        return res.status(403).json({ error: subError });
    }

    const dbUser = await prisma.user.findUnique({
        where: { clerkId: userId },
        select: { id: true, businessId: true, role: true, storeId: true },
    });

    if (!dbUser) {
        return res.status(404).json({ error: "User not found" });
    }

    if (!dbUser.businessId) {
        return res
            .status(400)
            .json({ error: "User is not linked to a business" });
    }

    const targetStoreId = dbUser.role === "admin" ? activeStoreHeader : (dbUser.storeId as string);

    if (!targetStoreId) {
        return res.status(400).json({ error: "No active store selected." });
    }

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
            paymentType === "CASH" ? "PAID" : (req.body.status ?? "PENDING");

        const invoiceData: any = {
            invoiceName,
            totalAmount: parseFloat(totalAmount),
            invoiceItems: {
                connect: invoiceItems.map((item: InvoiceItem) => ({
                    id: item.id,
                })),
            },
            paymentType: paymentType,
            status: invoiceStatus,
            createdBy: req.body.createdBy,
            businessId: dbUser.businessId,
            storeId: targetStoreId,
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
                const parsedAmount = parseFloat(totalAmount);
                if (isNaN(parsedAmount)) {
                    console.error("Invalid totalAmount for MpesaPayment:", totalAmount);
                } else {
                    try {
                        await prisma.mpesaPayment.create({
                            data: {
                                invoiceId: invoice.id,
                                businessId: creator.businessId,
                                userId: creator.id,
                                amount: parsedAmount,
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
                            mpesaError,
                        );
                    }
                }
            }

            // 3. Send Novu Notifications in Parallel
            const adminsAndManagers = await prisma.user.findMany({
                where: {
                    businessId: creator.businessId,
                    OR: [
                        { role: { in: ["admin", "manager"] } }, // Admins & Managers
                        { clerkId: creator.clerkId }, // Plus the Creator (even if they are just a 'user')
                    ],
                },
            });

            await Promise.allSettled(
                adminsAndManagers.map((admin) =>
                    novu.trigger({
                        to: { subscriberId: admin.clerkId },
                        workflowId: "invoice-generated",
                        payload: {
                            invoiceId: invoice.id,
                            invoiceName: invoice.invoiceName,
                            totalAmount: invoice.totalAmount,
                            createdBy:
                                creator.firstName + " " + creator.lastName,
                        },
                    }).catch(err => console.error(`Failed to notify ${admin.email}:`, err))
                )
            );
        }

        res.status(201).json(invoice);
    } catch (error) {
        res.status(400).json({ error: "Failed to add or update invoice" });
    }
};

export const addInvoice = addCreatedBy(handler);

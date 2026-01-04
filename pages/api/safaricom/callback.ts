import {
    storeFailedCallbackInDb,
    storeSuccessfulCallbackInDb,
} from "@/utils/storeInDb";
import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

interface CallbackItem {
    Name: string;
    Value?: string | number;
}
interface StkCallback {
    MerchantRequestID: string;
    CheckoutRequestID: string;
    ResultCode: number;
    ResultDesc: string;
    CallbackMetadata?: { Item: CallbackItem[] };
}
interface MpesaPayload {
    Body: { stkCallback: StkCallback };
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const payload = req.body as MpesaPayload;

        if (!payload?.Body?.stkCallback) {
            return res.status(400).json({ error: "Invalid payload" });
        }

        const {
            ResultCode,
            ResultDesc,
            CallbackMetadata,
            MerchantRequestID,
            CheckoutRequestID,
        } = payload.Body.stkCallback;

        let pendingPayment = null;
        let retries = 5;

        while (retries > 0) {
            pendingPayment = await prisma.mpesaPayment.findUnique({
                where: { checkoutRequestId: CheckoutRequestID },
                include: {
                    Business: {
                        include: {
                            subscriptions: {
                                where: { status: "ACTIVE" },
                                take: 1,
                            },
                        },
                    },
                },
            });

            if (pendingPayment) break;

            await wait(500);
            retries--;
        }

        if (!pendingPayment) {
            console.warn(`Orphaned Callback: ${CheckoutRequestID}`);
            if (ResultCode !== 0) {
                await storeFailedCallbackInDb({
                    MerchantRequestID,
                    CheckoutRequestID,
                    ResultCode,
                    ResultDesc,
                });
            }
            return res.status(200).json({ result: "orphaned_record" });
        }

        // Handle Failed Transaction
        if (ResultCode !== 0) {
            await storeFailedCallbackInDb({
                MerchantRequestID,
                CheckoutRequestID,
                ResultCode,
                ResultDesc,
                invoiceId: pendingPayment?.invoiceId,
            });

            const newStatus = ResultCode === 1032 ? "CANCELLED" : "FAILED";

            await prisma.$transaction([
                prisma.mpesaPayment.update({
                    where: { id: pendingPayment.id },
                    data: { status: "FAILED" },
                }),
                prisma.invoice.update({
                    where: { id: pendingPayment.invoiceId },
                    data: { status: newStatus as any },
                }),
            ]);

            return res.status(200).json({ result: "acknowledged_failure" });
        }

        const metaItems = CallbackMetadata?.Item || [];
        const getMetaValue = (name: string) =>
            metaItems.find((i) => i.Name === name)?.Value;

        const amountPaid = Number(getMetaValue("Amount"));
        const receiptNumber = String(getMetaValue("MpesaReceiptNumber"));
        const phoneNumber = String(getMetaValue("PhoneNumber"));
        const transactionDate = String(getMetaValue("TransactionDate") || "0");

        const biz = pendingPayment.Business;
        const sub = biz.subscriptions?.[0];

        if (sub?.plan === "STARTER") {
            const currentTxCount = await prisma.invoice.count({
                where: {
                    businessId: biz.id,
                    status: "PAID",
                    paymentType: "MPESA",
                    createdAt: {
                        gte: sub.currentPeriodStart,
                        lte: sub.currentPeriodEnd,
                    },
                },
            });

            if (currentTxCount >= 100) {
                console.error(
                    `Cap Reached for Business ${biz.id}. Payment accepted but limit exceeded.`
                );
            }
        }

        // Store full details in the dedicated Callback table (which DOES have the receipt number field)
        await storeSuccessfulCallbackInDb({
            MerchantRequestID,
            CheckoutRequestID,
            ResultCode,
            ResultDesc,
            Amount: amountPaid,
            MpesaReceiptNumber: receiptNumber,
            PhoneNumber: phoneNumber,
            TransactionDate: transactionDate,
            invoiceId: pendingPayment.invoiceId,
        });

        // Update the Payment and Invoice
        await prisma.$transaction([
            prisma.mpesaPayment.update({
                where: { id: pendingPayment.id },
                data: {
                    status: "COMPLETED",
                    amount: amountPaid,
                },
            }),
            prisma.invoice.update({
                where: { id: pendingPayment.invoiceId },
                data: {
                    status: "PAID",
                    paymentType: "MPESA",
                },
            }),
        ]);

        return res.status(200).json({ result: "success" });
    } catch (error) {
        console.error("Callback Error:", error);
        return res.status(200).json({ result: "error_handled" });
    }
}

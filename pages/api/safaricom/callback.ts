import {
    storeFailedCallbackInDb,
    storeSuccessfulCallbackInDb,
} from "@/utils/storeInDb";
import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

// Best practice: Import this from a shared lib file to prevent connection exhaustion
// But keeping your current setup for consistency:
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

        if (ResultCode !== 0) {
            await storeFailedCallbackInDb({
                MerchantRequestID,
                CheckoutRequestID,
                ResultCode,
                ResultDesc,
            });

            const pendingPayment = await prisma.mpesaPayment.findUnique({
                where: { checkoutRequestId: CheckoutRequestID },
            });

            if (!pendingPayment) {
                // We still return 200 to stop Safaricom from retrying
                return res.status(200).json({ result: "record_not_found" });
            }

            // Determine statuses based on specific M-Pesa codes
            let paymentStatus = "FAILED";
            let invoiceStatus = "FAILED"; // Default

            // 1032: Cancelled by user
            // 1037: DS timeout (User didn't enter PIN in time)
            // 2001: Wrong PIN
            // 1: Insufficient Funds
            if (ResultCode === 1032) {
                paymentStatus = "CANCELLED";
                invoiceStatus = "CANCELLED";
            } else if (ResultCode === 1037) {
                paymentStatus = "TIMEOUT";
                invoiceStatus = "OVERDUE";
            }

            // Use a Transaction to ensure both update or neither does
            await prisma.$transaction([
                prisma.mpesaPayment.update({
                    where: { id: pendingPayment.id },
                    data: {
                        status: paymentStatus,
                        resultDesc: ResultDesc,
                    },
                }),
                prisma.invoice.update({
                    where: { id: pendingPayment.invoiceId },
                    data: { status: invoiceStatus as any },
                }),
            ]);

            return res.status(200).json({ result: "acknowledged_failure" });
        }

        const metaItems = CallbackMetadata?.Item || [];
        const getMetaValue = (name: string) =>
            metaItems.find((i) => i.Name === name)?.Value;

        const amount = Number(getMetaValue("Amount"));
        const receiptNumber = String(getMetaValue("MpesaReceiptNumber"));
        const phoneNumber = String(getMetaValue("PhoneNumber"));
        const transactionDate = String(getMetaValue("TransactionDate"));

        await storeSuccessfulCallbackInDb({
            MerchantRequestID,
            CheckoutRequestID,
            ResultCode,
            ResultDesc,
            Amount: amount,
            MpesaReceiptNumber: receiptNumber,
            PhoneNumber: phoneNumber,
            TransactionDate: transactionDate,
        });

        const pendingPayment = await prisma.mpesaPayment.findUnique({
            where: { checkoutRequestId: CheckoutRequestID },
        });

        if (!pendingPayment) {
            return res.status(200).json({ result: "record_not_found" });
        }

        await prisma.$transaction([
            prisma.mpesaPayment.update({
                where: { id: pendingPayment.id },
                data: {
                    status: "COMPLETED",
                    amountPaid: amount,
                    receiptNumber: receiptNumber,
                    phoneNumber: phoneNumber,
                    transactionDate: new Date(),
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
        return res.status(200).json({ result: "error_handled" });
    }
}

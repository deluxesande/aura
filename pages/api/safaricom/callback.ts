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

        const pendingPayment = await prisma.mpesaPayment.findUnique({
            where: { checkoutRequestId: CheckoutRequestID },
        });

        if (ResultCode !== 0) {
            await storeFailedCallbackInDb({
                MerchantRequestID,
                CheckoutRequestID,
                ResultCode,
                ResultDesc,
            });

            if (pendingPayment) {
                // 1032 = User Cancelled, others are FAILED
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
            } else {
                console.warn(`Orphaned Failure Callback: ${CheckoutRequestID}`);
            }

            return res.status(200).json({ result: "acknowledged_failure" });
        }

        const metaItems = CallbackMetadata?.Item || [];
        const getMetaValue = (name: string) =>
            metaItems.find((i) => i.Name === name)?.Value;

        const amount = Number(getMetaValue("Amount"));
        const receiptNumber = String(getMetaValue("MpesaReceiptNumber"));
        const phoneNumber = String(getMetaValue("PhoneNumber"));
        const tDateVal = getMetaValue("TransactionDate");
        const transactionDate = tDateVal ? String(tDateVal) : "0";

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

        if (pendingPayment) {
            await prisma.$transaction([
                prisma.mpesaPayment.update({
                    where: { id: pendingPayment.id },
                    data: { status: "COMPLETED" },
                }),
                prisma.invoice.update({
                    where: { id: pendingPayment.invoiceId },
                    data: {
                        status: "PAID",
                        paymentType: "MPESA",
                    },
                }),
            ]);
        } else {
            console.warn(`Orphaned Success Callback: ${CheckoutRequestID}`);
        }

        return res.status(200).json({ result: "success" });
    } catch (error) {
        console.error("Callback Error:", error);
        return res.status(200).json({ result: "error_handled" });
    }
}

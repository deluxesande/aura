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

        // --- OPTIMIZED POLLING ---
        // Instead of waiting 10s (which timeouts Vercel), we wait max 4s.
        // We check every 500ms. This is "aggressive" polling.
        let pendingPayment = null;
        let retries = 8; // 8 * 500ms = 4 seconds max

        while (retries > 0) {
            pendingPayment = await prisma.mpesaPayment.findUnique({
                where: { checkoutRequestId: CheckoutRequestID },
                select: { id: true, invoiceId: true },
            });

            if (pendingPayment) {
                break;
            }
            await wait(500); // Wait 0.5s
            retries--;
        }

        // Even if payment is missing after 4s, we MUST save the callback log
        // so we don't lose the data. 'invoiceId' will be null, which is fine.
        const invoiceId = pendingPayment?.invoiceId || null;

        // --- CASE 1: FAILED / CANCELLED ---
        if (ResultCode !== 0) {
            await prisma.failedCallback.create({
                data: {
                    merchantRequestId: MerchantRequestID,
                    checkoutRequestId: CheckoutRequestID,
                    resultCode: ResultCode,
                    resultDesc: ResultDesc,
                    invoiceId: invoiceId,
                },
            });

            if (pendingPayment) {
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

        // --- CASE 2: SUCCESS ---
        const metaItems = CallbackMetadata?.Item || [];
        const getMetaValue = (name: string) =>
            metaItems.find((i) => i.Name === name)?.Value;

        const amount = Number(getMetaValue("Amount"));
        const receiptNumber = String(getMetaValue("MpesaReceiptNumber"));
        const phoneNumber = String(getMetaValue("PhoneNumber"));
        const tDateVal = getMetaValue("TransactionDate");
        const transactionDate = tDateVal ? String(tDateVal) : "0";

        await prisma.successfulCallback.create({
            data: {
                merchantRequestId: MerchantRequestID,
                checkoutRequestId: CheckoutRequestID,
                resultCode: ResultCode,
                resultDesc: ResultDesc,
                amount: amount,
                mpesaReceiptNumber: receiptNumber,
                phoneNumber: BigInt(phoneNumber),
                transactionDate: BigInt(transactionDate),
                invoiceId: invoiceId,
            },
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

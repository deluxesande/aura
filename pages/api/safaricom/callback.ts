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
            include: { Invoice: true }, // Optional: include invoice if you need details
        });

        const invoiceId = pendingPayment?.invoiceId || null;

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
                // Determine Status based on code
                // 1032: Cancelled by user
                // 1037: DS Timeout (User didn't enter PIN)
                // 1: Insufficient Funds
                // 2001: Wrong PIN
                const statusToSet =
                    ResultCode === 1032 ? "CANCELLED" : "FAILED";

                // 3. UPDATE DB ATOMICALLY
                await prisma.$transaction([
                    prisma.mpesaPayment.update({
                        where: { id: pendingPayment.id },
                        data: { status: "FAILED" },
                    }),
                    prisma.invoice.update({
                        where: { id: pendingPayment.invoiceId },
                        data: { status: statusToSet },
                    }),
                ]);
            } else {
                console.warn(`Payment record missing for ${CheckoutRequestID}`);
            }

            return res.status(200).json({ result: "acknowledged_failure" });
        }

        const metaItems = CallbackMetadata?.Item || [];
        const getMetaValue = (name: string) =>
            metaItems.find((i) => i.Name === name)?.Value;

        const amount = Number(getMetaValue("Amount"));
        const receiptNumber = String(getMetaValue("MpesaReceiptNumber"));
        const phoneNumber = String(getMetaValue("PhoneNumber"));
        const transactionDate = getMetaValue("TransactionDate");

        await prisma.successfulCallback.create({
            data: {
                merchantRequestId: MerchantRequestID,
                checkoutRequestId: CheckoutRequestID,
                resultCode: ResultCode,
                resultDesc: ResultDesc,
                amount: amount,
                mpesaReceiptNumber: receiptNumber,
                phoneNumber: BigInt(phoneNumber),
                transactionDate: BigInt(transactionDate || 0),
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
        }

        return res.status(200).json({ result: "success" });
    } catch (error) {
        console.error("Callback Error:", error);
        return res.status(200).json({ result: "error_handled" });
    }
}

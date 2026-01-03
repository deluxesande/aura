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

        const { ResultCode, ResultDesc, CallbackMetadata, CheckoutRequestID } =
            payload.Body.stkCallback;

        let pendingPayment = null;
        let retries = 5;

        while (retries > 0) {
            pendingPayment = await prisma.subscriptionPayment.findUnique({
                where: { checkoutRequestId: CheckoutRequestID },
            });

            if (pendingPayment) {
                break;
            }

            await wait(500);
            retries--;
        }

        if (!pendingPayment) {
            console.warn(
                `Orphaned Subscription Callback: ${CheckoutRequestID}`
            );
            return res.status(200).json({ result: "orphaned_record" });
        }

        if (ResultCode !== 0) {
            // Map Safaricom codes to your statuses
            // 1032: Cancelled by user
            // 1037: DS timeout
            // 2001: Wrong PIN
            const newStatus = ResultCode === 1032 ? "CANCELLED" : "FAILED";

            await prisma.subscriptionPayment.update({
                where: { id: pendingPayment.id },
                data: {
                    status: newStatus,
                    // Optional: You could store ResultDesc in a 'meta' field if you added one
                },
            });

            return res.status(200).json({ result: "acknowledged_failure" });
        }

        const metaItems = CallbackMetadata?.Item || [];
        const getMetaValue = (name: string) =>
            metaItems.find((i) => i.Name === name)?.Value;

        const amount = Number(getMetaValue("Amount"));
        const receiptNumber = String(getMetaValue("MpesaReceiptNumber"));
        const phoneNumber = String(getMetaValue("PhoneNumber"));

        await prisma.subscriptionPayment.update({
            where: { id: pendingPayment.id },
            data: {
                status: "COMPLETED",
                mpesaReceiptNumber: receiptNumber,
                amount: amount,
                phoneNumber: phoneNumber,
                updatedAt: new Date(),
            },
        });

        return res.status(200).json({ result: "success" });
    } catch (error) {
        console.error("Subscription Callback Error:", error);
        // Always return 200 to Safaricom otherwise they spam your server for 72 hours
        return res.status(200).json({ result: "error_handled" });
    }
}

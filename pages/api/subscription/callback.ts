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

        // Retry logic to handle race conditions where STK callback hits before DB record is saved
        while (retries > 0) {
            pendingPayment = await prisma.subscriptionPayment.findUnique({
                where: { checkoutRequestId: CheckoutRequestID },
            });
            if (pendingPayment) break;
            await wait(500);
            retries--;
        }

        if (!pendingPayment) {
            console.warn(
                `Orphaned Subscription Callback: ${CheckoutRequestID}`
            );
            return res.status(200).json({ result: "orphaned_record" });
        }

        // Handle Failure
        if (ResultCode !== 0) {
            await prisma.subscriptionPayment.update({
                where: { id: pendingPayment.id },
                data: { status: ResultCode === 1032 ? "CANCELLED" : "FAILED" },
            });
            return res.status(200).json({ result: "acknowledged_failure" });
        }

        // Handle Success
        const metaItems = CallbackMetadata?.Item || [];
        const getMetaValue = (name: string) =>
            metaItems.find((i) => i.Name === name)?.Value;

        const amount = Number(getMetaValue("Amount"));
        const receiptNumber = String(getMetaValue("MpesaReceiptNumber"));
        const phoneNumber = String(getMetaValue("PhoneNumber"));

        const user = await prisma.user.findUnique({
            where: { clerkId: pendingPayment.userId },
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

        if (!user || !user.Business) {
            console.error(
                `Business context not found for user: ${pendingPayment.userId}`
            );
            return res.status(200).json({ result: "context_missing" });
        }

        const businessId = user.businessId!;
        const currentActiveSub = user.Business.subscriptions[0];

        const newExpiry = new Date();
        newExpiry.setDate(newExpiry.getDate() + 30);

        await prisma.$transaction(async (tx) => {
            // A. Mark old subscription as CANCELED if it exists
            if (currentActiveSub) {
                await tx.subscription.update({
                    where: { id: currentActiveSub.id },
                    data: { status: "CANCELED" },
                });
            }

            // B. Create the NEW subscription
            const newSubscription = await tx.subscription.create({
                data: {
                    businessId: businessId,
                    plan: pendingPayment!.planId as any,
                    status: "ACTIVE",
                    currentPeriodStart: new Date(),
                    currentPeriodEnd: newExpiry,
                },
            });

            // C. Update the Payment and link it to the NEW subscription record
            await tx.subscriptionPayment.update({
                where: { id: pendingPayment!.id },
                data: {
                    status: "COMPLETED",
                    mpesaReceiptNumber: receiptNumber,
                    amount: amount,
                    phoneNumber: phoneNumber,
                    subscriptionId: newSubscription.id,
                    updatedAt: new Date(),
                },
            });
        });

        return res.status(200).json({ result: "success" });
    } catch (error) {
        console.error("Subscription Callback Error:", error);
        // Safaricom requires a 200 OK even on logic errors to stop retries
        return res.status(200).json({ result: "error_handled" });
    }
}

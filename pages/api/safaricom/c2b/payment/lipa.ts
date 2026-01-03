import { getAuth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";
import { storeResponseInDb } from "@/utils/storeInDb";

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

const { CONSUMER_KEY, CONSUMER_SECRET, SHORTCODE, PASS_KEY, CALLBACK_URL } =
    process.env;

const OAUTH_URL =
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";
const STK_PUSH_URL =
    "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";

const getAccessToken = async () => {
    if (!CONSUMER_KEY || !CONSUMER_SECRET) {
        throw new Error("Missing CONSUMER_KEY or CONSUMER_SECRET");
    }
    const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString(
        "base64"
    );
    const response = await axios.get(OAUTH_URL, {
        headers: { Authorization: `Basic ${auth}` },
    });
    return response.data.access_token;
};

const formatPhoneNumber = (phone: string) => {
    let p = phone.replace(/\D/g, "");
    if (p.length === 10 && p.startsWith("0")) return `254${p.substring(1)}`;
    if (p.length === 9 && (p.startsWith("7") || p.startsWith("1")))
        return `254${p}`;
    if (p.length === 12 && p.startsWith("254")) return p;
    return p;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { phoneNumber, amount, invoiceId } = req.body;
        const { userId } = getAuth(req);

        if (!invoiceId || !userId || !amount || !phoneNumber) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: {
                id: true,
                businessId: true,
                Business: {
                    include: {
                        subscription: true,
                    },
                },
            },
        });

        if (!user || !user.businessId || !user.Business) {
            return res
                .status(400)
                .json({ error: "User is not linked to a valid business" });
        }

        const subscription = user.Business.subscription;

        if (subscription && subscription.plan === "STARTER") {
            const currentTxCount = await prisma.invoice.count({
                where: {
                    businessId: user.businessId,
                    status: "PAID",
                    createdAt: {
                        gte: subscription.currentPeriodStart,
                        lte: subscription.currentPeriodEnd,
                    },
                },
            });

            if (currentTxCount >= 100) {
                return res.status(403).json({
                    error: "Transaction limit reached",
                    message:
                        "You have reached the 100-transaction monthly limit for the STARTER plan.",
                    usage: {
                        current: currentTxCount,
                        limit: 100,
                        resetDate: subscription.currentPeriodEnd,
                    },
                    suggestion:
                        "Please upgrade to the STANDARD or PREMIUM plan to continue processing payments.",
                });
            }
        }

        const token = await getAccessToken();
        const date = new Date();
        const timestamp =
            date.getFullYear() +
            ("0" + (date.getMonth() + 1)).slice(-2) +
            ("0" + date.getDate()).slice(-2) +
            ("0" + date.getHours()).slice(-2) +
            ("0" + date.getMinutes()).slice(-2) +
            ("0" + date.getSeconds()).slice(-2);

        if (!SHORTCODE || !PASS_KEY || !CALLBACK_URL) {
            throw new Error("Missing M-Pesa env variables");
        }

        const password = Buffer.from(
            `${SHORTCODE}${PASS_KEY}${timestamp}`
        ).toString("base64");
        const formattedPhone = formatPhoneNumber(phoneNumber);

        const stkData = {
            BusinessShortCode: SHORTCODE,
            Password: password,
            Timestamp: timestamp,
            TransactionType: "CustomerPayBillOnline",
            Amount: Math.ceil(Number(amount)),
            PartyA: formattedPhone,
            PartyB: SHORTCODE,
            PhoneNumber: formattedPhone,
            CallBackURL: CALLBACK_URL,
            AccountReference: "Invoice Payment",
            TransactionDesc: `Invoice ${invoiceId}`,
        };

        const stkResponse = await axios.post(STK_PUSH_URL, stkData, {
            headers: { Authorization: `Bearer ${token}` },
        });

        await storeResponseInDb(stkResponse.data);

        await prisma.mpesaPayment.create({
            data: {
                amount: parseFloat(amount),
                phoneNumber: formattedPhone,
                accountReference: "Invoice Payment",
                transactionDesc: "M-Pesa STK Push",
                merchantRequestId: stkResponse.data.MerchantRequestID,
                checkoutRequestId: stkResponse.data.CheckoutRequestID,
                status: "PENDING",
                invoiceId: invoiceId,
                userId: user.id,
                businessId: user.businessId,
            },
        });

        return res.status(200).json({
            data: stkResponse.data,
            message: "STK Push sent",
            usageRemaining:
                subscription?.plan === "STARTER"
                    ? 100 -
                      (await getInvoiceCount(user.businessId, subscription))
                    : "Unlimited",
        });
    } catch (error: any) {
        console.error("STK API Error:", error?.response?.data || error.message);
        return res.status(500).json({
            error: "Payment initiation failed",
            details: error?.response?.data || error.message,
        });
    }
}

async function getInvoiceCount(businessId: string, subscription: any) {
    return await prisma.invoice.count({
        where: {
            businessId,
            status: "PAID",
            createdAt: {
                gte: subscription.currentPeriodStart,
                lte: subscription.currentPeriodEnd,
            },
        },
    });
}

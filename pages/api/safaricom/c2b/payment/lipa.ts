import { getAuth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";
import { storeResponseInDb } from "@/utils/storeInDb";
import { decrypt } from "@/utils/crypto";
const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Callback is still likely an env variable as it's consistent across the app
const { CALLBACK_URL } = process.env;

const OAUTH_URL =
    "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";
const STK_PUSH_URL =
    "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest";

const getAccessToken = async (consumerKey: string, consumerSecret: string) => {
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString(
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

async function getInvoiceCount(businessId: string, subscription: any) {
    if (!subscription) return 0;
    return await prisma.invoice.count({
        where: {
            businessId,
            status: "PAID",
            paymentType: "MPESA",
            // createdAt: {
            //     gte: subscription.currentPeriodStart,
            //     lte: subscription.currentPeriodEnd,
            // },
        },
    });
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST")
        return res.status(405).json({ error: "Method not allowed" });

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
                        subscriptions: {
                            where: { status: "ACTIVE" },
                            orderBy: { createdAt: "desc" },
                            take: 1,
                        },
                    },
                },
            },
        });

        if (!user || !user.businessId || !user.Business) {
            return res
                .status(400)
                .json({ error: "User is not linked to a valid business" });
        }

        const biz = user.Business;

        if (
            !biz.mpesaConsumerKey ||
            !biz.mpesaConsumerSecret ||
            !biz.mpesaPassKey ||
            !biz.mpesaShortCode
        ) {
            return res.status(403).json({
                error: "M-Pesa integration not configured",
                message:
                    "Please go to Settings > Integrations and enter your M-Pesa Daraja keys to enable payments.",
            });
        }

        const consumerKey = decrypt(biz.mpesaConsumerKey);
        const consumerSecret = decrypt(biz.mpesaConsumerSecret);
        const passKey = decrypt(biz.mpesaPassKey);
        const shortCode = biz.mpesaShortCode;

        const subscription = biz.subscriptions[0];
        if (subscription && subscription.plan === "STARTER") {
            const currentTxCount = await getInvoiceCount(
                user.businessId,
                subscription
            );
            if (currentTxCount >= 100) {
                return res
                    .status(403)
                    .json({ error: "Transaction limit reached" });
            }
        }

        const token = await getAccessToken(consumerKey, consumerSecret);
        const date = new Date();
        const timestamp =
            date.getFullYear() +
            ("0" + (date.getMonth() + 1)).slice(-2) +
            ("0" + date.getDate()).slice(-2) +
            ("0" + date.getHours()).slice(-2) +
            ("0" + date.getMinutes()).slice(-2) +
            ("0" + date.getSeconds()).slice(-2);

        const password = Buffer.from(
            `${shortCode}${passKey}${timestamp}`
        ).toString("base64");
        const formattedPhone = formatPhoneNumber(phoneNumber);
        const fullAmount = Math.ceil(Number(amount));

        const stkData = {
            BusinessShortCode: shortCode,
            Password: password,
            Timestamp: timestamp,
            TransactionType: "CustomerPayBillOnline",
            Amount: fullAmount,
            PartyA: formattedPhone,
            PartyB: shortCode,
            PhoneNumber: formattedPhone,
            CallBackURL: CALLBACK_URL,
            AccountReference: biz.name || "Invoice Payment",
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

        return res
            .status(200)
            .json({ data: stkResponse.data, message: "STK Push sent" });
    } catch (error: any) {
        console.error("STK API Error:", error?.response?.data || error.message);
        return res.status(500).json({
            error: "Payment initiation failed",
            details: error?.response?.data || error.message,
        });
    }
}

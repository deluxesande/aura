import { getAuth } from "@clerk/nextjs/server";
import axios, { AxiosError } from "axios";
import type { NextApiRequest, NextApiResponse } from "next";
import { masterPrisma, getTenantPrisma } from "@/utils/lib/prisma";
import { storeResponseInDb } from "@/utils/storeInDb";
import { decrypt } from "@/utils/crypto";

const { CALLBACK_URL } = process.env;

const OAUTH_URL =
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";
const STK_PUSH_URL =
    "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";

// Rate limiting state (In-memory)
const rateLimitMap = new Map<string, { count: number, resetTime: number }>();

function isRateLimited(userId: string): boolean {
    const now = Date.now();
    const userLimit = rateLimitMap.get(userId);

    if (!userLimit || now > userLimit.resetTime) {
        // First request or window expired
        rateLimitMap.set(userId, { count: 1, resetTime: now + 60000 });
        return false;
    }

    if (userLimit.count >= 3) {
        return true;
    }

    userLimit.count += 1;
    return false;
}

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

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST")
        return res.status(405).json({ error: "Method not allowed" });

    try {
        const { phoneNumber, amount, invoiceId } = req.body;
        const { userId: clerkId } = getAuth(req);

        if (!clerkId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // Apply Rate Limiting
        if (isRateLimited(clerkId)) {
            return res.status(429).json({ 
                error: "Too Many Requests", 
                message: "You can only initiate 3 STK pushes per minute. Please wait before trying again." 
            });
        }

        if (!invoiceId || !amount || !phoneNumber) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // 1. Fetch User and Business from Master DB
        const user = await masterPrisma.user.findUnique({
            where: { clerkId },
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

        const businessId = user.businessId;
        const biz = user.Business;
        const tenantPrisma = await getTenantPrisma(businessId);

        if (
            !biz.mpesaConsumerKey ||
            !biz.mpesaConsumerSecret ||
            !biz.mpesaPassKey ||
            !biz.mpesaShortCode
        ) {
            return res.status(403).json({
                error: "M-Pesa integration not configured",
                message: "Please go to Settings > Integrations and enter your M-Pesa Daraja keys to enable payments.",
            });
        }

        const consumerKey = decrypt(biz.mpesaConsumerKey);
        const consumerSecret = decrypt(biz.mpesaConsumerSecret);
        const passKey = decrypt(biz.mpesaPassKey);
        const shortCode = biz.mpesaShortCode;

        // 2. Check Plan Limits from Master DB and stats from Tenant DB
        const subscription = biz.subscriptions[0];
        if (subscription && subscription.plan === "STARTER") {
            const currentTxCount = await tenantPrisma.invoice.count({
                where: {
                    businessId: businessId,
                    status: "PAID",
                    paymentType: "MPESA",
                    createdAt: {
                        gte: subscription.currentPeriodStart,
                        lte: subscription.currentPeriodEnd,
                    },
                },
            });
            if (currentTxCount >= 100) {
                return res
                    .status(403)
                    .json({ error: "Transaction limit reached" });
            }
        }

        // 3. Initiate STK Push
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

        // 4. Record Response and Payment
        await storeResponseInDb(tenantPrisma, stkResponse.data);

        // A. Record Routing in Master DB (CRITICAL for callback routing)
        await masterPrisma.mpesaRouting.create({
            data: {
                checkoutRequestId: stkResponse.data.CheckoutRequestID,
                businessId: businessId,
            }
        });

        // B. Record Pending Payment in Tenant DB
        await tenantPrisma.mpesaPayment.create({
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
                businessId: businessId, // Logical reference
            },
        });

        return res
            .status(200)
            .json({ data: stkResponse.data, message: "STK Push sent" });
    } catch (error) {
        const axiosError = error as AxiosError;
        console.error("STK API Error:", axiosError);
        return res.status(500).json({
            error: "Payment initiation failed",
            details: axiosError.response?.data || axiosError.message,
        });
    }
}

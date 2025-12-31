import { storeResponseInDb } from "@/utils/storeInDb";
import { PrismaClient } from "@prisma/client";
import axios, { AxiosError } from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

// 1. Prisma Singleton Pattern (Prevents "Too many connections" in development)
const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

const {
    CONSUMER_KEY: consumerKey,
    CONSUMER_SECRET: consumerSecret,
    CALLBACK_URL: callbackUrl,
    SHORTCODE: shortCode,
    PASS_KEY: passkey,
} = process.env;

// Helper: Format phone to 254XXXXXXXXX
const formatPhoneNumber = (phone: string) => {
    let p = phone.replace(/\D/g, "");

    // Handle 07... and 01... (Standard 10 digits)
    if (p.length === 10 && p.startsWith("0")) {
        return `254${p.substring(1)}`;
    }

    // Handle 7... and 1... (Short 9 digits)
    if (p.length === 9 && (p.startsWith("7") || p.startsWith("1"))) {
        return `254${p}`;
    }

    // Handle 254... (International 12 digits)
    if (p.length === 12 && p.startsWith("254")) {
        return p;
    }

    return p;
};

const generatePassword = () => {
    const timestamp = new Date()
        .toISOString()
        .replace(/[-:.TZ]/g, "")
        .slice(0, 14);
    const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString(
        "base64"
    );
    return { timestamp, password };
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST")
        return res.status(405).json({ error: "Method not allowed" });

    const {
        phoneNumber,
        amount,
        transactionType = "CustomerPayBillOnline",
    } = req.body;

    if (!phoneNumber || !amount) {
        return res
            .status(400)
            .json({ error: "Phone number and amount are required" });
    }

    if (
        !consumerKey ||
        !consumerSecret ||
        !callbackUrl ||
        !shortCode ||
        !passkey
    ) {
        console.error("CRITICAL: Missing M-Pesa environment variables.");
        return res.status(500).json({ error: "Server Configuration Error" });
    }

    try {
        const authResponse = await axios.get(
            "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
            {
                auth: { username: consumerKey, password: consumerSecret },
            }
        );
        const accessToken = authResponse.data.access_token;

        const formattedPhone = formatPhoneNumber(phoneNumber);
        const formattedAmount = Math.floor(Number(amount));
        const { timestamp, password } = generatePassword();

        const { data: paymentResponse } = await axios.post(
            "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
            {
                BusinessShortCode: shortCode,
                Password: password,
                Timestamp: timestamp,
                TransactionType: transactionType,
                Amount: formattedAmount,
                PartyA: formattedPhone,
                PartyB: shortCode,
                PhoneNumber: formattedPhone,
                CallBackURL: callbackUrl,
                AccountReference: "Salesense",
                TransactionDesc: "Payment for goods",
            },
            {
                headers: { Authorization: `Bearer ${accessToken}` },
            }
        );

        storeResponseInDb(paymentResponse);

        return res.status(200).json({
            success: true,
            message: "STK Push sent",
            data: paymentResponse,
        });
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            return res.status(error.response.status).json({
                error: "M-Pesa Error",
                details: error.response.data.errorMessage || "STK Push Failed",
            });
        }

        return res.status(500).json({ error: "Internal Server Error" });
    }
}

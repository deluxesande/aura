import { getAuth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

const getAccessToken = async () => {
    const consumerKey = process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    const url = process.env.MPESA_OAUTH_URL!;
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString(
        "base64"
    );

    const response = await axios.get(url, {
        headers: { Authorization: `Basic ${auth}` },
    });
    return response.data.access_token;
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

        if (!invoiceId || !userId) {
            return res
                .status(400)
                .json({ error: "Missing invoiceId or userId" });
        }

        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { id: true, businessId: true },
        });

        if (!user || !user.businessId) {
            console.error("Lipa Error: User missing Business ID linkage");
            return res
                .status(400)
                .json({ error: "User is not linked to a business" });
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

        const shortCode = process.env.MPESA_SHORTCODE;
        const passkey = process.env.MPESA_PASSKEY;
        const password = Buffer.from(
            `${shortCode}${passkey}${timestamp}`
        ).toString("base64");

        const stkData = {
            BusinessShortCode: shortCode,
            Password: password,
            Timestamp: timestamp,
            TransactionType: "CustomerPayBillOnline",
            Amount: Math.ceil(Number(amount)),
            PartyA: phoneNumber,
            PartyB: shortCode,
            PhoneNumber: phoneNumber,
            CallBackURL: process.env.MPESA_CALLBACK_URL,
            AccountReference: "Invoice Payment",
            TransactionDesc: `Invoice ${invoiceId}`,
        };

        const stkResponse = await axios.post(
            process.env.MPESA_STK_PUSH_URL!,
            stkData,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        try {
            await prisma.mpesaPayment.create({
                data: {
                    amount: parseFloat(amount),
                    phoneNumber: phoneNumber,
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
        } catch (dbError) {
            console.error(
                "CRITICAL DB ERROR: Failed to save payment record:",
                dbError
            );
        }

        return res.status(200).json({
            data: stkResponse.data,
            message: "STK Push sent",
        });
    } catch (error: any) {
        console.error("STK API Error:", error?.response?.data || error);
        return res.status(500).json({ error: "Payment initiation failed" });
    }
}

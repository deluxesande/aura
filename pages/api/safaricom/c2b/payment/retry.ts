import { getAuth } from "@clerk/nextjs/server";
import { masterPrisma, getTenantPrisma } from "@/utils/lib/prisma";
import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

const {
    CONSUMER_KEY,
    CONSUMER_SECRET,
    SHORTCODE,
    PASS_KEY,
    CALLBACK_URL,
    OAUTH_URL,
    STK_PUSH_URL,
} = process.env;

const getAccessToken = async () => {
    const url =
        OAUTH_URL ||
        "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";

    if (!CONSUMER_KEY || !CONSUMER_SECRET) {
        throw new Error("Missing CONSUMER_KEY or CONSUMER_SECRET");
    }

    const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString(
        "base64"
    );

    try {
        const response = await axios.get(url, {
            headers: { Authorization: `Basic ${auth}` },
        });
        return response.data.access_token;
    } catch (error) {
        console.error("Auth Error:", error);
        throw new Error("Failed to get M-Pesa access token");
    }
};

// Helper to ensure 254 format
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
        const { userId } = getAuth(req);
        const { invoiceId, phoneNumber: reqPhoneNumber } = req.body;

        if (!userId || !invoiceId) {
            return res.status(400).json({
                error: "Missing required fields (userId or invoiceId)",
            });
        }

        const user = await masterPrisma.user.findUnique({
            where: { clerkId: userId },
            select: { id: true, businessId: true },
        });

        if (!user || !user.businessId) {
            return res
                .status(400)
                .json({ error: "User is not linked to a business" });
        }

        const tenantPrisma = await getTenantPrisma(user.businessId);

        const invoice = await tenantPrisma.invoice.findUnique({
            where: { id: invoiceId },
            include: {
                Customer: true,
                mpesaPayments: {
                    orderBy: { createdAt: "desc" },
                    take: 1,
                },
            },
        });

        if (!invoice) {
            return res.status(404).json({ error: "Invoice not found" });
        }

        if (invoice.status === "PAID") {
            return res.status(400).json({ error: "Invoice is already paid" });
        }

        // Priority: 1. Request Body -> 2. Last Mpesa Attempt -> 3. Customer Profile
        let targetPhone =
            reqPhoneNumber ||
            invoice.mpesaPayments[0]?.phoneNumber ||
            invoice.Customer?.phoneNumber;

        if (!targetPhone) {
            return res.status(400).json({
                error: "No phone number found for this invoice. Please provide one explicitly.",
            });
        }

        const targetBusinessId =
            invoice.Customer?.businessId || user.businessId;

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

        const formattedPhone = formatPhoneNumber(targetPhone);

        const stkData = {
            BusinessShortCode: SHORTCODE,
            Password: password,
            Timestamp: timestamp,
            TransactionType: "CustomerPayBillOnline",
            Amount: Math.ceil(invoice.totalAmount),
            PartyA: formattedPhone,
            PartyB: SHORTCODE,
            PhoneNumber: formattedPhone,
            CallBackURL: CALLBACK_URL,
            AccountReference: "Invoice Retry",
            TransactionDesc: `Retry Invoice ${
                invoice.invoiceName || invoice.id.slice(0, 8)
            }`,
        };

        const stkResponse = await axios.post(
            STK_PUSH_URL ||
                "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
            stkData,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        // Create NEW Payment Record linked to Invoice
        await tenantPrisma.mpesaPayment.create({
            data: {
                amount: invoice.totalAmount,
                phoneNumber: formattedPhone,
                accountReference: "Invoice Retry",
                transactionDesc: `Retry Invoice ${invoice.id}`,
                merchantRequestId: stkResponse.data.MerchantRequestID,
                checkoutRequestId: stkResponse.data.CheckoutRequestID,
                status: "PENDING",
                invoiceId: invoice.id,
                businessId: targetBusinessId,
                userId: user.id,
            },
        });

        if (invoice.status !== "PENDING") {
            await tenantPrisma.invoice.update({
                where: { id: invoice.id },
                data: { status: "PENDING" },
            });
        }

        return res.status(200).json({
            success: true,
            message: "STK Push sent to " + formattedPhone,
            checkoutRequestId: stkResponse.data.CheckoutRequestID,
        });
    } catch (error: any) {
        console.error(
            "Retry Payment Error:",
            error?.response?.data || error.message
        );
        return res.status(500).json({
            error: "Failed to initiate retry",
            details: error?.response?.data || error.message,
        });
    }
}

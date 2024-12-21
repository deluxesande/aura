import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

const consumerKey = process.env.CONSUMER_KEY || "";
const consumerSecret = process.env.CONSUMER_SECRET || "";
const callbackUrl = process.env.CALLBACK_URL || "";
const shortCode = process.env.SHORTCODE || "";
const passkey = process.env.PASS_KEY || "";

// Function to get an access token from the endpoint
const getAccessToken = async () => {
    try {
        const response = await axios.get(
            "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
            {
                auth: {
                    username: consumerKey,
                    password: consumerSecret,
                },
            }
        );
        return response.data.access_token;
    } catch (error) {
        throw error;
    }
};

const initiatePayment = async (
    accessToken: string,
    phoneNumber: string,
    amount: number
) => {
    const url =
        "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";
    const timestamp = new Date()
        .toISOString()
        .replace(/[-:.TZ]/g, "")
        .slice(0, 14);
    const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString(
        "base64"
    );

    const requestData = {
        BusinessShortCode: shortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: phoneNumber,
        PartyB: shortCode,
        PhoneNumber: phoneNumber,
        CallBackURL: callbackUrl,
        AccountReference: "Salesense",
        TransactionDesc: "(development): Payment for goods",
    };

    try {
        const response = await axios.post(url, requestData, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error initiating payment:", error);
        throw new Error("Failed to initiate payment");
    }
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { phoneNumber, amount } = req.body;

    if (!phoneNumber || !amount) {
        return res
            .status(400)
            .json({ error: "Phone number and amount are required" });
    }

    try {
        const accessToken = await getAccessToken();
        const paymentResponse = await initiatePayment(
            accessToken,
            phoneNumber,
            amount
        );
        res.status(200).json(paymentResponse);
    } catch (error) {
        res.status(500).json({ error: "Failed to prompt user for payment" });
    }
};

export default handler;

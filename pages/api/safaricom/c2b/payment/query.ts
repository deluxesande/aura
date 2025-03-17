import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

const consumerKey = process.env.CONSUMER_KEY || "";
const consumerSecret = process.env.CONSUMER_SECRET || "";
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

// Function to check the transaction status
const checkTransactionStatus = async (
    accessToken: string,
    checkoutRequestId: string
) => {
    const url =
        "https://sandbox.safaricom.co.ke/mpesa/transactionstatus/v1/query";
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
        CheckoutRequestID: checkoutRequestId,
        IdentifierType: "4",
    };

    try {
        const response = await axios.post(url, requestData, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        return response.data;
    } catch (error) {
        // console.error("Error checking transaction status:", error);
        throw new Error("Failed to check transaction status");
    }
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { checkoutRequestId } = req.body;

    try {
        const accessToken = await getAccessToken();
        const statusResponse = await checkTransactionStatus(
            accessToken,
            checkoutRequestId
        );
        res.status(200).json(statusResponse);
    } catch (error) {
        res.status(500).json({ error: "Failed to check transaction status" });
    }
};

export default handler;

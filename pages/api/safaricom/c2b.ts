import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === "POST") {
        const { amount, phoneNumber } = req.body;

        const consumerKey = process.env.SAFARICOM_CONSUMER_KEY;
        const consumerSecret = process.env.SAFARICOM_CONSUMER_SECRET;
        const shortcode = process.env.SAFARICOM_SHORTCODE;
        const passkey = process.env.SAFARICOM_PASSKEY;
        const env = process.env.SAFARICOM_ENV;

        const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString(
            "base64"
        );

        try {
            // Get access token
            const {
                data: { access_token },
            } = await axios.get(
                `https://${env}.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials`,
                {
                    headers: {
                        Authorization: `Basic ${auth}`,
                    },
                }
            );

            // Initiate C2B payment
            const timestamp = new Date()
                .toISOString()
                .replace(/[-:]/g, "")
                .slice(0, 15);
            const password = Buffer.from(
                `${shortcode}${passkey}${timestamp}`
            ).toString("base64");

            const response = await axios.post(
                `https://${env}.safaricom.co.ke/mpesa/stkpush/v1/processrequest`,
                {
                    BusinessShortCode: shortcode,
                    Password: password,
                    Timestamp: timestamp,
                    TransactionType: "CustomerPayBillOnline",
                    Amount: amount,
                    PartyA: phoneNumber,
                    PartyB: shortcode,
                    PhoneNumber: phoneNumber,
                    CallBackURL: `${req.headers.origin}/api/safaricom/callback`,
                    AccountReference: uuidv4(),
                    TransactionDesc: "Payment for goods",
                },
                {
                    headers: {
                        Authorization: `Bearer ${access_token}`,
                    },
                }
            );

            res.status(200).json(response.data);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    } else {
        res.status(405).json({ message: "Method not allowed" });
    }
}

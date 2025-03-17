// pages/api/safaricom/registerCallback.ts

import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

const shortCode = process.env.SHORTCODE || "";
const confirmationURL = process.env.CONFIRMATION_URL || "";
const validationURL = process.env.VALIDATION_URL || "";
const callbackURL = process.env.CALLBACK_URL || "";
const consumerKey = process.env.CONSUMER_KEY || "";
const consumerSecret = process.env.CONSUMER_SECRET || "";

// Function to get an access token from the endpoint
const getAccessToken = async (consumerKey: string, consumerSecret: string) => {
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

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === "POST") {
        try {
            const accessToken = await getAccessToken(
                consumerKey,
                consumerSecret
            );

            const response = await axios.post(
                "https://sandbox.safaricom.co.ke/mpesa/c2b/v1/registerurl",
                {
                    ShortCode: shortCode,
                    ResponseType: "Completed",
                    ConfirmationURL: confirmationURL,
                    ValidationURL: validationURL,
                    // CallBackURL: callbackURL,
                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            res.status(200).json(response.data);
        } catch (error) {
            res.status(500).json({
                error: "Failed to register callback URL",
                details: error,
            });
        }
    } else {
        res.status(405).json({ error: "Method not allowed" });
    }
};

export default handler;

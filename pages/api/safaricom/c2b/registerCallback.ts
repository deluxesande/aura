// pages/api/safaricom/registerCallback.ts

import type { NextApiRequest, NextApiResponse } from "next";
import axios, { AxiosError } from "axios";

// Helper to remove double slashes (e.g. .ms//api -> .ms/api)
// preventing the "Invalid URL" or 500 error from Safaricom
const cleanUrl = (url: string) => url.replace(/([^:]\/)\/+/g, "$1");

const shortCode = "600000";
const confirmationURL = cleanUrl(process.env.CONFIRMATION_URL || "");
const validationURL = cleanUrl(process.env.VALIDATION_URL || "");
const consumerKey = process.env.CONSUMER_KEY || "";
const consumerSecret = process.env.CONSUMER_SECRET || "";

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
    } catch (error: any) {
        // Throw a structured error that the handler can parse
        throw {
            type: "AUTH_ERROR",
            message: "Failed to generate Access Token",
            details: error.response ? error.response.data : error.message,
        };
    }
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    // 1. Basic Validation
    if (!consumerKey || !consumerSecret) {
        return res
            .status(400)
            .json({ error: "Missing Consumer Key or Secret in env variables" });
    }

    try {
        const accessToken = await getAccessToken(consumerKey, consumerSecret);
        const response = await axios.post(
            "https://sandbox.safaricom.co.ke/mpesa/c2b/v1/registerurl",
            {
                ShortCode: shortCode,
                ResponseType: "Completed",
                ConfirmationURL: confirmationURL,
                ValidationURL: validationURL,
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        return res.status(200).json({
            success: true,
            data: response.data,
        });
    } catch (error: any) {
        console.error(error);

        // 2. Specific Error Handling
        if (axios.isAxiosError(error) && error.response) {
            // This is the actual error from Safaricom (e.g. "Invalid Validation URL")
            return res.status(error.response.status).json({
                error: "Safaricom API Error",
                status: error.response.status,
                safaricom_message: error.response.data,
            });
        } else if (error.type === "AUTH_ERROR") {
            // Auth specific errors
            return res.status(401).json(error);
        } else {
            // Generic network or code errors
            return res.status(500).json({
                error: "Internal Server Error",
                message: error.message,
            });
        }
    }
};

export default handler;

import { getAuth } from "@clerk/nextjs/server";
import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

// Ensure GAVA_CONSUMER_KEY and GAVA_CONSUMER_SECRET are still in your .env
const BASE_URL = "https://sbx.kra.go.ke";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { userId } = getAuth(req);

    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const { kraPin } = req.body;

    if (!kraPin) {
        return res.status(400).json({ error: "KRA PIN is required" });
    }

    const authUrl = `${BASE_URL}/v1/token/generate?grant_type=client_credentials`;
    const validationUrl = `${BASE_URL}/checker/v1/pinbypin`;

    try {
        const credentials = Buffer.from(
            `${process.env.KRA_PIN_CHECKER_CONSUMER_KEY}:${process.env.KRA_PIN_CHECKER_CONSUMER_SECRET}`
        ).toString("base64");

        const tokenResponse = await axios.get(authUrl, {
            headers: {
                Authorization: `Basic ${credentials}`,
            },
        });

        const accessToken = tokenResponse.data.access_token;

        if (!accessToken) {
            throw new Error("Failed to retrieve access token");
        }

        const validationResponse = await axios.post(
            validationUrl,
            { KRAPIN: kraPin },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            }
        );

        return res.status(200).json(validationResponse.data);
    } catch (error: any) {
        if (error.response?.status === 401) {
            return res.status(401).json({
                error: "Authentication failed. Check Gava credentials.",
            });
        }

        if (error.response?.status === 404) {
            return res.status(404).json({ error: "PIN not found or invalid" });
        }

        return res.status(500).json({
            error: "Failed to validate KRA PIN",
            details: error.response?.data || error.message,
        });
    }
}

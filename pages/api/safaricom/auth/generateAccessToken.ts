import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

const consumerKey = process.env.CONSUMER_KEY || "";
const consumerSecret = process.env.CONSUMER_SECRET || "";

// Function to generate an access token
const generateAccessToken = async (
    consumerKey: string,
    consumerSecret: string
) => {
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
    try {
        const accessToken = await generateAccessToken(
            consumerKey,
            consumerSecret
        );
        res.status(200).json({ accessToken });
    } catch (error) {
        res.status(500).json({ error: "Failed to generate access token" });
    }
};

export default handler;

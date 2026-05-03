import { getAuth } from "@clerk/nextjs/server";
import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/utils/lib/client";
import { getTenantPrisma } from "@/utils/lib/prisma";

const BASE_URL = "https://api.kra.go.ke";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
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

    try {
        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { businessId: true },
        });

        if (!user || !user.businessId) {
            return res
                .status(404)
                .json({ error: "Business profile not found for this user." });
        }

        const tenantPrisma = await getTenantPrisma(user.businessId);

        const authUrl = `${BASE_URL}/v1/token/generate?grant_type=client_credentials`;
        const credentials = Buffer.from(
            `${process.env.KRA_PIN_CHECKER_CONSUMER_KEY}:${process.env.KRA_PIN_CHECKER_CONSUMER_SECRET}`,
        ).toString("base64");

        const tokenResponse = await axios.get(authUrl, {
            headers: {
                Authorization: `Basic ${credentials}`,
            },
        });

        const accessToken = tokenResponse.data.access_token;

        if (!accessToken) {
            throw new Error("Failed to retrieve access token from KRA.");
        }

        const validationUrl = `${BASE_URL}/checker/v1/pinbypin`;

        const validationResponse = await axios.post(
            validationUrl,
            { KRAPIN: kraPin },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            },
        );

        const kraData = validationResponse.data;

        if (kraData.PINDATA) {
            const { KRAPIN, TypeOfTaxpayer, Name, StatusOfPIN } =
                kraData.PINDATA;

            await tenantPrisma.kraDetails.upsert({
                where: {
                    businessId: user.businessId,
                },
                update: {
                    kraPin: KRAPIN,
                    taxpayerType: TypeOfTaxpayer,
                    taxpayerName: Name,
                    pinStatus: StatusOfPIN,
                },
                create: {
                    kraPin: KRAPIN,
                    taxpayerType: TypeOfTaxpayer,
                    taxpayerName: Name,
                    pinStatus: StatusOfPIN,
                    businessId: user.businessId,
                },
            });
        } else {
            if (kraData.ResponseCode && kraData.ResponseCode !== "23000") {
                return res.status(400).json({
                    error: kraData.Message || "Validation Failed",
                    details: kraData,
                });
            }
        }

        return res.status(200).json(kraData);
    } catch (error: any) {
        console.error("KRA/DB Error:", error.response?.data || error.message);

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

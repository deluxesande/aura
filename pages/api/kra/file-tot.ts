import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/utils/lib/client";
import { getTenantPrisma } from "@/utils/lib/prisma";

// FIX: Use Sandbox for BOTH Auth and Filing
const API_DOMAIN = "https://sbx.kra.go.ke";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { totalSales, period } = req.body;

    if (!totalSales || !period) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const { userId } = getAuth(req);
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: {
                id: true,
                role: true,
                businessId: true,
            },
        });

        if (!user || !user.businessId) {
            return res
                .status(404)
                .json({ error: "Business profile not found." });
        }

        const tenantPrisma = await getTenantPrisma(user.businessId);

        const kraDetails = await tenantPrisma.kraDetails.findUnique({
            where: { businessId: user.businessId },
        });

        if (!kraDetails || !kraDetails.kraPin) {
            return res.status(400).json({
                error: "KRA PIN not configured. Please set it in settings.",
            });
        }

        const kraPin = kraDetails.kraPin;

        // 1. AUTHENTICATE (Sandbox)
        const authUrl = `${API_DOMAIN}/v1/token/generate?grant_type=client_credentials`;
        const credentials = Buffer.from(
            `${process.env.KRA_TOT_CONSUMER_KEY}:${process.env.KRA_TOT_CONSUMER_SECRET}`,
        ).toString("base64");

        const tokenResponse = await axios.get(authUrl, {
            headers: { Authorization: `Basic ${credentials}` },
        });

        const accessToken = tokenResponse.data.access_token;
        if (!accessToken) {
            console.error("Token Response Data:", tokenResponse.data);
            throw new Error("Failed to retrieve access token from KRA.");
        }

        // 2. PREPARE PAYLOAD
        const [year, rawMonth] = period.split("-");
        const month = rawMonth.padStart(2, "0");

        const totPayload = {
            TAXPAYERDETAILS: {
                TaxpayerPIN: kraPin,
                Month: month,
                Year: year,
                GrossTurnover: parseFloat(totalSales),
            },
        };

        // 3. FILE RETURN (Sandbox)
        const filingUrl = `${API_DOMAIN}/filing/v1/tot/paymentregistration`;

        const filingResponse = await axios.post(filingUrl, totPayload, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        });

        const kraData = filingResponse.data;

        if (kraData.Status === "OK" || kraData.ResponseCode === "87000") {
            // 4. SAVE TO DATABASE
            await tenantPrisma.kraTotReturn.create({
                data: {
                    ackNumber: kraData.AckNumber,
                    paymentSlip: kraData.PRN,
                    computedTax: parseFloat(kraData.ComputedTax),
                    taxPayable: parseFloat(kraData.TaxPayable),
                    period: period,
                    businessId: user.businessId,
                },
            });

            return res.status(200).json({
                message: "Return Filed Successfully",
                details: {
                    ackNumber: kraData.AckNumber,
                    paymentSlip: kraData.PRN,
                    taxPayable: kraData.TaxPayable,
                    totalTax: kraData.ComputedTax,
                },
            });
        } else {
            return res.status(400).json({
                error: kraData.Message || "Filing Failed",
                code: kraData.ResponseCode,
                raw: kraData,
            });
        }
    } catch (error: any) {
        console.error("KRA TOT Filing Error:", error);

        if (
            error.response?.data?.fault?.faultstring ===
            "Unexpected EOF at target"
        ) {
            return res.status(502).json({
                error: "KRA Sandbox Error: The backend dropped the connection.",
                solution:
                    "This usually happens when using a Real PIN in Sandbox. Ensure you are using a valid KRA Test PIN.",
            });
        }

        if (error.response?.status === 401) {
            return res.status(401).json({
                error: "Authentication failed. Check your CONSUMER_KEY and SECRET.",
            });
        }

        return res.status(500).json({
            error: "Failed to file tax return",
            details: error.response?.data || error.message,
        });
    }
}

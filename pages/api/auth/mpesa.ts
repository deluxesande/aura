import { getAuth } from "@clerk/nextjs/server";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/utils/lib/client";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { userId } = getAuth(req);

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const business = await prisma.business.findFirst({
            where: {
                createdBy: userId,
            },
            select: {
                id: true,
                mpesaConsumerKey: true,
                mpesaConsumerSecret: true,
                mpesaPassKey: true,
                mpesaShortCode: true,
            },
        });

        if (!business) {
            return res.status(404).json({ error: "Business not found" });
        }

        const maskedData = {
            id: business.id,
            mpesaConsumerKey: business.mpesaConsumerKey ? "***********" : "",
            mpesaConsumerSecret: business.mpesaConsumerSecret
                ? "***********"
                : "",
            mpesaPassKey: business.mpesaPassKey ? "***********" : "",
            mpesaShortCode: business.mpesaShortCode || "",
        };

        return res.status(200).json(maskedData);
    } catch (error) {
        console.error("Error fetching mpesa status:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

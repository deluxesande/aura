import { getAuth } from "@clerk/nextjs/server";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/utils/lib/client";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { userId } = getAuth(req);

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const user = await prisma.user.findUnique({
            where: {
                clerkId: userId,
            },
            select: { businessId: true },
        });

        if (!user || !user.businessId) {
            return res.status(404).json({ error: "Business not found" });
        }

        const kraDetails = await prisma.kraDetails.findUnique({
            where: {
                businessId: user.businessId,
            },
        });

        return res.status(200).json(kraDetails);
    } catch (error) {
        console.error("Error fetching KRA details:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

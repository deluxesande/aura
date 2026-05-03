import { getAuth } from "@clerk/nextjs/server";
import { NextApiRequest, NextApiResponse } from "next";
import { masterPrisma, getTenantPrisma } from "@/utils/lib/prisma";

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

        // 1. Fetch User context from Master DB
        const user = await masterPrisma.user.findUnique({
            where: {
                clerkId: userId,
            },
            select: { businessId: true },
        });

        if (!user || !user.businessId) {
            return res.status(404).json({ error: "Business not found" });
        }

        const businessId = user.businessId;
        const tenantPrisma = await getTenantPrisma(businessId);

        // 2. Fetch KRA details from Tenant DB
        const kraDetails = await tenantPrisma.kraDetails.findUnique({
            where: {
                businessId: businessId,
            },
        });

        return res.status(200).json(kraDetails);
    } catch (error) {
        console.error("Error fetching KRA details:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

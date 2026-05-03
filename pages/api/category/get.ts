import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import { masterPrisma } from "@/utils/lib/prisma";
import { getTenantPrisma } from "@/utils/lib/prisma";

export const getCategories = async (
    req: NextApiRequest,
    res: NextApiResponse
) => {
    try {
        const { userId } = getAuth(req);

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // Get current user with their business from Master DB
        const currentUser = await masterPrisma.user.findUnique({
            where: { clerkId: userId },
            select: { businessId: true },
        });

        if (!currentUser || !currentUser.businessId) {
            // Return empty list if business is not yet setup (onboarding)
            return res.status(200).json([]);
        }

        const tenantPrisma = await getTenantPrisma(currentUser.businessId);

        // Get categories from Tenant DB (Tenant DBs are already isolated per business)
        const categories = await tenantPrisma.category.findMany();

        res.status(200).json(categories);
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export default getCategories;

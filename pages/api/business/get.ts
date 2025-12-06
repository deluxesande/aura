import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/utils/lib/client";

export const getBusiness = async (
    req: NextApiRequest,
    res: NextApiResponse
) => {
    const { userId } = getAuth(req);

    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const currentUser = await prisma.user.findUnique({
        where: { clerkId: userId },
    });

    if (!currentUser) {
        return res.status(404).json({ error: "User not found" });
    }

    // If user has no business, return empty array
    if (!currentUser.businessId) {
        return res.status(200).json([]);
    }

    const business = await prisma.business.findMany({
        where: {
            id: currentUser.businessId,
        },
    });

    res.status(200).json(business);
};

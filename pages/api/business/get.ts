import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/utils/lib/client";

export const getBusiness = async (
    req: NextApiRequest,
    res: NextApiResponse
) => {
    const { userId } = getAuth(req);

    const currentUser = await prisma.user.findUnique({
        where: { clerkId: userId ?? undefined },
    });

    const business = await prisma.business.findMany({
        where: {
            id: currentUser?.businessId ?? undefined,
        },
    });

    res.status(200).json(business);
};

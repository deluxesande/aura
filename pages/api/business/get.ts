import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/utils/lib/client";

export const getBusiness = async (
    req: NextApiRequest,
    res: NextApiResponse
) => {
    const { userId } = getAuth(req);

    const business = await prisma.business.findMany({
        where: {
            createdBy: userId,
        },
    });

    res.status(200).json(business);
};

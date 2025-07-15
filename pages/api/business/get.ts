import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { getAuth } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

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

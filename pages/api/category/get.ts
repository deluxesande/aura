import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/utils/lib/client";

export const getCategories = async (
    req: NextApiRequest,
    res: NextApiResponse
) => {
    try {
        const { userId } = getAuth(req);

        const categories = await prisma.category.findMany({
            where: {
                createdBy: userId,
            },
        });

        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ error: error });
    } finally {
        await prisma.$disconnect();
    }
};

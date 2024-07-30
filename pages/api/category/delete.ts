import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export const deleteCategory = async (
    req: NextApiRequest,
    res: NextApiResponse
) => {
    const { id } = req.body;

    try {
        await prisma.category.delete({
            where: {
                id: id,
            },
        });
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ error: "Failed to delete category" });
    }
};

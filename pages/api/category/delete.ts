import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/utils/lib/client";

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
        res.status(404).json({ error: "Failed to delete category" });
    }
};

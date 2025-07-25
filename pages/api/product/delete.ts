import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/utils/lib/client";

export const deleteProduct = async (
    req: NextApiRequest,
    res: NextApiResponse
) => {
    const id = req.query.id as string;

    try {
        await prisma.product.delete({
            where: {
                id: id,
            },
        });
        res.status(204).end();
    } catch (error) {
        res.status(404).json({ error: "Failed to delete product" });
    }
};

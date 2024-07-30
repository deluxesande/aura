import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export const updateCategory = async (
    req: NextApiRequest,
    res: NextApiResponse
) => {
    const id = Number(req.query.id);
    const { name, description } = req.body;

    if (!id || typeof id !== "number") {
        return res
            .status(400)
            .json({ error: "Invalid or missing category ID" });
    }

    try {
        const updatedCategory = await prisma.category.update({
            where: {
                id: id,
            },
            data: {
                name,
                description,
            },
        });

        res.status(200).json(updatedCategory);
    } catch (error) {
        res.status(500).json({ error: "Failed to update category" });
    }
};

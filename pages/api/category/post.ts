import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export const addCategory = async (
    req: NextApiRequest,
    res: NextApiResponse
) => {
    const { name, description } = req.body;

    try {
        const newCategory = await prisma.category.create({
            data: {
                name,
                description,
            },
        });

        res.status(201).json(newCategory);
    } catch (error) {
        res.status(500).json({ error: "Failed to add category" + error });
    }
};

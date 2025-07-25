import { NextApiRequest, NextApiResponse } from "next";
import { addCreatedBy } from "../middleware";
import { prisma } from "@/utils/lib/client";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const { name, description } = req.body;

    try {
        const newCategory = await prisma.category.create({
            data: {
                name,
                description,
                createdBy: req.body.createdBy,
            },
        });

        res.status(201).json(newCategory);
    } catch (error) {
        res.status(500).json({ error: "Failed to add category" + error });
    }
};

export const addCategory = addCreatedBy(handler);

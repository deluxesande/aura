import type { NextApiRequest, NextApiResponse } from "next";
import { updateCategory } from "./update";
import { deleteCategory } from "./delete";
import { prisma } from "@/utils/lib/client";

async function getCategoryById(req: NextApiRequest, res: NextApiResponse) {
    const id = req.query.id as string;

    if (!id) {
        return res
            .status(400)
            .json({ error: "Invalid or missing category ID" });
    }

    try {
        const category = await prisma.category.findUnique({
            where: {
                id: id,
            },
        });

        if (!category) {
            return res.status(404).json({ error: "Category not found" });
        }

        res.status(200).json(category);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch category" });
    }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case "GET":
            return getCategoryById(req, res);
        case "PUT":
            return updateCategory(req, res);
        case "DELETE":
            return deleteCategory(req, res);
        default:
            res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

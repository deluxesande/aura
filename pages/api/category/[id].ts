import type { NextApiRequest, NextApiResponse } from "next";
import { updateCategory } from "./update";
import { deleteCategory } from "./delete";
import { masterPrisma, getTenantPrisma } from "@/utils/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";

async function getCategoryById(req: NextApiRequest, res: NextApiResponse) {
    const id = req.query.id as string;
    const { userId } = getAuth(req);

    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    if (!id) {
        return res
            .status(400)
            .json({ error: "Invalid or missing category ID" });
    }

    try {
        const user = await masterPrisma.user.findUnique({
            where: { clerkId: userId },
            select: { businessId: true }
        });

        if (!user?.businessId) return res.status(404).json({ error: "Business not found" });

        const tenantPrisma = await getTenantPrisma(user.businessId);

        const category = await tenantPrisma.category.findUnique({
            where: {
                id: id,
            },
        });

        if (!category) {
            return res.status(404).json({ error: "Category not found" });
        }

        res.status(200).json(category);
    } catch (error) {
        console.error("Fetch Category Error:", error);
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

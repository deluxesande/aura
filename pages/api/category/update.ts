import { NextApiRequest, NextApiResponse } from "next";
import { masterPrisma, getTenantPrisma } from "@/utils/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";

export const updateCategory = async (
    req: NextApiRequest,
    res: NextApiResponse
) => {
    const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
    const { name, description } = req.body;

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

        const updatedCategory = await tenantPrisma.category.update({
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
        console.error("Update Category Error:", error);
        res.status(500).json({ error: "Failed to update category" });
    }
};

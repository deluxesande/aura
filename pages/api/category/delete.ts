import type { NextApiRequest, NextApiResponse } from "next";
import { masterPrisma, getTenantPrisma } from "@/utils/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";

export const deleteCategory = async (
    req: NextApiRequest,
    res: NextApiResponse
) => {
    const { id } = req.body;
    const { userId } = getAuth(req);

    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    if (!id) return res.status(400).json({ error: "Missing Category ID" });

    try {
        const user = await masterPrisma.user.findUnique({
            where: { clerkId: userId },
            select: { businessId: true }
        });

        if (!user?.businessId) return res.status(404).json({ error: "Business not found" });

        const tenantPrisma = await getTenantPrisma(user.businessId);

        // Delete using deleteMany for security
        const result = await tenantPrisma.category.deleteMany({
            where: {
                id: id,
            },
        });

        if (result.count === 0) {
            return res.status(404).json({ error: "Category not found or access denied" });
        }

        res.status(204).end();
    } catch (error) {
        console.error("Delete Category Error:", error);
        res.status(500).json({ error: "Failed to delete category" });
    }
};

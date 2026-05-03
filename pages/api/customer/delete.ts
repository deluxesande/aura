import { getAuth } from "@clerk/nextjs/server";
import { NextApiRequest, NextApiResponse } from "next";
import { masterPrisma, getTenantPrisma } from "@/utils/lib/prisma";

export const deleteCustomer = async (
    req: NextApiRequest,
    res: NextApiResponse
) => {
    const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
    if (!id) return res.status(400).json({ error: "Missing Customer ID" });

    try {
        const { userId: clerkUserId } = getAuth(req);
        if (!clerkUserId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // 1. Fetch User and Business context from Master DB
        const user = await masterPrisma.user.findUnique({
            where: { clerkId: clerkUserId },
            select: { businessId: true },
        });

        if (!user || !user.businessId) {
            return res
                .status(403)
                .json({ error: "User is not linked to a business" });
        }

        const businessId = user.businessId;
        const tenantPrisma = await getTenantPrisma(businessId);

        // 2. Delete Customer in Tenant DB
        const result = await tenantPrisma.customer.deleteMany({
            where: {
                id: id,
                businessId: businessId,
            },
        });

        if (result.count === 0) {
            return res
                .status(404)
                .json({ error: "Customer not found or access denied" });
        }

        res.status(204).end();
    } catch (error) {
        console.error("Delete Error:", error);
        res.status(500).json({ error: "Failed to delete customer" });
    }
};

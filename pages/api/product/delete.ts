import type { NextApiRequest, NextApiResponse } from "next";
import { masterPrisma, getTenantPrisma } from "@/utils/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { logAction } from "@/utils/server/audit";

export const deleteProduct = async (
    req: NextApiRequest,
    res: NextApiResponse,
) => {
    const id = req.query.id as string;

    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    if (!id) {
        return res.status(400).json({ error: "Product ID is required" });
    }

    try {
        // 1. Fetch User and Business context from Master DB
        const user = await masterPrisma.user.findUnique({
            where: { clerkId: userId },
            select: { id: true, businessId: true }
        });

        if (!user || !user.businessId) return res.status(404).json({ error: "User or business not found" });

        const businessId = user.businessId;
        const tenantPrisma = await getTenantPrisma(businessId);

        const product = await tenantPrisma.product.findUnique({
            where: { id },
            select: { image: true, businessId: true, name: true, sku: true },
        });

        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        // 2. Archive in Tenant DB
        await tenantPrisma.product.update({
            where: { id },
            data: { isArchived: true },
        });

        // 3. Log Audit Action (performs its own tenantPrisma lookup)
        await logAction({
            action: "ARCHIVE_PRODUCT",
            entityType: "PRODUCT",
            entityId: id,
            details: { name: product.name, sku: product.sku },
            userId: user.id,
            businessId: businessId,
            ipAddress: req.headers["x-forwarded-for"] as string || req.socket.remoteAddress,
            userAgent: req.headers["user-agent"],
        });

        return res
            .status(200)
            .json({ message: "Product archived successfully" });
    } catch (error) {
        console.error("Archive Product Error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    if (req.method === "DELETE") {
        return deleteProduct(req, res);
    }
    return res.status(405).json({ error: "Method not allowed" });
}

import { getAuth } from "@clerk/nextjs/server";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/utils/lib/client";
import { getTenantPrisma } from "@/utils/lib/prisma";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    if (req.method !== "PUT" && req.method !== "PATCH") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { userId } = getAuth(req);
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: {
                id: true,
                role: true,
                businessId: true,
            },
        });

        if (!user || !user.businessId) {
            return res
                .status(404)
                .json({ error: "Business profile not found." });
        }

        if (user.role !== "admin") {
            return res.status(403).json({
                error: "Forbidden. Only admins can modify tax settings.",
            });
        }

        const tenantPrisma = await getTenantPrisma(user.businessId);

        const {
            isAutoFilingEnabled,
            kraPin,
            taxpayerName,
            taxpayerType,
            pinStatus,
        } = req.body;

        const updatedSettings = await tenantPrisma.kraDetails.update({
            where: {
                businessId: user.businessId,
            },
            data: {
                ...(isAutoFilingEnabled !== undefined && {
                    isAutoFilingEnabled,
                }),
                ...(kraPin !== undefined && { kraPin }),
                ...(taxpayerName !== undefined && { taxpayerName }),
                ...(taxpayerType !== undefined && { taxpayerType }),
                ...(pinStatus !== undefined && { pinStatus }),
            },
        });

        return res.status(200).json({
            success: true,
            data: updatedSettings,
            message: "KRA settings updated successfully",
        });
    } catch (error: any) {
        if (error.code === "P2025") {
            return res.status(404).json({
                error: "Settings Not Found",
                message:
                    "No KRA settings found for this business. Please create them first.",
            });
        }

        console.error("Failed to update KRA settings:", error);
        return res.status(500).json({
            error: "Internal Server Error",
            details: error.message,
        });
    }
}

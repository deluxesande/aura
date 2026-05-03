import { getAuth } from "@clerk/nextjs/server";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/utils/lib/client";
import { getTenantPrisma } from "@/utils/lib/prisma";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    if (req.method !== "GET") {
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
                error: "Forbidden. Access restricted to Business Admins only.",
            });
        }

        const tenantPrisma = await getTenantPrisma(user.businessId);

        const returns = await tenantPrisma.kraTotReturn.findMany({
            where: {
                businessId: user.businessId,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        const formattedReturns = returns.map((record) => {
            // TOT is 3% of Gross Sales. We reverse calculate sales for display.
            // Sales = Tax / 0.03
            const inferredSales = record.taxPayable / 0.03;

            return {
                id: record.id,
                period: record.period,
                filingDate: record.createdAt.toISOString(),
                totalSales: Math.round(inferredSales),
                taxAmount: record.taxPayable,
                status: "Submitted",
                referenceNumber: record.ackNumber,
                paymentSlip: record.paymentSlip,
            };
        });

        return res.status(200).json(formattedReturns);
    } catch (error: any) {
        console.error("Error fetching KRA returns:", error);
        return res.status(500).json({
            error: "Failed to fetch tax returns",
            details: error.message,
        });
    }
}

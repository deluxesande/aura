import { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import { PrismaClient, PlanTier } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

const downgradeSchema = z.object({
    planId: z.string().min(1, "Plan ID is required"),
    activeStaffIds: z.array(z.string()).optional(),
    activeStoreIds: z.array(z.string()).optional(),
});

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { userId: currentUserId } = getAuth(req);
        if (!currentUserId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const currentUser = await prisma.user.findUnique({
            where: { clerkId: currentUserId },
            include: { Business: true },
        });

        if (!currentUser || currentUser.role !== "admin") {
            return res
                .status(403)
                .json({ error: "Only admins can update plans." });
        }

        if (!currentUser.businessId) {
            return res
                .status(400)
                .json({ error: "No business found for user." });
        }

        const { planId, activeStaffIds, activeStoreIds } = downgradeSchema.parse(req.body);
        const businessId = currentUser.businessId;

        const planTierMap: Record<string, PlanTier> = {
            STARTER: PlanTier.STARTER,
            STANDARD: PlanTier.STANDARD,
            PREMIUM: PlanTier.PREMIUM,
        };

        const targetPlan = planTierMap[planId];
        if (!targetPlan) {
            return res.status(400).json({ error: "Invalid Plan ID" });
        }

        await prisma.$transaction(async (tx) => {
            await tx.subscription.updateMany({
                where: {
                    businessId: businessId,
                    status: { in: ["ACTIVE", "TRIALING"] },
                },
                data: {
                    status: "CANCELED",
                    currentPeriodEnd: new Date(),
                },
            });

            await tx.subscription.create({
                data: {
                    businessId: businessId,
                    plan: targetPlan,
                    status: "ACTIVE",
                    currentPeriodStart: new Date(),
                    currentPeriodEnd: new Date(
                        new Date().setMonth(new Date().getMonth() + 1),
                    ),
                },
            });

            if (activeStaffIds && Array.isArray(activeStaffIds)) {
                await tx.user.updateMany({
                    where: {
                        businessId: businessId,
                        id: { in: activeStaffIds },
                    },
                    data: { status: "active" },
                });

                await tx.user.updateMany({
                    where: {
                        businessId: businessId,
                        id: { notIn: [...activeStaffIds, currentUser.id] },
                    },
                    data: { status: "inactive" },
                });
            }

            if (activeStoreIds && Array.isArray(activeStoreIds)) {
                await tx.store.updateMany({
                    where: {
                        businessId: businessId,
                        id: { in: activeStoreIds },
                    },
                    data: { isActive: true },
                });

                await tx.store.updateMany({
                    where: {
                        businessId: businessId,
                        id: { notIn: activeStoreIds },
                    },
                    data: { isActive: false },
                });
            }
        });

        return res.status(200).json({
            success: true,
            message: "Plan updated successfully",
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                error: "Validation failed",
                details: error.issues,
            });
        }

        console.error("Downgrade API Error:", error);
        return res.status(500).json({
            error: "Internal server error",
        });
    }
}

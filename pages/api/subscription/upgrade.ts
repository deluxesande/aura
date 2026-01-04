import { getAuth } from "@clerk/nextjs/server";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/utils/lib/client";
import { Novu } from "@novu/api";

const novu = new Novu({
    secretKey: process.env.NOVU_SECRET_KEY!,
});

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { userId } = getAuth(req);
        const { planId } = req.body;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
            include: { Business: { include: { subscription: true } } },
        });

        if (!user || !user.businessId || !user.Business) {
            return res
                .status(403)
                .json({ error: "User has no business attached" });
        }

        if (user.role !== "admin") {
            return res
                .status(403)
                .json({ error: "Only admins can upgrade subscriptions" });
        }

        const currentSubscription = user.Business.subscription;
        if (!currentSubscription) {
            return res
                .status(404)
                .json({ error: "No active subscription found to upgrade" });
        }

        const latestPayment = await prisma.subscriptionPayment.findFirst({
            where: {
                userId: userId,
                status: "COMPLETED",
                planId: planId,
                subscriptionId: null,
            },
            orderBy: { createdAt: "desc" },
        });

        if (!latestPayment) {
            return res.status(400).json({
                error: "No successful payment found for this upgrade. Please pay via M-Pesa first.",
            });
        }

        const result = await prisma.$transaction(async (tx) => {
            const updatedSubscription = await tx.subscription.update({
                where: { id: currentSubscription.id },
                data: {
                    plan: planId as any,
                    status: "ACTIVE",
                    currentPeriodStart: new Date(),
                    currentPeriodEnd: new Date(
                        new Date().setMonth(new Date().getMonth() + 1)
                    ),
                },
            });

            await tx.subscriptionPayment.update({
                where: { id: latestPayment.id },
                data: { subscriptionId: updatedSubscription.id },
            });

            return {
                business: user.Business,
                subscription: updatedSubscription,
            };
        });

        try {
            await novu.trigger({
                workflowId: "subscription-upgraded",
                to: { subscriberId: userId },
                payload: {
                    firstName: user.firstName || "User",
                    businessName: user.Business.name,
                    newPlan: result.subscription.plan,
                    expiryDate:
                        result.subscription.currentPeriodEnd.toLocaleDateString(),
                },
            });
        } catch (e) {
            console.error("Novu notification failed:", e);
        }

        return res.status(200).json({
            message: "Subscription upgraded successfully",
            plan: result.subscription.plan,
        });
    } catch (error) {
        console.error("Upgrade Error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

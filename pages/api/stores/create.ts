import { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/utils/lib/client";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    if (req.method !== "POST") return res.status(405).end();

    const { userId: clerkId } = getAuth(req);
    if (!clerkId) return res.status(401).json({ error: "Unauthorized" });

    try {
        const result = await prisma.$transaction(async (tx) => {
            // 1. Authoritatively fetch User and Business context
            const user = await tx.user.findUnique({
                where: { clerkId },
                select: { businessId: true, role: true },
            });

            if (!user?.businessId || user.role !== "admin") {
                throw new Error("Unauthorized: Admin access required.");
            }

            // 2. CRITICAL: Row-Level Lock on the Business record
            // This serializes all store creation attempts for this specific tenant
            await tx.$queryRaw`SELECT id FROM "Business" WHERE id = ${user.businessId}::uuid FOR UPDATE`;

            // 3. Fetch Subscription Limits
            const subscription = await tx.subscription.findFirst({
                where: { businessId: user.businessId },
                select: { plan: true, status: true },
                orderBy: { createdAt: "desc" },
            });

            if (
                subscription?.status !== "ACTIVE" &&
                subscription?.status !== "TRIALING"
            ) {
                throw new Error(
                    "Subscription inactive. Please renew to add branches.",
                );
            }

            // 4. Count existing stores
            const storeCount = await tx.store.count({
                where: { businessId: user.businessId },
            });

            // 5. Enforce Limits based on PlanTier
            const limits = { STARTER: 1, STANDARD: 5, PREMIUM: 20 };
            const maxAllowed =
                limits[subscription.plan as keyof typeof limits] || 1;

            if (storeCount >= maxAllowed) {
                throw new Error(
                    `Limit reached: Your ${subscription.plan} plan allows only ${maxAllowed} branch(es).`,
                );
            }

            // 6. Create the store using the AUTHORITATIVE businessId
            return await tx.store.create({
                data: {
                    ...req.body,
                    businessId: user.businessId, // Force the secure ID
                },
            });
        });

        return res.status(201).json(result);
    } catch (error: any) {
        console.error("Store Creation Security Error:", error.message);
        return res
            .status(400)
            .json({ error: error.message || "Failed to create store" });
    }
}

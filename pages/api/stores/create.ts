import { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/utils/lib/client";
import { logAction } from "@/utils/server/audit";

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
                select: { id: true, businessId: true, role: true },
            });

            if (!user?.businessId || user.role !== "admin") {
                throw new Error("Unauthorized: Admin access required.");
            }

            // 2. CRITICAL: Row-Level Lock via Prisma Native Update
            // This acquires a ROW EXCLUSIVE lock on the Business record until the transaction ends,
            // perfectly serializing concurrent store creation attempts without raw SQL.
            await tx.business.update({
                where: { id: user.businessId },
                data: { updatedAt: new Date() },
                select: { id: true }, // Minimal payload
            });
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
            const newStore = await tx.store.create({
                data: {
                    ...req.body,
                    businessId: user.businessId, // Force the secure ID
                },
            });

            // Log Audit Action
            await logAction({
                action: "CREATE_BRANCH",
                entityType: "STORE",
                entityId: newStore.id,
                details: { name: newStore.name, address: newStore.address },
                userId: user.id,
                businessId: user.businessId,
                ipAddress: req.headers["x-forwarded-for"] as string || req.socket.remoteAddress,
                userAgent: req.headers["user-agent"],
            });

            return newStore;
        });

        return res.status(201).json(result);
    } catch (error: any) {
        console.error("Store Creation Security Error:", error.message);
        return res
            .status(400)
            .json({ error: error.message || "Failed to create store" });
    }
}


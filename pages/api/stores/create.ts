import { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import { masterPrisma, getTenantPrisma } from "@/utils/lib/prisma";
import { logAction } from "@/utils/server/audit";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    if (req.method !== "POST") return res.status(405).end();

    const { userId: clerkId } = getAuth(req);
    if (!clerkId) return res.status(401).json({ error: "Unauthorized" });

    try {
        // 1. Fetch User and Business context from Master DB
        const user = await masterPrisma.user.findUnique({
            where: { clerkId },
            select: { id: true, businessId: true, role: true },
        });

        if (!user?.businessId || user.role !== "admin") {
            return res.status(403).json({ error: "Unauthorized: Admin access required." });
        }

        const businessId = user.businessId;

        // 2. Fetch Subscription Limits from Master DB
        const subscription = await masterPrisma.subscription.findFirst({
            where: { businessId: businessId },
            select: { plan: true, status: true },
            orderBy: { createdAt: "desc" },
        });

        if (
            subscription?.status !== "ACTIVE" &&
            subscription?.status !== "TRIALING"
        ) {
            return res.status(402).json({
                error: "Subscription inactive. Please renew to add branches.",
            });
        }

        // 3. Get Tenant Prisma client
        const tenantPrisma = await getTenantPrisma(businessId);

        // 4. Perform Tenant Writes in a Transaction
        const result = await tenantPrisma.$transaction(async (tx) => {
            // Count existing stores in Tenant DB
            const storeCount = await tx.store.count({
                where: { businessId: businessId },
            });

            // Enforce Limits based on PlanTier
            const limits = { STARTER: 1, STANDARD: 5, PREMIUM: 20 };
            const maxAllowed =
                limits[subscription.plan as keyof typeof limits] || 1;

            if (storeCount >= maxAllowed) {
                throw new Error(
                    `Limit reached: Your ${subscription.plan} plan allows only ${maxAllowed} branch(es).`,
                );
            }

            // Create the store in Tenant DB
            const newStore = await tx.store.create({
                data: {
                    ...req.body,
                    businessId: businessId, // Logical reference
                },
            });

            return newStore;
        });

        // 5. Log Audit Action (also in Tenant DB)
        await logAction({
            action: "CREATE_BRANCH",
            entityType: "STORE",
            entityId: result.id,
            details: { name: result.name, address: result.address },
            userId: user.id,
            businessId: businessId,
            ipAddress: req.headers["x-forwarded-for"] as string || req.socket.remoteAddress,
            userAgent: req.headers["user-agent"],
        });

        return res.status(201).json(result);
    } catch (error: any) {
        console.error("Store Creation Security Error:", error.message);
        return res
            .status(400)
            .json({ error: error.message || "Failed to create store" });
    }
}


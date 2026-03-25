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

    const storeId = req.query.id as string;
    if (!storeId) return res.status(400).json({ error: "Missing store ID" });

    try {
        const result = await prisma.$transaction(async (tx) => {
            const requestor = await tx.user.findUnique({
                where: { clerkId },
                select: { businessId: true, role: true },
            });

            if (!requestor?.businessId || requestor.role !== "admin") {
                throw new Error(
                    "Forbidden: Only admins can reactivate branches.",
                );
            }

            // Lock the business row
            await tx.business.update({
                where: { id: requestor.businessId },
                data: { updatedAt: new Date() },
                select: { id: true },
            });

            const subscription = await tx.subscription.findFirst({
                where: { businessId: requestor.businessId },
                select: { plan: true, status: true },
                orderBy: { createdAt: "desc" },
            });

            if (
                subscription?.status !== "ACTIVE" &&
                subscription?.status !== "TRIALING"
            ) {
                throw new Error("Active subscription required.");
            }

            const activeStoreCount = await tx.store.count({
                where: { businessId: requestor.businessId, isActive: true },
            });

            const storeLimits = { STARTER: 1, STANDARD: 3, PREMIUM: 10 };
            const maxStores =
                storeLimits[subscription.plan as keyof typeof storeLimits] || 1;

            if (activeStoreCount >= maxStores) {
                throw new Error(
                    `Branch limit reached. Upgrade to a higher plan to reactivate.`,
                );
            }

            const targetStore = await tx.store.findFirst({
                where: { id: storeId, businessId: requestor.businessId },
            });

            if (!targetStore) throw new Error("Branch not found.");
            if (targetStore.isActive)
                throw new Error("Branch is already active.");

            return await tx.store.update({
                where: { id: storeId },
                data: { isActive: true },
            });
        });

        return res.status(200).json(result);
    } catch (error: any) {
        console.error("Reactivate Store Error:", error.message);
        return res
            .status(400)
            .json({ error: error.message || "Failed to reactivate branch" });
    }
}

import { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/utils/lib/client";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    if (req.method !== "POST") return res.status(405).end();

    const { userId: requestorClerkId } = getAuth(req);
    if (!requestorClerkId)
        return res.status(401).json({ error: "Unauthorized" });

    const targetClerkId = req.query.id as string;
    if (!targetClerkId)
        return res.status(400).json({ error: "Missing user ID" });

    try {
        const result = await prisma.$transaction(async (tx) => {
            const requestor = await tx.user.findUnique({
                where: { clerkId: requestorClerkId },
                select: { businessId: true, role: true },
            });

            if (!requestor?.businessId || requestor.role !== "admin") {
                throw new Error("Forbidden: Only admins can reactivate users.");
            }

            // Lock the business row to prevent race conditions
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

            // Count ACTIVE staff + pending invites
            const [activeStaffCount, invitationCount] = await Promise.all([
                tx.user.count({
                    where: {
                        businessId: requestor.businessId,
                        status: "active",
                    },
                }),
                tx.userInvitation.count({
                    where: {
                        businessId: requestor.businessId,
                        status: "pending",
                    },
                }),
            ]);

            const teamLimits = { STARTER: 1, STANDARD: 5, PREMIUM: 999 };
            const maxTeam =
                teamLimits[subscription.plan as keyof typeof teamLimits] || 1;

            if (activeStaffCount + invitationCount >= maxTeam) {
                throw new Error(
                    `Team limit reached. Upgrade to a higher plan to reactivate.`,
                );
            }

            const targetUser = await tx.user.findFirst({
                where: {
                    clerkId: targetClerkId,
                    businessId: requestor.businessId,
                },
            });

            if (!targetUser) throw new Error("User not found.");
            if (targetUser.status === "active")
                throw new Error("User is already active.");

            return await tx.user.update({
                where: { clerkId: targetClerkId },
                data: { status: "active" },
            });
        });

        return res.status(200).json(result);
    } catch (error: any) {
        console.error("Reactivate User Error:", error.message);
        return res
            .status(400)
            .json({ error: error.message || "Failed to reactivate user" });
    }
}

import { masterPrisma, getTenantPrisma } from "@/utils/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { userId } = getAuth(req);
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const currentUser = await masterPrisma.user.findUnique({
            where: { clerkId: userId },
            include: { Business: true },
        });

        if (!currentUser) {
            return res.status(404).json({ error: "User not found" });
        }

        if (currentUser.role !== "admin" && currentUser.role !== "manager") {
            return res
                .status(403)
                .json({ error: "Forbidden: Insufficient permissions" });
        }

        const businessId = currentUser.businessId;

        if (!businessId) {
            return res.status(400).json({ error: "Business ID required" });
        }

        const invitations = await masterPrisma.userInvitation.findMany({
            where: { businessId },
            include: {
                Business: {
                    select: { name: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        const tenantPrisma = await getTenantPrisma(businessId);
        const stores = await tenantPrisma.store.findMany({
            where: { businessId },
            select: { id: true, name: true }
        });

        const storeMap = new Map(stores.map(s => [s.id, s.name]));

        const sanitizedInvitations = await Promise.all(
            invitations.map(async ({ token, ...invitation }) => {
                let inviterDetails = null;
                let linkedClerkId = null;

                if (invitation.invitedBy) {
                    const inviter = await masterPrisma.user.findUnique({
                        where: { id: invitation.invitedBy },
                        select: {
                            firstName: true,
                            lastName: true,
                        },
                    });
                    inviterDetails = inviter;
                }

                // If accepted, fetch the User's Clerk ID
                if (invitation.status === "accepted") {
                    const linkedUser = await masterPrisma.user.findUnique({
                        where: { email: invitation.email },
                        select: { clerkId: true },
                    });

                    if (linkedUser) {
                        linkedClerkId = linkedUser.clerkId;
                    }
                }

                return {
                    ...invitation,
                    inviter: inviterDetails,
                    clerkUserId: linkedClerkId,
                    Store: invitation.storeId ? { name: storeMap.get(invitation.storeId) || "Unknown Branch" } : null
                };
            })
        );

        return res.status(200).json({ invitations: sanitizedInvitations });
    } catch (error) {
        console.error("Invite Fetch Error:", error);
        return res.status(500).json({
            error: "Internal server error",
        });
    }
}

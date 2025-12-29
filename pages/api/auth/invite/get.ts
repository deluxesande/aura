import { prisma } from "@/utils/lib/client";
import { getAuth } from "@clerk/nextjs/server";
import { NextApiRequest, NextApiResponse } from "next";

// Get invitations for a business
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

        const currentUser = await prisma.user.findUnique({
            where: { clerkId: userId },
            include: { Business: true },
        });

        if (!currentUser) {
            return res.status(404).json({ error: "User not found" });
        }

        const businessId = currentUser.businessId;

        if (!businessId || typeof businessId !== "string") {
            return res.status(400).json({ error: "Business ID required" });
        }

        // Check if user has access to this business
        if (currentUser.businessId !== businessId) {
            return res.status(403).json({ error: "Forbidden" });
        }

        const invitations = await prisma.userInvitation.findMany({
            where: { businessId },
            include: {
                Business: {
                    select: { name: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        // Remove token from each invitation
        const sanitizedInvitations = await Promise.all(
            invitations.map(async ({ token, ...invitation }) => {
                // Get inviter details if invitedBy exists
                let inviterDetails = null;
                if (invitation.invitedBy) {
                    const inviter = await prisma.user.findUnique({
                        where: { id: invitation.invitedBy },
                        select: {
                            firstName: true,
                            lastName: true,
                        },
                    });
                    inviterDetails = inviter;
                }

                return {
                    ...invitation,
                    inviter: inviterDetails,
                };
            })
        );

        return res.status(200).json({ invitations: sanitizedInvitations });
    } catch (error) {
        console.error("Get invitations error:", error);
        return res.status(500).json({
            error: "Internal server error",
        });
    }
}

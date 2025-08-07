import { prisma } from "@/utils/lib/client";
import { getAuth } from "@clerk/nextjs/server";
import { NextApiRequest, NextApiResponse } from "next";
import { clerkClient } from "@clerk/nextjs/server";

// Delete an invitation
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "DELETE") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { userId } = getAuth(req);
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const { invitationId } = req.body;

        if (!invitationId || typeof invitationId !== "string") {
            return res.status(400).json({ error: "Invitation ID required" });
        }

        // Get current user
        const currentUser = await prisma.user.findUnique({
            where: { clerkId: userId },
        });

        if (!currentUser) {
            return res.status(404).json({ error: "User not found" });
        }

        // Check if the invitation exists and belongs to the user's business
        const invitation = await prisma.userInvitation.findUnique({
            where: { id: invitationId },
        });

        if (!invitation) {
            return res.status(404).json({ error: "Invitation not found" });
        }

        // Verify the invitation belongs to the user's business
        if (invitation.businessId !== currentUser.businessId) {
            return res.status(403).json({ error: "Forbidden" });
        }

        // Revoke the invitation on Clerk if clerkInvitationId exists
        if (invitation.clerkInvitationId) {
            try {
                const client = await clerkClient();
                await client.invitations.revokeInvitation(
                    invitation.clerkInvitationId
                );
            } catch (clerkError) {
                // Continue with local deletion even if Clerk revocation fails
            }
        }

        // Delete the invitation
        await prisma.userInvitation.delete({
            where: { id: invitationId },
        });

        return res.status(204).json({
            message: "Invitation deleted successfully",
            deletedId: invitationId,
        });
    } catch (error) {
        // console.error("Delete invitation error:", error);
        return res.status(500).json({
            error: "Internal server error",
        });
    }
}

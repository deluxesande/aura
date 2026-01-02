import { prisma } from "@/utils/lib/client";
import { getAuth } from "@clerk/nextjs/server";
import { NextApiRequest, NextApiResponse } from "next";
import { clerkClient } from "@clerk/nextjs/server";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "DELETE") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { userId: clerkUserId } = getAuth(req);
        if (!clerkUserId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const idToDelete = req.body.id as string;
        console.log("ID to delete:", idToDelete);

        if (!idToDelete) {
            return res.status(400).json({ error: "ID parameter is required" });
        }

        const currentUser = await prisma.user.findUnique({
            where: { clerkId: clerkUserId },
        });

        if (!currentUser) {
            return res.status(404).json({ error: "Current user not found" });
        }

        const invitation = await prisma.userInvitation.findUnique({
            where: { id: idToDelete },
        });

        if (!invitation) {
            return res
                .status(404)
                .json({ error: "Invitation not found in database" });
        }

        if (invitation.businessId !== currentUser.businessId) {
            return res.status(403).json({ error: "Forbidden: Wrong business" });
        }

        if (currentUser.role === "manager" && invitation.role === "manager") {
            return res.status(403).json({
                error: "Managers cannot delete other managers",
            });
        }
        try {
            const client = await clerkClient();

            const clerkInvitations = await client.invitations.getInvitationList(
                {
                    status: "pending",
                }
            );

            // Filter for matches based on Email OR the specific Clerk ID
            const invitesToRevoke = clerkInvitations.data.filter(
                (inv) =>
                    inv.emailAddress === invitation.email ||
                    inv.id === invitation.clerkInvitationId
            );

            if (invitesToRevoke.length > 0) {
                await Promise.all(
                    invitesToRevoke.map((inv) =>
                        client.invitations.revokeInvitation(inv.id)
                    )
                );
            }
        } catch (clerkError) {
            console.error("Clerk cleanup warning (non-fatal):", clerkError);
        }

        await prisma.userInvitation.delete({
            where: { id: idToDelete },
        });

        return res.status(200).json({
            message: "Invitation deleted successfully",
            deletedId: idToDelete,
        });
    } catch (error) {
        return res.status(500).json({
            error: "Internal server error",
        });
    }
}

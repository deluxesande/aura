import { NextApiRequest, NextApiResponse } from "next";
import { getAuth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/utils/lib/client";
import { z } from "zod";

const acceptInvitationSchema = z.object({
    token: z.string().min(1, "Token is required"),
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
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const { token } = acceptInvitationSchema.parse(req.body);

        // Find the invitation
        const invitation = await prisma.userInvitation.findUnique({
            where: { token },
            include: { Business: true },
        });

        if (!invitation) {
            return res.status(404).json({ error: "Invalid invitation token" });
        }

        // Check if invitation has expired
        if (invitation.expiresAt < new Date()) {
            return res.status(400).json({ error: "Invitation has expired" });
        }

        // Check if invitation is still pending
        if (invitation.status !== "pending") {
            return res
                .status(400)
                .json({ error: "Invitation already processed" });
        }

        // Get user from Clerk
        const client = await clerkClient();
        const clerkUser = await client.users.getUser(userId);

        // Check if user already exists in database
        let user = await prisma.user.findUnique({
            where: { clerkId: userId },
        });

        if (user) {
            // Update existing user's business association
            user = await prisma.user.update({
                where: { id: user.id },
                data: {
                    businessId: invitation.businessId,
                    role: invitation.role,
                },
            });
        } else {
            // Create new user
            user = await prisma.user.create({
                data: {
                    clerkId: userId,
                    email:
                        clerkUser.emailAddresses[0]?.emailAddress ||
                        invitation.email,
                    firstName: clerkUser.firstName,
                    lastName: clerkUser.lastName,
                    role: invitation.role,
                    businessId: invitation.businessId,
                },
            });
        }

        // Update invitation status
        await prisma.userInvitation.update({
            where: { id: invitation.id },
            data: { status: "accepted" },
        });

        return res.status(200).json({
            message: "Invitation accepted successfully",
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                businessName: invitation.Business.name,
            },
        });
    } catch (error) {
        console.error("Accept invitation error:", error);

        if (error instanceof z.ZodError) {
            return res.status(400).json({
                error: "Validation failed",
                details: error.issues,
            });
        }

        return res.status(500).json({
            error: "Internal server error",
        });
    }
}

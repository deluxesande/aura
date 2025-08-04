import { NextApiRequest, NextApiResponse } from "next";
import { getAuth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/utils/lib/client";
import { z } from "zod";

const updateRoleSchema = z.object({
    userId: z.string().min(1, "User ID is required"),
    role: z.enum(["admin", "user", "manager"], {
        message: "Role must be admin, user, or manager",
    }),
});

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "PUT") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { userId: currentUserId } = getAuth(req);
        if (!currentUserId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // Get current user to check permissions
        const currentUser = await prisma.user.findUnique({
            where: { clerkId: currentUserId },
            include: { Business: true },
        });

        if (!currentUser) {
            return res.status(404).json({ error: "Current user not found" });
        }

        // Check if current user has permission to update roles (admin only)
        if (currentUser.role !== "admin") {
            return res.status(403).json({
                error: "Insufficient permissions. Only admins can update roles.",
            });
        }

        const { userId, role } = updateRoleSchema.parse(req.body);

        // Find the user to update
        const userInvitationToUpdate = await prisma.userInvitation.findUnique({
            where: { id: userId },
            include: { Business: true },
        });

        if (!userInvitationToUpdate) {
            return res.status(404).json({ error: "User not found" });
        }

        // Check if user belongs to the same business
        if (userInvitationToUpdate.businessId !== currentUser.businessId) {
            return res
                .status(403)
                .json({ error: "Cannot update user from different business" });
        }

        // Update the userInvitation role
        const updatedUserInvitation = await prisma.userInvitation.update({
            where: { id: userId },
            data: { role },
            include: { Business: true },
        });

        return res.status(200).json({
            message: "User role updated successfully",
            user: updatedUserInvitation,
        });
    } catch (error) {
        // console.error("Update role error:", error);

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

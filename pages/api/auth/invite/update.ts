import { prisma } from "@/utils/lib/client";
import { getAuth } from "@clerk/nextjs/server";
import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

const updateRoleSchema = z.object({
    userId: z.string().min(1, "User ID is required"),
    role: z.enum(["admin", "user", "manager"], {
        message: "Role must be admin, user, or manager",
    }),
});

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    if (req.method !== "PUT") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { userId: currentUserId } = getAuth(req);
        if (!currentUserId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const currentUser = await prisma.user.findUnique({
            where: { clerkId: currentUserId },
            include: { Business: true },
        });

        if (!currentUser) {
            return res.status(404).json({ error: "Current user not found" });
        }

        if (currentUser.role !== "admin") {
            return res.status(403).json({
                error: "Only admins can update roles.",
            });
        }

        const { userId, role } = updateRoleSchema.parse(req.body);

        const userInvitationToUpdate = await prisma.userInvitation.findUnique({
            where: { id: userId },
            include: { Business: true },
        });

        if (!userInvitationToUpdate) {
            return res.status(404).json({ error: "User not found" });
        }

        if (userInvitationToUpdate.businessId !== currentUser.businessId) {
            return res
                .status(403)
                .json({ error: "Cannot update user from different business" });
        }

        const updatedUserInvitation = await prisma.userInvitation.update({
            where: { id: userId },
            data: { role },
            include: { Business: true },
        });

        const existingUser = await prisma.user.findUnique({
            where: { email: userInvitationToUpdate.email },
        });

        if (existingUser) {
            await prisma.user.update({
                where: { id: existingUser.id },
                data: { role },
            });
        }

        return res.status(200).json({
            message: "User role updated successfully",
            user: updatedUserInvitation,
        });
    } catch (error) {
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

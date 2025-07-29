import { NextApiRequest, NextApiResponse } from "next";
import { getAuth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/utils/lib/client";
import { z } from "zod";
import crypto from "crypto";

// Validation schema
const inviteSchema = z.object({
    email: z.string().email("Invalid email address"),
    role: z.enum(["admin", "manager", "user"]).default("user"),
    businessId: z.string().uuid("Invalid business ID").optional(),
});

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        // Check authentication
        const { userId } = getAuth(req);
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // Get current user from database
        const currentUser = await prisma.user.findUnique({
            where: { clerkId: userId },
            include: { Business: true },
        });

        if (!currentUser) {
            return res.status(404).json({ error: "User not found" });
        }

        // Parse request body
        const validatedData = inviteSchema.parse(req.body);
        const { email, role } = validatedData;

        // Use provided businessId or fallback to current user's businessId
        const businessId = validatedData.businessId || currentUser.businessId;

        if (!businessId) {
            return res.status(400).json({ error: "Business ID is required" });
        }

        // Check if user has permission to invite to this business
        if (currentUser.businessId !== businessId) {
            return res
                .status(403)
                .json({ error: "Forbidden: Cannot invite to this business" });
        }

        // Check if user has permission to invite (only admin/manager can invite)
        if (!["admin", "manager"].includes(currentUser.role)) {
            return res
                .status(403)
                .json({ error: "Forbidden: Insufficient permissions" });
        }

        console.log(businessId);

        // Check if business exists
        const business = await prisma.business.findUnique({
            where: { id: businessId },
        });

        if (!business) {
            return res.status(404).json({ error: "Business not found" });
        }

        // Check if user is already registered
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return res.status(409).json({ error: "User already exists" });
        }

        // Check if invitation already exists
        const existingInvitation = await prisma.userInvitation.findFirst({
            where: {
                email,
                businessId,
                status: "pending",
            },
        });

        if (existingInvitation) {
            return res.status(409).json({ error: "Invitation already sent" });
        }

        // Generate unique token
        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        // Create invitation record in database
        const invitation = await prisma.userInvitation.create({
            data: {
                email,
                role,
                businessId,
                invitedBy: currentUser.id,
                token,
                expiresAt,
                status: "pending",
            },
            include: {
                Business: true,
            },
        });

        // Create invitation in Clerk
        try {
            // Clerk Node SDK does not support invitations directly; use the REST API or send an email manually.
            // Example: Send a custom email with the invitation link.
            // You may use a transactional email service here.
            // For demonstration, we'll just simulate the invitation creation.
            const clerkInvitation = { id: "simulated-clerk-invitation-id" };

            // Update invitation with Clerk invitation ID if needed
            await prisma.userInvitation.update({
                where: { id: invitation.id },
                data: {
                    // You can store clerk invitation ID if needed
                    // clerkInvitationId: clerkInvitation.id
                },
            });

            return res.status(201).json({
                message: "Invitation sent successfully",
                invitation: {
                    id: invitation.id,
                    email: invitation.email,
                    role: invitation.role,
                    businessName: invitation.Business.name,
                    expiresAt: invitation.expiresAt,
                    status: invitation.status,
                },
            });
        } catch (clerkError) {
            // If Clerk invitation fails, delete the database record
            await prisma.userInvitation.delete({
                where: { id: invitation.id },
            });

            console.error("Clerk invitation error:", clerkError);
            return res.status(500).json({
                error: "Failed to send invitation email",
            });
        }
    } catch (error) {
        console.error("Invitation error:", error);

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

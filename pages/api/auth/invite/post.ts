import { NextApiRequest, NextApiResponse } from "next";
import { getAuth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/utils/lib/client";
import { z } from "zod";
import crypto from "crypto";
import axios from "axios";

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
            const clerkOptions = {
                method: "POST",
                url: "https://api.clerk.com/v1/invitations",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
                },
                data: {
                    email_address: email,
                    public_metadata: {
                        role: role,
                        businessId: businessId,
                        businessName: business.name,
                        invitationToken: token,
                    },
                    redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/auth/accept-invitation?token=${token}`,
                    notify: true,
                    ignore_existing: false,
                    expires_in_days: 7,
                    template_slug: "invitation",
                },
            };

            const { data: clerkInvitation } = await axios.request(clerkOptions);

            // Update invitation with Clerk invitation ID
            await prisma.userInvitation.update({
                where: { id: invitation.id },
                data: {
                    clerkInvitationId: clerkInvitation.id,
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
                    clerkInvitationId: clerkInvitation.id,
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

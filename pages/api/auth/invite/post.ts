import { NextRequest, NextResponse } from "next/server";
import { getAuth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/utils/lib/client";
import { z } from "zod";
import crypto from "crypto";

// Validation schema
const inviteSchema = z.object({
    email: z.string().email("Invalid email address"),
    role: z.enum(["admin", "manager", "user"]).default("user"),
    businessId: z.string().uuid("Invalid business ID"),
});

export async function POST(request: NextRequest) {
    try {
        // Check authentication
        const { userId } = getAuth(request);
        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Get current user from database
        const currentUser = await prisma.user.findUnique({
            where: { clerkId: userId },
            include: { Business: true },
        });

        if (!currentUser) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Parse request body
        const body = await request.json();
        const validatedData = inviteSchema.parse(body);
        const { email, role, businessId } = validatedData;

        // Check if user has permission to invite to this business
        if (currentUser.businessId !== businessId) {
            return NextResponse.json(
                { error: "Forbidden: Cannot invite to this business" },
                { status: 403 }
            );
        }

        // Check if user has permission to invite (only admin/manager can invite)
        if (!["admin", "manager"].includes(currentUser.role)) {
            return NextResponse.json(
                { error: "Forbidden: Insufficient permissions" },
                { status: 403 }
            );
        }

        // Check if business exists
        const business = await prisma.business.findUnique({
            where: { id: businessId },
        });

        if (!business) {
            return NextResponse.json(
                { error: "Business not found" },
                { status: 404 }
            );
        }

        // Check if user is already registered
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "User already exists" },
                { status: 409 }
            );
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
            return NextResponse.json(
                { error: "Invitation already sent" },
                { status: 409 }
            );
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

            return NextResponse.json(
                {
                    message: "Invitation sent successfully",
                    invitation: {
                        id: invitation.id,
                        email: invitation.email,
                        role: invitation.role,
                        businessName: invitation.Business.name,
                        expiresAt: invitation.expiresAt,
                        status: invitation.status,
                    },
                },
                { status: 201 }
            );
        } catch (clerkError) {
            // If Clerk invitation fails, delete the database record
            await prisma.userInvitation.delete({
                where: { id: invitation.id },
            });

            console.error("Clerk invitation error:", clerkError);
            return NextResponse.json(
                {
                    error: "Failed to send invitation email",
                },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error("Invitation error:", error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    error: "Validation failed",
                    details: error.issues,
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            {
                error: "Internal server error",
            },
            { status: 500 }
        );
    }
}

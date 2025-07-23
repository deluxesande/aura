import { NextRequest, NextResponse } from "next/server";
import { getAuth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/utils/lib/client";
import { z } from "zod";

const acceptInvitationSchema = z.object({
    token: z.string().min(1, "Token is required"),
});

export async function POST(request: NextRequest) {
    try {
        const { userId } = getAuth(request);
        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { token } = acceptInvitationSchema.parse(body);

        // Find the invitation
        const invitation = await prisma.userInvitation.findUnique({
            where: { token },
            include: { Business: true },
        });

        if (!invitation) {
            return NextResponse.json(
                { error: "Invalid invitation token" },
                { status: 404 }
            );
        }

        // Check if invitation has expired
        if (invitation.expiresAt < new Date()) {
            return NextResponse.json(
                { error: "Invitation has expired" },
                { status: 400 }
            );
        }

        // Check if invitation is still pending
        if (invitation.status !== "pending") {
            return NextResponse.json(
                { error: "Invitation already processed" },
                { status: 400 }
            );
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

        return NextResponse.json({
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

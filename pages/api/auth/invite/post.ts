import { NextApiRequest, NextApiResponse } from "next";
import { getAuth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/utils/lib/client";
import { z } from "zod";
import crypto from "crypto";

// Validation schema
const inviteSchema = z.object({
    email: z.string().email("Invalid email address"),
    role: z.enum(["manager", "user"]).default("user"),
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

        const validatedData = inviteSchema.parse(req.body);
        const { email, role } = validatedData;
        const businessId = validatedData.businessId || currentUser.businessId;

        if (!businessId) {
            return res.status(400).json({ error: "Business ID is required" });
        }

        if (currentUser.businessId !== businessId) {
            return res
                .status(403)
                .json({ error: "Forbidden: Cannot invite to this business" });
        }

        if (!["admin", "manager"].includes(currentUser.role)) {
            return res
                .status(403)
                .json({ error: "Forbidden: Insufficient permissions" });
        }

        const business = await prisma.business.findUnique({
            where: { id: businessId },
            include: {
                subscriptions: {
                    where: { status: "ACTIVE" },
                    orderBy: { createdAt: "desc" },
                    take: 1,
                },
                _count: {
                    select: {
                        users: true,
                        invitations: { where: { status: "pending" } },
                    },
                },
            },
        });

        if (!business) {
            return res.status(404).json({ error: "Business not found" });
        }

        const activeSub = business.subscriptions[0];
        const plan = activeSub?.plan || "STARTER";
        const currentTotal =
            business._count.users + business._count.invitations;

        let limit = 1;
        if (plan === "STANDARD") limit = 5;
        if (plan === "PREMIUM") limit = Infinity;

        if (currentTotal >= limit) {
            return res.status(403).json({
                error: `Invitation limit reached for the ${plan} plan.`,
                details: `Current plan allows a maximum of ${limit} team members. Please upgrade your subscription.`,
            });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return res
                .status(409)
                .json({ error: "User already exists in the system" });
        }

        try {
            const clerk = await clerkClient();
            const clerkUsers = await clerk.users.getUserList({
                emailAddress: [email],
            });

            if (clerkUsers.data && clerkUsers.data.length > 0) {
                return res.status(409).json({
                    error: "An account with this email already exists",
                });
            }
        } catch (clerkError: any) {
            console.error("Error checking Clerk users:", clerkError);
        }

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

        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

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

        try {
            const clerk = await clerkClient();

            const clerkInvitation = await clerk.invitations.createInvitation({
                emailAddress: email,
                redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/auth/accept-invitation?token=${token}`,
                publicMetadata: {
                    role: role,
                    businessId: businessId,
                    businessName: business.name,
                    invitationToken: token,
                },
            });

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
        } catch (clerkError: any) {
            await prisma.userInvitation.delete({
                where: { id: invitation.id },
            });

            return res.status(500).json({
                error: "Failed to send invitation email",
                details: clerkError.errors?.[0]?.message || clerkError.message,
            });
        }
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                error: "Validation failed",
                details: error.issues,
            });
        }
        return res.status(500).json({ error: "Internal server error" });
    }
}

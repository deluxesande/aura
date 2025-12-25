import { NextApiRequest, NextApiResponse } from "next";
import { getAuth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/utils/lib/client";
import { Novu } from "@novu/api";
import { z } from "zod";
import crypto from "crypto";

const novu = new Novu({
    secretKey: process.env.NOVU_SECRET_KEY!,
});

const acceptInvitationSchema = z.object({
    token: z.string().min(1, "Token is required"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
});

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { token, password, firstName, lastName } =
            acceptInvitationSchema.parse(req.body);

        // Find the invitation first
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

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: invitation.email },
        });

        if (existingUser) {
            return res
                .status(409)
                .json({ error: "User already exists with this email" });
        }

        try {
            // Create user in Clerk automatically
            const client = await clerkClient();

            // Generate a temporary password if not provided
            const userPassword =
                password || crypto.randomBytes(12).toString("hex") + "!A1";

            const clerkUser = await client.users.createUser({
                emailAddress: [invitation.email],
                password: userPassword,
                firstName: firstName || invitation.email.split("@")[0],
                lastName: lastName || "",
                skipPasswordChecks: true,
                skipPasswordRequirement: false,
            });

            // Create user in local database
            const user = await prisma.user.create({
                data: {
                    clerkId: clerkUser.id,
                    email: invitation.email,
                    firstName: clerkUser.firstName,
                    lastName: clerkUser.lastName,
                    role: invitation.role,
                    businessId: invitation.businessId,
                },
            });

            // Update invitation status
            await prisma.userInvitation.update({
                where: { id: invitation.id },
                data: {
                    status: "accepted",
                },
            });

            // Notify admins and managers in the business
            try {
                const adminsAndManagers = await prisma.user.findMany({
                    where: {
                        businessId: invitation.businessId,
                        role: { in: ["admin", "manager"] },
                    },
                });

                for (const admin of adminsAndManagers) {
                    try {
                        await novu.trigger({
                            to: {
                                subscriberId: admin.clerkId,
                            },
                            workflowId: "invite-accepted",
                            payload: {
                                userName: `${user.firstName} ${user.lastName}`,
                                userEmail: user.email,
                                userRole: invitation.role,
                                businessName: invitation.Business.name,
                            },
                        });
                    } catch (error) {
                        console.error(
                            `Failed to send notification to ${admin.email}:`,
                            error
                        );
                    }
                }
            } catch (notificationError) {
                console.error(
                    "Error sending invitations notifications:",
                    notificationError
                );
                // Don't fail the request if notifications fail
            }

            return res.status(200).json({
                message: "Account created successfully",
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    businessName: invitation.Business.name,
                },
                credentials: password
                    ? undefined
                    : {
                          email: invitation.email,
                          password: userPassword,
                          message:
                              "Please save these credentials and change your password after first login",
                      },
            });
        } catch (clerkError: any) {
            console.error("Error creating Clerk user:", clerkError);

            if (clerkError.errors?.[0]?.code === "form_param_format_invalid") {
                return res.status(400).json({
                    error: "Invalid email format or password requirements not met",
                });
            }

            if (clerkError.errors?.[0]?.code === "form_identifier_exists") {
                return res.status(409).json({
                    error: "Email already exists in authentication system",
                });
            }

            return res.status(500).json({
                error: "Failed to create user account",
                details: clerkError.errors?.[0]?.message || clerkError.message,
            });
        }
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

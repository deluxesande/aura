import { NextApiRequest, NextApiResponse } from "next";
import { clerkClient } from "@clerk/nextjs/server";
import { masterPrisma as prisma } from "@/utils/lib/prisma";
import { syncUserToTenant } from "@/utils/lib/syncUser";
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

        // Find the invitation in Master DB
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

        // Check if user already exists in Master DB
        const existingUser = await prisma.user.findUnique({
            where: { email: invitation.email },
        });

        if (existingUser) {
            return res
                .status(409)
                .json({ error: "User already exists with this email" });
        }

        try {
            // 1. Create user in Clerk
            const client = await clerkClient();
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

            // 2. Create user in Master DB
            const user = await prisma.user.create({
                data: {
                    clerkId: clerkUser.id,
                    email: invitation.email,
                    firstName: clerkUser.firstName,
                    lastName: clerkUser.lastName,
                    role: invitation.role,
                    businessId: invitation.businessId,
                    storeId: invitation.storeId, // Logical reference
                },
            });

            // 3. Update invitation status in Master DB
            await prisma.userInvitation.update({
                where: { id: invitation.id },
                data: { status: "accepted" },
            });

            // 4. SYNC user to Tenant DB for local operational logic
            await syncUserToTenant(clerkUser.id);

            // 5. Notify admins and managers
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
                            to: { subscriberId: admin.clerkId },
                            workflowId: "invite-accepted",
                            payload: {
                                userName: `${user.firstName} ${user.lastName}`,
                                userEmail: user.email,
                                userRole: invitation.role,
                                businessName: invitation.Business.name,
                            },
                        });
                    } catch (error) {
                        console.error(`Failed to send notification to ${admin.email}:`, error);
                    }
                }
            } catch (notificationError) {
                console.error("Error sending invitations notifications:", notificationError);
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
                          message: "Please save these credentials and change your password after first login",
                      },
            });
        } catch (clerkError: any) {
            console.error("Error creating Clerk user:", clerkError);
            // ... (Clerk error handling)
            return res.status(500).json({
                error: "Failed to create user account",
                details: clerkError.errors?.[0]?.message || clerkError.message,
            });
        }
    } catch (error) {
        console.error("Accept invitation error:", error);
        // ... (Zod/General error handling)
        return res.status(500).json({ error: "Internal server error" });
    }
}

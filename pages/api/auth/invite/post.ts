import { NextApiRequest, NextApiResponse } from "next";
import { getAuth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/utils/lib/client";
import crypto from "crypto";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    if (req.method !== "POST") return res.status(405).end();

    const { userId: clerkId } = getAuth(req);
    if (!clerkId) return res.status(401).json({ error: "Unauthorized" });

    const { email, role, storeId } = req.body;

    try {
        const result = await prisma.$transaction(async (tx) => {
            // 1. Authoritatively identify the requestor
            const requestor = await tx.user.findUnique({
                where: { clerkId },
                select: { id: true, businessId: true, role: true },
            });

            if (
                !requestor?.businessId ||
                !["admin", "manager"].includes(requestor.role)
            ) {
                throw new Error(
                    "Forbidden: Insufficient permissions to invite team members.",
                );
            }

            // Must specify a store if they are not an admin
            if (!storeId && role !== "admin") {
                throw new Error("A branch must be selected for this role.");
            }

            // 2. CRITICAL: Lock the tenant record to prevent concurrent "Team Stuffing"
            await tx.$queryRaw`SELECT id FROM "Business" WHERE id = ${requestor.businessId}::uuid FOR UPDATE`;

            // 3. Fetch current plan limits
            const subscription = await tx.subscription.findFirst({
                where: { businessId: requestor.businessId },
                select: { plan: true, status: true },
                orderBy: { createdAt: "desc" }, // optional: pick latest if multiple exist
            });

            if (
                subscription?.status !== "ACTIVE" &&
                subscription?.status !== "TRIALING"
            ) {
                throw new Error(
                    "Active subscription required to invite users.",
                );
            }

            // 4. Count current staff + pending invitations
            const [staffCount, invitationCount] = await Promise.all([
                tx.user.count({ where: { businessId: requestor.businessId } }),
                tx.userInvitation.count({
                    where: {
                        businessId: requestor.businessId,
                        status: "pending",
                    },
                }),
            ]);

            const teamLimits = { STARTER: 1, STANDARD: 5, PREMIUM: 100 };
            const maxTeam =
                teamLimits[subscription.plan as keyof typeof teamLimits] || 1;

            if (staffCount + invitationCount >= maxTeam) {
                throw new Error(
                    `Team limit reached: Your ${subscription.plan} plan allows only ${maxTeam} member(s).`,
                );
            }

            // 5. Validation: Check for existing users
            const existingUser = await tx.user.findUnique({ where: { email } });
            if (existingUser)
                throw new Error("User already exists in the system.");

            const existingInvitation = await tx.userInvitation.findFirst({
                where: {
                    email,
                    businessId: requestor.businessId,
                    status: "pending",
                },
            });

            if (existingInvitation) {
                throw new Error("Invitation already sent");
            }

            const token = crypto.randomBytes(32).toString("hex");
            const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

            // 6. Create DB invitation
            const invitation = await tx.userInvitation.create({
                data: {
                    email,
                    role,
                    businessId: requestor.businessId,
                    storeId: storeId || null,
                    invitedBy: requestor.id,
                    token,
                    expiresAt,
                    status: "pending",
                },
                include: { Business: true },
            });

            // 7. Integrate with Clerk
            const client = await clerkClient();
            const clerkInvitation = await client.invitations.createInvitation({
                emailAddress: email,
                redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/auth/accept-invitation?token=${token}`,
                publicMetadata: {
                    role,
                    businessId: requestor.businessId,
                    businessName: invitation.Business.name,
                    invitationToken: token,
                },
            });

            return await tx.userInvitation.update({
                where: { id: invitation.id },
                data: { clerkInvitationId: clerkInvitation.id },
                include: { Business: true },
            });
        });

        return res.status(201).json({
            message: "Invitation sent successfully",
            invitation: {
                id: result.id,
                email: result.email,
                role: result.role,
                businessName: result.Business.name,
                expiresAt: result.expiresAt,
                status: result.status,
                clerkInvitationId: result.clerkInvitationId,
            },
        });
    } catch (error: any) {
        console.error("User Invitation Security Error:", error.message);
        return res
            .status(400)
            .json({ error: error.message || "Failed to send invitation" });
    }
}

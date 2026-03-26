import { NextApiRequest, NextApiResponse } from "next";
import { clerkClient, getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/utils/lib/client";

async function getUserById(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { userId: requestorClerkId } = getAuth(req);

        if (!requestorClerkId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const requestor = await prisma.user.findUnique({
            where: { clerkId: requestorClerkId },
            select: { businessId: true },
        });

        if (!requestor || !requestor.businessId) {
            return res
                .status(403)
                .json({ error: "You are not linked to a business" });
        }

        const targetId = Array.isArray(req.query.id)
            ? req.query.id[0]
            : req.query.id;

        if (!targetId) {
            return res.status(400).json({ error: "Missing user ID" });
        }

        const targetUser = await prisma.user.findFirst({
            where: {
                clerkId: targetId,
                businessId: requestor.businessId,
            },
        });

        if (!targetUser) {
            return res.status(404).json({ error: "User not found" });
        }

        const client = await clerkClient();

        let imageUrl = "/images/user.png";
        try {
            const clerkUser = await client.users.getUser(targetUser.clerkId);
            if (clerkUser.imageUrl) {
                imageUrl = clerkUser.imageUrl;
            }
        } catch (clerkError) {
            console.warn(
                `Could not fetch Clerk image for ${targetUser.clerkId}`,
            );
        }

        let invitedByData = {
            name: "Direct Join",
            imageUrl: "/images/user.png",
        };

        const invitation = await prisma.userInvitation.findFirst({
            where: {
                email: targetUser.email,
                businessId: requestor.businessId,
            },
        });

        if (invitation && invitation.invitedBy) {
            const inviter = await prisma.user.findUnique({
                where: { id: invitation.invitedBy },
                select: { clerkId: true, firstName: true, lastName: true },
            });

            if (inviter) {
                let inviterImage = "/images/user.png";
                try {
                    const inviterClerk = await client.users.getUser(
                        inviter.clerkId,
                    );
                    if (inviterClerk.imageUrl) {
                        inviterImage = inviterClerk.imageUrl;
                    }
                } catch (err) {}

                invitedByData = {
                    name: `${inviter.firstName} ${inviter.lastName}`,
                    imageUrl: inviterImage,
                };
            } else {
                invitedByData = {
                    name: "Unknown User",
                    imageUrl: "/images/user.png",
                };
            }
        }

        return res.status(200).json({
            id: targetUser.id,
            firstName: targetUser.firstName,
            lastName: targetUser.lastName,
            email: targetUser.email,
            role: targetUser.role,
            clerkId: targetUser.clerkId,
            createdAt: targetUser.createdAt,
            imageUrl: imageUrl,
            invitedBy: invitedByData,
        });
    } catch (error) {
        console.log("Error fetching user details:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

async function updateUser(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { userId: requestorClerkId } = getAuth(req);

        if (!requestorClerkId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const requestor = await prisma.user.findUnique({
            where: { clerkId: requestorClerkId },
            select: { businessId: true, role: true },
        });

        if (!requestor || !requestor.businessId) {
            return res
                .status(403)
                .json({ error: "You are not linked to a business" });
        }

        if (requestor.role !== "admin" && requestor.role !== "manager") {
            return res
                .status(403)
                .json({ error: "Insufficient permissions to modify users" });
        }

        const targetId = Array.isArray(req.query.id)
            ? req.query.id[0]
            : req.query.id;

        if (!targetId) {
            return res.status(400).json({ error: "Missing user ID" });
        }

        // PREVENT SELF-EDITING
        if (targetId === requestorClerkId) {
            return res
                .status(403)
                .json({ error: "You cannot modify your own account." });
        }

        const { storeId, role } = req.body;

        const targetUser = await prisma.user.findFirst({
            where: {
                clerkId: targetId,
                businessId: requestor.businessId,
            },
        });

        if (!targetUser) {
            return res.status(404).json({ error: "User not found" });
        }

        // STRICT RBAC VALIDATION
        // 1. The Admin cannot be edited by ANYONE (including themselves, to prevent accidental lockouts)
        if (targetUser.role === "admin") {
            return res.status(403).json({
                error: "The primary Admin account cannot be modified.",
            });
        }

        // 2. Managers can only edit regular Users
        if (requestor.role === "manager" && targetUser.role === "manager") {
            return res
                .status(403)
                .json({ error: "Managers cannot modify other Managers." });
        }

        // 3. Enforce valid role assignments
        if (role && role.toLowerCase() === "admin") {
            return res.status(403).json({
                error: "Cannot assign Admin role. There can be only one Admin per business.",
            });
        }

        const updateData: any = {};
        if (storeId !== undefined) {
            updateData.storeId =
                storeId === "null" || storeId === null ? null : storeId;
        }
        if (role) {
            updateData.role = role.toLowerCase();
        }

        const updatedUser = await prisma.user.update({
            where: { clerkId: targetId },
            data: updateData,
            include: { Store: { select: { id: true, name: true } } },
        });

        return res.status(200).json(updatedUser);
    } catch (error) {
        console.log("Error updating user details:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case "GET":
            return getUserById(req, res);
        case "PATCH":
            return updateUser(req, res);
        default:
            res.setHeader("Allow", ["GET", "PATCH"]);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

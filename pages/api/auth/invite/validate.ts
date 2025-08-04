// filepath: c:\Users\delse\Projects\aura\pages\api\auth\invite\validate.ts
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/utils/lib/client";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { token } = req.query;

        if (!token || typeof token !== "string") {
            return res.status(400).json({ error: "Token is required" });
        }

        const invitation = await prisma.userInvitation.findUnique({
            where: { token },
            include: { Business: true },
        });

        if (!invitation) {
            return res.status(404).json({ error: "Invalid invitation token" });
        }

        if (invitation.expiresAt < new Date()) {
            return res.status(400).json({ error: "Invitation has expired" });
        }

        if (invitation.status !== "pending") {
            return res
                .status(400)
                .json({ error: "Invitation already processed" });
        }

        return res.status(200).json({
            message: "Invitation is valid",
            invitation: {
                email: invitation.email,
                role: invitation.role,
                businessName: invitation.Business.name,
                token: invitation.token,
            },
        });
    } catch (error) {
        console.error("Validate invitation error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

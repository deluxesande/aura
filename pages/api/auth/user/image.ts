import { prisma } from "@/utils/lib/client";
import { clerkClient } from "@clerk/nextjs/server";
import type { NextApiRequest, NextApiResponse } from "next";

interface UserImageResponse {
    imageUrl: string;
}

interface ErrorResponse {
    error: string;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<UserImageResponse | ErrorResponse>
) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { userId } = req.query;

    if (!userId || typeof userId !== "string") {
        return res.status(400).json({ error: "User ID is required" });
    }

    const invitation = await prisma.userInvitation.findUnique({
        where: { id: userId },
    });

    const localUser = await prisma.user.findUnique({
        where: { email: invitation?.email },
    });

    if (!localUser) {
        return res.status(404).json({ error: "User not found" });
    }

    try {
        const client = await clerkClient();
        const user = await client.users.getUser(localUser.clerkId);

        res.status(200).json({
            imageUrl: user.imageUrl,
        });
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(404).json({ error: "User not found" });
    }
}

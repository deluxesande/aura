// pages/api/auth/[userId].ts
import { clerkClient } from "@clerk/nextjs/server";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { userId } = req.query;

    if (req.method !== "DELETE") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    if (!userId || typeof userId !== "string") {
        return res.status(400).json({ error: "Invalid userId" });
    }

    const client = await clerkClient();

    try {
        await client.users.deleteUser(userId);
        return res.status(200).json({ message: "User deleted" });
    } catch (error) {
        return res.status(500).json({ error: "Error deleting user" });
    }
}

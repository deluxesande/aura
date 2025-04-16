import { PrismaClient } from "@prisma/client";
import { error } from "console";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export default async function ContactFormSubmission(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed." });
    }

    try {
        const { name, email, message } = req.body;

        res.status(201).json(name);
    } catch (error) {
        res.status(500).json({ error: "Failed to send message" });
    }
}

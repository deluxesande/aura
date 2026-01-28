import { prisma } from "@/utils/lib/client";
import { NextApiRequest, NextApiResponse } from "next";

export default async function ContactFormSubmission(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed." });
    }

    try {
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const contactMessage = await prisma.contactFormMessage.create({
            data: {
                name,
                email,
                message,
            },
        });

        return res.status(201).json(contactMessage);
    } catch (error) {
        console.error("Database Error:", error);
        return res.status(500).json({ error: "Failed to send message" });
    }
}

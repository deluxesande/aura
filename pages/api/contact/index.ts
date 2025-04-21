import { PrismaClient } from "@prisma/client";
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

        const contactMessage = prisma.contactFormMessage.create({
            data: {
                name,
                email,
                message,
            },
        });

        res.status(201).json(contactMessage);
    } catch (error) {
        res.status(400).json({ error: "Failed to send message" });
    }
}

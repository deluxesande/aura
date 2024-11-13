import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === "POST") {
        const { email, name, image } = req.body;

        try {
            // Check if user already exists
            let user = await prisma.user.findUnique({
                where: { email },
            });

            if (!user) {
                // Create new user
                user = await prisma.user.create({
                    data: {
                        email,
                        name,
                        image,
                    },
                });
            }

            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ error: "Error linking user" });
        }
    } else {
        res.status(405).json({ error: "Method not allowed" });
    }
}

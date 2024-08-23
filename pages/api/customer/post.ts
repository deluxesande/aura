import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export const addCustomer = async (
    req: NextApiRequest,
    res: NextApiResponse
) => {
    try {
        const { name, email = undefined, phoneNumber } = req.body;

        const newCustomer = await prisma.customer.create({
            data: {
                name,
                email,
                phoneNumber,
            },
        });

        res.status(201).json(newCustomer);
    } catch (error) {
        res.status(500).json({ error: "Failed to add customer" });
    }
};

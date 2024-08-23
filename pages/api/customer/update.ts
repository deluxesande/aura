import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export const updateCustomer = async (
    req: NextApiRequest,
    res: NextApiResponse
) => {
    const id = Number(req.query.id);
    const { name, email = undefined, phoneNumber } = req.body;

    if (!id || typeof id !== "number") {
        return res
            .status(400)
            .json({ error: "Invalid or missing customer ID" });
    }

    try {
        const updatedCustomer = await prisma.customer.update({
            where: {
                id: id,
            },
            data: {
                name,
                email,
                phoneNumber,
            },
        });

        res.status(200).json(updatedCustomer);
    } catch (error) {
        res.status(500).json({ error: "Failed to update customer" });
    }
};

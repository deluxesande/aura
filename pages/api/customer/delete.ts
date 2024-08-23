import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export const deleteCustomer = async (
    req: NextApiRequest,
    res: NextApiResponse
) => {
    const { id } = req.body;

    try {
        await prisma.customer.delete({
            where: {
                id: id,
            },
        });
        res.status(204).end();
    } catch (error) {
        res.status(404).json({ error: "Failed to delete customer" });
    }
};

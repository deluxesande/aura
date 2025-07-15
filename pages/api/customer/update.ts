import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/utils/lib/client";

export const updateCustomer = async (
    req: NextApiRequest,
    res: NextApiResponse
) => {
    const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
    const { firstName, lastName, email = undefined, phoneNumber } = req.body;

    if (!id) {
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
                firstName,
                lastName,
                email,
                phoneNumber,
            },
        });

        res.status(200).json(updatedCustomer);
    } catch (error) {
        res.status(500).json({ error: "Failed to update customer" });
    }
};

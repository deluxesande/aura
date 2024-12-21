import { getAuth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { addCreatedBy } from "../middleware";

const prisma = new PrismaClient();

const addCustomerHandler = async (
    req: NextApiRequest,
    res: NextApiResponse
) => {
    try {
        const user = getAuth(req);
        const {
            firstName,
            lastName,
            email = undefined, // Optional field
            phoneNumber,
        } = req.body;

        const newCustomer = await prisma.customer.create({
            data: {
                firstName,
                lastName,
                email,
                phoneNumber,
                createdBy: req.body.createdBy,
            },
        });

        res.status(201).json(newCustomer);
    } catch (error) {
        res.status(500).json({ error: "Failed to add customer" });
    }
};
export const addCustomer = addCreatedBy(addCustomerHandler);

import { getAuth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { addCreatedBy } from "../middleware";

const prisma = new PrismaClient();

const addBusinessHandler = async (
    req: NextApiRequest,
    res: NextApiResponse
) => {
    try {
        const user = getAuth(req);
        const { name, logo } = req.body;

        const newBusiness = await prisma.business.create({
            data: {
                name,
                logo,
                createdBy: req.body.createdBy,
            },
        });

        res.status(201).json(newBusiness);
    } catch (error) {
        res.status(500).json({ error: "Failed to add business" });
    }
};
export const addBusiness = addCreatedBy(addBusinessHandler);

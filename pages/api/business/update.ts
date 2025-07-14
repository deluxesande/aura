import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export const updateBusiness = async (
    req: NextApiRequest,
    res: NextApiResponse
) => {
    const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
    const { name, logo } = req.body;

    if (!id) {
        return res
            .status(400)
            .json({ error: "Invalid or missing business ID" });
    }

    try {
        const updatedBusiness = await prisma.business.update({
            where: {
                id: id,
            },
            data: {
                name,
                logo,
            },
        });

        res.status(200).json(updatedBusiness);
    } catch (error) {
        res.status(500).json({ error: "Failed to update business" });
    }
};

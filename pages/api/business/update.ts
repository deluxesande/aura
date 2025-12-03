import { getAuth } from "@clerk/nextjs/server";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/utils/lib/client";

export const updateBusiness = async (
    req: NextApiRequest,
    res: NextApiResponse
) => {
    try {
        const user = getAuth(req);

        if (!user.userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
        const { name, logo } = req.body;

        if (!id) {
            return res
                .status(400)
                .json({ error: "Invalid or missing business ID" });
        }

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
        // console.error("Error updating business:", error);
        res.status(500).json({ error: "Failed to update business" });
    }
};

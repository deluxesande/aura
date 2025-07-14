import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { updateBusiness } from "./update";
import { deleteBusiness } from "./delete";

const prisma = new PrismaClient();

async function getBusinessById(req: NextApiRequest, res: NextApiResponse) {
    const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;

    if (!id) {
        return res
            .status(400)
            .json({ error: "Invalid or missing Business ID" });
    }

    try {
        const business = await prisma.business.findUnique({
            where: {
                id: id,
            },
        });

        if (!business) {
            return res.status(404).json({ error: "Business not found" });
        }

        res.status(200).json(business);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch Business" });
    }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case "GET":
            return getBusinessById(req, res);
        case "PUT":
            return updateBusiness(req, res);
        case "DELETE":
            return deleteBusiness(req, res);
        default:
            res.setHeader("Allow", ["GET"]);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { updateCustomer } from "./update";
import { deleteCustomer } from "./delete";

const prisma = new PrismaClient();

async function getCustomerById(req: NextApiRequest, res: NextApiResponse) {
    const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;

    if (!id) {
        return res
            .status(400)
            .json({ error: "Invalid or missing customer ID" });
    }

    try {
        const customer = await prisma.customer.findUnique({
            where: {
                id: id,
            },
        });

        if (!customer) {
            return res.status(404).json({ error: "Customer not found" });
        }

        res.status(200).json(customer);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch customer" });
    }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case "GET":
            return getCustomerById(req, res);
        case "PUT":
            return updateCustomer(req, res);
        case "DELETE":
            return deleteCustomer(req, res);
        default:
            res.setHeader("Allow", ["GET"]);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

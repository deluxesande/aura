import type { NextApiRequest, NextApiResponse } from "next";
import { deleteProduct } from "./delete";
import { updateProduct } from "./update";
import { prisma } from "@/utils/lib/client";

async function getProductById(req: NextApiRequest, res: NextApiResponse) {
    const id = req.query.id as string;

    try {
        const product = await prisma.product.findUnique({
            where: {
                id: id,
            },
        });

        if (product) {
            res.status(200).json(product);
        } else {
            res.status(404).json({ message: "Product not found" });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch product" });
    }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case "GET":
            return getProductById(req, res);
        case "PUT":
            return updateProduct(req, res);
        case "DELETE":
            return deleteProduct(req, res);
        default:
            res.setHeader("Allow", ["PUT", "DELETE"]);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

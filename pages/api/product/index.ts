import type { NextApiRequest, NextApiResponse } from "next";
import { getProducts } from "./get";
import { addProduct } from "./post";
import { getAuth } from "@clerk/nextjs/server";

export const config = {
    api: {
        bodyParser: false,
    },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const { userId } = getAuth(req);

    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    switch (req.method) {
        case "GET":
            return getProducts(req, res);
        case "POST":
            return addProduct(req, res);
        default:
            res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

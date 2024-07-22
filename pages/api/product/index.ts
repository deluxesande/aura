import type { NextApiRequest, NextApiResponse } from "next";
import { getProducts } from "./get";
import { addProduct } from "./post";
import { updateProduct } from "./update";
import { deleteProduct } from "./delete";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case "GET":
            return getProducts(req, res);
        case "POST":
            return addProduct(req, res);
        case "PUT":
            return updateProduct(req, res);
        case "DELETE":
            return deleteProduct(req, res);
        default:
            res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

import type { NextApiRequest, NextApiResponse } from "next";
import { getProducts } from "./getproducts";
import { addProduct } from "./addProduct";
import { updateProduct } from "./updateProduct";
import { deleteProduct } from "./deleteProduct";

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

import type { NextApiRequest, NextApiResponse } from "next";
import { getCategories } from "./get";
import { addCategory } from "./post";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case "GET":
            return getCategories(req, res);
        case "POST":
            return addCategory(req, res);
        default:
            res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

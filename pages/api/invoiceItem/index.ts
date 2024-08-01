import type { NextApiRequest, NextApiResponse } from "next";
import { getInvoiceItem } from "./get";
import { addInvoiceItem } from "./post";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case "GET":
            return getInvoiceItem(req, res);
        case "POST":
            return addInvoiceItem(req, res);
        default:
            res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

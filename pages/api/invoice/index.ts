import type { NextApiRequest, NextApiResponse } from "next";
import { getInvoices } from "./get";
import { addInvoice } from "./post";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case "GET":
            return getInvoices(req, res);
        case "POST":
            return addInvoice(req, res);
        default:
            res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

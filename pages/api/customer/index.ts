import type { NextApiRequest, NextApiResponse } from "next";
import { getCustomers } from "./get";
import { addCustomer } from "./post";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case "GET":
            return getCustomers(req, res);
        case "POST":
            return addCustomer(req, res);
        default:
            res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

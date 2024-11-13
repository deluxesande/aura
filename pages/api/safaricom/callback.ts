import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        // Handle the callback from Safaricom
        console.log(req.body);
        res.status(200).json({ message: "Callback received" });
    } else {
        res.status(405).json({ message: "Method not allowed" });
    }
}

import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const timeout = req.body;

    if (!timeout) {
        return res.status(400).json({ error: "Invalid timeout data" });
    }

    console.log("Queue Timeout Data:", timeout);

    res.status(200).json({ message: "Queue timeout received successfully" });
};

export default handler;

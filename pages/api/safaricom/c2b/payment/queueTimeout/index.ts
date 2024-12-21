import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

// Function to store timeouts in a JSON file
const storeTimeout = (timeout: any) => {
    const filePath = path.join(
        process.cwd(),
        "pages/api/safaricom/c2b/payment/data/queueTimeouts.json"
    );
    let timeouts = [];

    if (fs.existsSync(filePath)) {
        const fileData = fs.readFileSync(filePath, "utf8");
        timeouts = JSON.parse(fileData);
    }

    timeouts.push(timeout);

    fs.writeFileSync(filePath, JSON.stringify(timeouts, null, 2));
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const timeout = req.body;

    if (!timeout) {
        return res.status(400).json({ error: "Invalid timeout data" });
    }

    // Store the timeout in the JSON file
    storeTimeout(timeout);

    res.status(200).json({
        message: "Queue timeout received and stored successfully",
    });
};

export default handler;

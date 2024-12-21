import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

// Function to store responses in a JSON file
const storeResponse = (response: any) => {
    const filePath = path.join(
        process.cwd(),
        "pages/api/safaricom/c2b/payment/data/resultResponse.json"
    );
    let responses = [];

    if (fs.existsSync(filePath)) {
        const fileData = fs.readFileSync(filePath, "utf8");
        responses = JSON.parse(fileData);
    }

    responses.push(response);

    fs.writeFileSync(filePath, JSON.stringify(responses, null, 2));
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const result = req.body.Result;

    if (!result) {
        return res.status(400).json({ error: "Invalid result data" });
    }

    // Store the result in the JSON file
    storeResponse(result);

    res.status(200).json({
        message: "Result received and stored successfully",
    });
};

export default handler;

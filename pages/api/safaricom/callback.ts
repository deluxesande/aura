import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

// Function to store callbacks in a JSON file
const storeCallback = (callbackData: any, fileName: string) => {
    const filePath = path.join(
        process.cwd(),
        `pages/api/safaricom/c2b/payment/data/${fileName}`
    );
    let callbacks = [];

    if (fs.existsSync(filePath)) {
        const fileData = fs.readFileSync(filePath, "utf8");
        callbacks = JSON.parse(fileData);
    }

    callbacks.push(callbackData);

    fs.writeFileSync(filePath, JSON.stringify(callbacks, null, 2));
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        const callbackData = req.body;

        // Check if Body and stkCallback are defined
        if (!callbackData.Body || !callbackData.Body.stkCallback) {
            return res.status(400).json({ error: "Invalid callback data" });
        }

        // Check the result code
        const resultCode = callbackData.Body.stkCallback.ResultCode;
        if (resultCode !== 0) {
            // If the result code is not 0, there was an error
            const errorMessage = callbackData.Body.stkCallback.ResultDesc;
            const responseData = {
                ResultCode: resultCode,
                ResultDesc: errorMessage,
            };
            storeCallback(callbackData, "failedCallbacks.json");
            return res.json(responseData);
        }

        // Store the successful callback data
        storeCallback(callbackData, "successfulCallbacks.json");

        // Return a success response to mpesa
        return res.json("success");
    } else {
        res.status(405).json({ error: "Method not allowed" });
    }
}

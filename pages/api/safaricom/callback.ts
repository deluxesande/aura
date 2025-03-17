import {
    storeFailedCallbackInDb,
    storeSuccessfulCallbackInDb,
} from "@/utils/storeInDb";
import { NextApiRequest, NextApiResponse } from "next";

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
            storeFailedCallbackInDb(callbackData);
            return res.json(responseData);
        }

        // Store the successful callback data
        storeSuccessfulCallbackInDb(callbackData);

        // Return a success response to mpesa
        return res.json("success");
    } else {
        res.status(405).json({ error: "Method not allowed" });
    }
}

import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        const callbackData = req.body;

        console.log("Received callback data:", callbackData);

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
            return res.json(responseData);
        }

        // If the result code is 0, the transaction was completed
        const body = callbackData.Body.stkCallback.CallbackMetadata;

        // Get amount
        const amountObj = body.Item.find((obj: any) => obj.Name === "Amount");
        const amount = amountObj.Value;

        // Get Mpesa code
        const codeObj = body.Item.find(
            (obj: any) => obj.Name === "MpesaReceiptNumber"
        );
        const mpesaCode = codeObj.Value;

        // Get phone number
        const phoneNumberObj = body.Item.find(
            (obj: any) => obj.Name === "PhoneNumber"
        );
        const phone = phoneNumberObj.Value;

        // Log the values
        console.log("Amount:", amount);
        console.log("Mpesa Code:", mpesaCode);
        console.log("Phone Number:", phone);

        // Save the variables to a file or database, etc.
        // ...

        // Return a success response to mpesa
        return res.json("success");
    } else {
        res.status(405).json({ error: "Method not allowed" });
    }
}

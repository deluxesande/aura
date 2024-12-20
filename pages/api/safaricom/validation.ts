import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        const validationData = req.body;

        // Log the incoming request
        console.log("Received validation request:", validationData);

        // Check if required fields are defined
        if (
            !validationData ||
            !validationData.TransactionType ||
            !validationData.TransID ||
            !validationData.TransTime ||
            !validationData.TransAmount ||
            !validationData.BusinessShortCode ||
            !validationData.BillRefNumber ||
            !validationData.InvoiceNumber ||
            !validationData.OrgAccountBalance ||
            !validationData.ThirdPartyTransID ||
            !validationData.MSISDN ||
            !validationData.FirstName ||
            !validationData.MiddleName ||
            !validationData.LastName
        ) {
            // Log the validation data
            console.log("Invalid Validation Data:", validationData);

            // Return a rejection response to mpesa
            return res.json({
                ResultCode: "C2B00011",
                ResultDesc: "Rejected",
            });
        }

        // Log the validation data
        console.log("Validation Data:", validationData);

        // Save the variables to a file or database, etc.
        // ...

        // Return a success response to mpesa
        return res.json({
            ResultCode: "0",
            ResultDesc: "Accepted",
        });
    } else {
        res.status(405).json({ error: "Method not allowed" });
    }
}

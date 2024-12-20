import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        const confirmationData = req.body;

        // Check if required fields are defined
        if (
            !confirmationData ||
            !confirmationData.TransactionType ||
            !confirmationData.TransID ||
            !confirmationData.TransTime ||
            !confirmationData.TransAmount ||
            !confirmationData.BusinessShortCode ||
            !confirmationData.BillRefNumber ||
            !confirmationData.InvoiceNumber ||
            !confirmationData.OrgAccountBalance ||
            !confirmationData.ThirdPartyTransID ||
            !confirmationData.MSISDN ||
            !confirmationData.FirstName ||
            !confirmationData.MiddleName ||
            !confirmationData.LastName
        ) {
            // Log the invalid confirmation data
            console.log("Invalid Confirmation Data:", confirmationData);

            // Return a rejection response to mpesa
            return res.json({
                ResultCode: "C2B00011",
                ResultDesc: "Rejected",
            });
        }

        // Log the confirmation data
        console.log("Confirmation Data:", confirmationData);

        // Save the variables to a file or database, etc.
        // ...

        // Return a success response to mpesa
        return res.json({
            ResultCode: 0,
            ResultDesc: "Accepted",
        });
    } else {
        res.status(405).json({ error: "Method not allowed" });
    }
}

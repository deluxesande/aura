import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

// Function to store confirmation data in a JSON file
const storeConfirmation = (confirmationData: any) => {
    const filePath = path.join(
        process.cwd(),
        "pages/api/safaricom/c2b/payment/data/confirmations.json"
    );
    let confirmations = [];

    if (fs.existsSync(filePath)) {
        const fileData = fs.readFileSync(filePath, "utf8");
        confirmations = JSON.parse(fileData);
    }

    confirmations.push(confirmationData);

    fs.writeFileSync(filePath, JSON.stringify(confirmations, null, 2));
};

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
            // Store the invalid confirmation data
            storeConfirmation({ status: "invalid", data: confirmationData });

            // Return a rejection response to mpesa
            return res.json({
                ResultCode: "C2B00011",
                ResultDesc: "Rejected",
            });
        }

        // Store the valid confirmation data
        storeConfirmation({ status: "valid", data: confirmationData });

        // Return a success response to mpesa
        return res.json({
            ResultCode: "0",
            ResultDesc: "Accepted",
        });
    } else {
        res.status(405).json({ error: "Method not allowed" });
    }
}

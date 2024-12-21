import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

// Function to store validation data in a JSON file
const storeValidation = (validationData: any) => {
    const filePath = path.join(
        process.cwd(),
        "pages/api/safaricom/c2b/payment/data/validations.json"
    );
    let validations = [];

    if (fs.existsSync(filePath)) {
        const fileData = fs.readFileSync(filePath, "utf8");
        validations = JSON.parse(fileData);
    }

    validations.push(validationData);

    fs.writeFileSync(filePath, JSON.stringify(validations, null, 2));
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        const validationData = req.body;

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
            // Store the invalid validation data
            storeValidation({ status: "invalid", data: validationData });

            // Return a rejection response to mpesa
            return res.json({
                ResultCode: "C2B00011",
                ResultDesc: "Rejected",
            });
        }

        // Store the valid validation data
        storeValidation({ status: "valid", data: validationData });

        // Return a success response to mpesa
        return res.json({
            ResultCode: "0",
            ResultDesc: "Accepted",
        });
    } else {
        res.status(405).json({ error: "Method not allowed" });
    }
}

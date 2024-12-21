import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const result = req.body.Result;

    if (!result) {
        return res.status(400).json({ error: "Invalid result data" });
    }

    console.log("Result Type:", result.ResultType);
    console.log("Result Code:", result.ResultCode);
    console.log("Result Description:", result.ResultDesc);
    console.log("Originator Conversation ID:", result.OriginatorConversationID);
    console.log("Conversation ID:", result.ConversationID);
    console.log("Transaction ID:", result.TransactionID);

    if (result.ResultParameters && result.ResultParameters.ResultParameter) {
        result.ResultParameters.ResultParameter.forEach((param: any) => {
            console.log(`${param.Key}: ${param.Value}`);
        });
    }

    if (result.ReferenceData && result.ReferenceData.ReferenceItem) {
        result.ReferenceData.ReferenceItem.forEach((item: any) => {
            console.log(`${item.Key}: ${item.Value}`);
        });
    }

    res.status(200).json({ message: "Result received successfully" });
};

export default handler;

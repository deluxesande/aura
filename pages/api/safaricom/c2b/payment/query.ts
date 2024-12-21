import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

const consumerKey = process.env.CONSUMER_KEY || "";
const consumerSecret = process.env.CONSUMER_SECRET || "";
const initiator = process.env.INITIATOR_NAME || "";
const securityCredential = process.env.SECURITY_CREDENTIAL || "";
const resultURL = process.env.RESULT_URL || "";
const queueTimeoutURL = process.env.QUEUE_TIMEOUT_URL || "";
const shortCode = process.env.SHORTCODE || "";

// Function to get an access token from the endpoint
const getAccessToken = async () => {
    try {
        const response = await axios.get(
            "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
            {
                auth: {
                    username: consumerKey,
                    password: consumerSecret,
                },
            }
        );
        return response.data.access_token;
    } catch (error) {
        throw error;
    }
};

// Function to check the transaction status
const checkTransactionStatus = async (
    accessToken: string,
    transactionID: string,
    partyA: string,
    originatorConversationID: string
) => {
    const url =
        "https://sandbox.safaricom.co.ke/mpesa/transactionstatus/v1/query";

    const requestData = {
        Initiator: initiator,
        SecurityCredential: securityCredential,
        CommandID: "TransactionStatusQuery",
        TransactionID: transactionID,
        OriginatorConversationID: originatorConversationID,
        PartyA: partyA,
        IdentifierType: "4",
        ResultURL: resultURL,
        QueueTimeOutURL: queueTimeoutURL,
        Remarks: "OK",
        Occasion: "OK",
    };

    try {
        const response = await axios.post(url, requestData, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error checking transaction status:", error);
        throw new Error("Failed to check transaction status");
    }
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const {
        transactionID,
        originatorConversationID,
        partyA = shortCode,
    } = req.body;

    try {
        const accessToken = await getAccessToken();
        const statusResponse = await checkTransactionStatus(
            accessToken,
            transactionID,
            partyA,
            originatorConversationID
        );
        res.status(200).json(statusResponse);
    } catch (error) {
        res.status(500).json({ error: "Failed to check transaction status" });
    }
};

export default handler;

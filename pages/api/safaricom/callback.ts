import {
    storeFailedCallbackInDb,
    storeSuccessfulCallbackInDb,
} from "@/utils/storeInDb";
import type { NextApiRequest, NextApiResponse } from "next";

interface CallbackItem {
    Name: string;
    Value?: string | number;
}

interface StkCallbackMetadata {
    Item: CallbackItem[];
}

interface StkCallback {
    MerchantRequestID: string;
    CheckoutRequestID: string;
    ResultCode: number;
    ResultDesc: string;
    CallbackMetadata?: StkCallbackMetadata;
}

interface MpesaBody {
    stkCallback: StkCallback;
}

interface MpesaPayload {
    Body: MpesaBody;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const payload = req.body as MpesaPayload;

        console.log(payload);

        if (!payload?.Body?.stkCallback) {
            return res.status(400).json({ error: "Invalid payload structure" });
        }

        const {
            ResultCode,
            ResultDesc,
            CallbackMetadata,
            MerchantRequestID,
            CheckoutRequestID,
        } = payload.Body.stkCallback;

        if (ResultCode !== 0) {
            await storeFailedCallbackInDb({
                CheckoutRequestID,
                ResultCode,
                ResultDesc,
            });

            // Always return 200 to Safaricom so they stop retrying
            return res.status(200).json({ result: "acknowledged_failure" });
        }

        const metaItems = CallbackMetadata?.Item || [];

        const getMetaValue = (name: string) => {
            const item = metaItems.find((i) => i.Name === name);
            return item?.Value;
        };

        const amount = Number(getMetaValue("Amount"));
        const receiptNumber = String(getMetaValue("MpesaReceiptNumber"));
        const phoneNumber = String(getMetaValue("PhoneNumber"));
        const transactionDate = String(getMetaValue("TransactionDate"));

        // Store cleaned data in DB
        await storeSuccessfulCallbackInDb({
            CheckoutRequestID,
            MerchantRequestID,
            Amount: amount,
            MpesaReceiptNumber: receiptNumber,
            PhoneNumber: phoneNumber,
            TransactionDate: transactionDate,
        });

        return res.status(200).json({ result: "success" });
    } catch (error) {
        return res.status(200).json({ result: "error_handled" });
    }
}

import {
    storeFailedCallbackInDb,
    storeSuccessfulCallbackInDb,
} from "@/utils/storeInDb";
import { masterPrisma, getTenantPrisma } from "@/utils/lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

interface CallbackItem {
    Name: string;
    Value?: string | number;
}
interface StkCallback {
    MerchantRequestID: string;
    CheckoutRequestID: string;
    ResultCode: number;
    ResultDesc: string;
    CallbackMetadata?: { Item: CallbackItem[] };
}
interface MpesaPayload {
    Body: { stkCallback: StkCallback };
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const payload = req.body as MpesaPayload;

        if (!payload?.Body?.stkCallback) {
            return res.status(400).json({ error: "Invalid payload" });
        }

        const {
            ResultCode,
            ResultDesc,
            CallbackMetadata,
            MerchantRequestID,
            CheckoutRequestID,
        } = payload.Body.stkCallback;

        // 1. Look up routing info in Master DB
        let routingInfo = null;
        let retries = 5;

        while (retries > 0) {
            routingInfo = await masterPrisma.mpesaRouting.findUnique({
                where: { checkoutRequestId: CheckoutRequestID },
            });

            if (routingInfo) break;

            await wait(500);
            retries--;
        }

        if (!routingInfo) {
            console.warn(`Orphaned Callback (No Routing Info): ${CheckoutRequestID}`);
            return res.status(200).json({ result: "orphaned_record" });
        }

        const businessId = routingInfo.businessId;
        const tenantPrisma = await getTenantPrisma(businessId);

        // 2. Fetch the pending payment from Tenant DB
        const pendingPayment = await tenantPrisma.mpesaPayment.findUnique({
            where: { checkoutRequestId: CheckoutRequestID },
        });

        if (!pendingPayment) {
            console.warn(`Orphaned Callback (No Payment Record in Tenant DB): ${CheckoutRequestID}`);
            return res.status(200).json({ result: "orphaned_record" });
        }

        // Handle Failed Transaction
        if (ResultCode !== 0) {
            await storeFailedCallbackInDb(tenantPrisma, {
                MerchantRequestID,
                CheckoutRequestID,
                ResultCode,
                ResultDesc,
                invoiceId: pendingPayment?.invoiceId,
            });

            const newStatus = ResultCode === 1032 ? "CANCELLED" : "FAILED";

            await tenantPrisma.$transaction([
                tenantPrisma.mpesaPayment.update({
                    where: { id: pendingPayment.id },
                    data: { status: "FAILED" },
                }),
                tenantPrisma.invoice.update({
                    where: { id: pendingPayment.invoiceId },
                    data: { status: newStatus as any },
                }),
            ]);

            return res.status(200).json({ result: "acknowledged_failure" });
        }

        const metaItems = CallbackMetadata?.Item || [];
        const getMetaValue = (name: string) =>
            metaItems.find((i) => i.Name === name)?.Value;

        const amountPaid = Number(getMetaValue("Amount"));
        const receiptNumber = String(getMetaValue("MpesaReceiptNumber"));
        const phoneNumber = String(getMetaValue("PhoneNumber"));
        const transactionDate = String(getMetaValue("TransactionDate") || "0");

        // 3. Finalize in Tenant DB
        await storeSuccessfulCallbackInDb(tenantPrisma, {
            MerchantRequestID,
            CheckoutRequestID,
            ResultCode,
            ResultDesc,
            Amount: amountPaid,
            MpesaReceiptNumber: receiptNumber,
            PhoneNumber: phoneNumber,
            TransactionDate: transactionDate,
            invoiceId: pendingPayment.invoiceId,
        });

        await tenantPrisma.$transaction([
            tenantPrisma.mpesaPayment.update({
                where: { id: pendingPayment.id },
                data: {
                    status: "COMPLETED",
                    amount: amountPaid,
                },
            }),
            tenantPrisma.invoice.update({
                where: { id: pendingPayment.invoiceId },
                data: {
                    status: "PAID",
                    paymentType: "MPESA",
                },
            }),
        ]);

        return res.status(200).json({ result: "success" });
    } catch (error) {
        console.error("Callback Error:", error);
        return res.status(200).json({ result: "error_handled" });
    }
}

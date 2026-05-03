interface FailedCallbackData {
    MerchantRequestID: string;
    CheckoutRequestID: string;
    ResultCode: number;
    ResultDesc: string;
    invoiceId?: string | null;
}

interface SuccessCallbackData {
    MerchantRequestID: string;
    CheckoutRequestID: string;
    ResultCode: number;
    ResultDesc: string;
    Amount: number;
    MpesaReceiptNumber: string;
    TransactionDate: string;
    PhoneNumber: string;
    invoiceId?: string | null;
}

/**
 * Stores a failed M-Pesa callback in the provided tenant database.
 */
export const storeFailedCallbackInDb = async (tenantPrisma: any, data: FailedCallbackData) => {
    try {
        await tenantPrisma.failedCallback.create({
            data: {
                merchantRequestId: data.MerchantRequestID,
                checkoutRequestId: data.CheckoutRequestID,
                resultCode: data.ResultCode,
                resultDesc: data.ResultDesc,
                invoiceId: data.invoiceId || null,
            },
        });
        console.log("Failed transaction stored in Tenant DB");
    } catch (error) {
        console.error("Prisma Error (FailedCallback):", error);
    }
};

/**
 * Stores a successful M-Pesa callback in the provided tenant database.
 */
export const storeSuccessfulCallbackInDb = async (
    tenantPrisma: any,
    data: SuccessCallbackData
) => {
    try {
        await tenantPrisma.successfulCallback.create({
            data: {
                merchantRequestId: data.MerchantRequestID,
                checkoutRequestId: data.CheckoutRequestID,
                resultCode: data.ResultCode,
                resultDesc: data.ResultDesc,
                amount: data.Amount,
                mpesaReceiptNumber: data.MpesaReceiptNumber,
                transactionDate: Number(data.TransactionDate),
                phoneNumber: Number(data.PhoneNumber),
                invoiceId: data.invoiceId || null,
            },
        });
        console.log("Successful transaction stored in Tenant DB");
    } catch (error) {
        console.error("Prisma Error (SuccessfulCallback):", error);
    }
};

/**
 * Stores the raw STK Push response in the provided tenant database.
 */
export const storeResponseInDb = async (tenantPrisma: any, response: any) => {
    try {
        await tenantPrisma.response.create({
            data: {
                merchantRequestId: response.MerchantRequestID,
                checkoutRequestId: response.CheckoutRequestID,
                responseCode: response.ResponseCode,
                responseDescription: response.ResponseDescription,
                customerMessage: response.CustomerMessage,
            },
        });
    } catch (error) {
        console.error("Prisma Error (Response):", error);
    }
};

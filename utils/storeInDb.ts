import { PrismaClient } from "@prisma/client";

// Use global Prisma instance to prevent connection limits in dev
const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

interface FailedCallbackData {
    MerchantRequestID: string;
    CheckoutRequestID: string;
    ResultCode: number;
    ResultDesc: string;
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
}

// 1. Store Failed Callback (Now accepts flat data)
export const storeFailedCallbackInDb = async (data: FailedCallbackData) => {
    try {
        await prisma.failedCallback.create({
            data: {
                merchantRequestId: data.MerchantRequestID,
                checkoutRequestId: data.CheckoutRequestID,
                resultCode: data.ResultCode,
                resultDesc: data.ResultDesc,
            },
        });
        console.log("Failed transaction stored in DB");
    } catch (error) {
        console.error("Prisma Error (FailedCallback):", error);
    }
};

// 2. Store Successful Callback (Now accepts flat data)
export const storeSuccessfulCallbackInDb = async (
    data: SuccessCallbackData
) => {
    try {
        await prisma.successfulCallback.create({
            data: {
                merchantRequestId: data.MerchantRequestID,
                checkoutRequestId: data.CheckoutRequestID,
                resultCode: data.ResultCode,
                resultDesc: data.ResultDesc,
                amount: data.Amount,
                mpesaReceiptNumber: data.MpesaReceiptNumber,
                transactionDate: Number(data.TransactionDate),
                phoneNumber: Number(data.PhoneNumber),
            },
        });
        console.log("Successful transaction stored in DB");
    } catch (error) {
        console.error("Prisma Error (SuccessfulCallback):", error);
    }
};

export const storeResponseInDb = async (response: any) => {
    await prisma.response.create({
        data: {
            merchantRequestId: response.MerchantRequestID,
            checkoutRequestId: response.CheckoutRequestID,
            responseCode: response.ResponseCode,
            responseDescription: response.ResponseDescription,
            customerMessage: response.CustomerMessage,
        },
    });
};

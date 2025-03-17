import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

export const storeResultResponseInDb = async (response: any) => {
    await prisma.resultResponse.create({
        data: {
            resultType: response.resultType,
            resultCode: response.resultCode,
            resultDesc: response.resultDesc,
            originatorConversationID: response.originatorConversationID,
            conversationID: response.conversationID,
            transactionID: response.transactionID,
            referenceData: {
                create: {
                    referenceItem: {
                        create: {
                            key: response.referenceData.referenceItem.key,
                            value: response.referenceData.referenceItem.value,
                        },
                    },
                },
            },
        },
    });
};

export const storeFailedCallbackInDb = async (response: any) => {
    await prisma.failedCallback.create({
        data: {
            merchantRequestId: response.Body.stkCallback.MerchantRequestID,
            checkoutRequestId: response.Body.stkCallback.CheckoutRequestID,
            resultCode: response.Body.stkCallback.ResultCode,
            resultDesc: response.Body.stkCallback.ResultDesc,
        },
    });
};

export const storeSuccessfulCallbackInDb = async (response: any) => {
    const callbackMetadata = response.Body.stkCallback.CallbackMetadata.Item;
    const amount = callbackMetadata.find(
        (item: any) => item.Name === "Amount"
    )?.Value;
    const mpesaReceiptNumber = callbackMetadata.find(
        (item: any) => item.Name === "MpesaReceiptNumber"
    )?.Value;
    const transactionDate = callbackMetadata.find(
        (item: any) => item.Name === "TransactionDate"
    )?.Value;
    const phoneNumber = callbackMetadata.find(
        (item: any) => item.Name === "PhoneNumber"
    )?.Value;

    await prisma.successfulCallback.create({
        data: {
            merchantRequestId: response.Body.stkCallback.MerchantRequestID,
            checkoutRequestId: response.Body.stkCallback.CheckoutRequestID,
            resultCode: response.Body.stkCallback.ResultCode,
            resultDesc: response.Body.stkCallback.ResultDesc,
            amount: amount,
            mpesaReceiptNumber: mpesaReceiptNumber,
            transactionDate: transactionDate,
            phoneNumber: phoneNumber,
        },
    });
};

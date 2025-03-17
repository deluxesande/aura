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

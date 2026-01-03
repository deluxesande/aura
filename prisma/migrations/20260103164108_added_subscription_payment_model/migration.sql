/*
  Warnings:

  - You are about to drop the column `subscriptionId` on the `MpesaPayment` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "MpesaPayment" DROP CONSTRAINT "MpesaPayment_subscriptionId_fkey";

-- AlterTable
ALTER TABLE "MpesaPayment" DROP COLUMN "subscriptionId";

-- CreateTable
CREATE TABLE "SubscriptionPayment" (
    "_id" UUID NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "merchantRequestId" TEXT NOT NULL,
    "checkoutRequestId" TEXT NOT NULL,
    "mpesaReceiptNumber" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "subscriptionId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionPayment_pkey" PRIMARY KEY ("_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPayment_checkoutRequestId_key" ON "SubscriptionPayment"("checkoutRequestId");

-- AddForeignKey
ALTER TABLE "SubscriptionPayment" ADD CONSTRAINT "SubscriptionPayment_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("_id") ON DELETE SET NULL ON UPDATE CASCADE;

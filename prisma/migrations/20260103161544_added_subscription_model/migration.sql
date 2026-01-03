/*
  Warnings:

  - You are about to drop the column `mpesaPayoutNumber` on the `Business` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "PlanTier" AS ENUM ('STARTER', 'STANDARD', 'PREMIUM');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELED', 'TRIALING');

-- AlterTable
ALTER TABLE "Business" DROP COLUMN "mpesaPayoutNumber",
ADD COLUMN     "mpesaConsumerKey" TEXT,
ADD COLUMN     "mpesaConsumerSecret" TEXT,
ADD COLUMN     "mpesaPassKey" TEXT,
ADD COLUMN     "mpesaShortCode" TEXT;

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "businessId" UUID;

-- AlterTable
ALTER TABLE "MpesaPayment" ADD COLUMN     "subscriptionId" UUID;

-- CreateTable
CREATE TABLE "Subscription" (
    "_id" UUID NOT NULL,
    "businessId" UUID NOT NULL,
    "plan" "PlanTier" NOT NULL DEFAULT 'STARTER',
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "currentPeriodStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_businessId_key" ON "Subscription"("businessId");

-- AddForeignKey
ALTER TABLE "MpesaPayment" ADD CONSTRAINT "MpesaPayment_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "Business" ADD COLUMN     "isConfigured" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "storeId" UUID;

-- AlterTable
ALTER TABLE "UserInvitation" ADD COLUMN     "storeId" UUID;

-- CreateTable
CREATE TABLE "MpesaRouting" (
    "checkoutRequestId" TEXT NOT NULL,
    "businessId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MpesaRouting_pkey" PRIMARY KEY ("checkoutRequestId")
);

-- CreateIndex
CREATE INDEX "MpesaRouting_checkoutRequestId_idx" ON "MpesaRouting"("checkoutRequestId");

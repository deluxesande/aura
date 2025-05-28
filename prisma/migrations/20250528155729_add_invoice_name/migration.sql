-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "FailedCallback" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "invoiceName" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "ReferenceData" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "ReferenceItem" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Response" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "ResultResponse" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "SuccessfulCallback" (
    "id" SERIAL NOT NULL,
    "merchantRequestId" TEXT NOT NULL,
    "checkoutRequestId" TEXT NOT NULL,
    "resultCode" INTEGER NOT NULL,
    "resultDesc" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "mpesaReceiptNumber" TEXT NOT NULL,
    "transactionDate" BIGINT NOT NULL,
    "phoneNumber" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SuccessfulCallback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactFormMessage" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "message" TEXT NOT NULL,

    CONSTRAINT "ContactFormMessage_pkey" PRIMARY KEY ("id")
);

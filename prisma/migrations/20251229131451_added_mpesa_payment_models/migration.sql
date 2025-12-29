-- AlterTable
ALTER TABLE "Business" ADD COLUMN     "mpesaPayoutNumber" TEXT;

-- AlterTable
ALTER TABLE "FailedCallback" ADD COLUMN     "invoiceId" UUID;

-- AlterTable
ALTER TABLE "SuccessfulCallback" ADD COLUMN     "invoiceId" UUID;

-- CreateTable
CREATE TABLE "MpesaPayment" (
    "_id" UUID NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "accountReference" TEXT NOT NULL,
    "transactionDesc" TEXT,
    "merchantRequestId" TEXT NOT NULL,
    "checkoutRequestId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "invoiceId" UUID NOT NULL,
    "businessId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MpesaPayment_pkey" PRIMARY KEY ("_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MpesaPayment_checkoutRequestId_key" ON "MpesaPayment"("checkoutRequestId");

-- AddForeignKey
ALTER TABLE "MpesaPayment" ADD CONSTRAINT "MpesaPayment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MpesaPayment" ADD CONSTRAINT "MpesaPayment_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MpesaPayment" ADD CONSTRAINT "MpesaPayment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FailedCallback" ADD CONSTRAINT "FailedCallback_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuccessfulCallback" ADD CONSTRAINT "SuccessfulCallback_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("_id") ON DELETE SET NULL ON UPDATE CASCADE;

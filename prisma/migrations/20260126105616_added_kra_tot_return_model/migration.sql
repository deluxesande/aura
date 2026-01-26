-- CreateTable
CREATE TABLE "KraTotReturn" (
    "_id" UUID NOT NULL,
    "ackNumber" TEXT NOT NULL,
    "paymentSlip" TEXT NOT NULL,
    "computedTax" DOUBLE PRECISION NOT NULL,
    "taxPayable" DOUBLE PRECISION NOT NULL,
    "utilizedCredit" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "period" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "businessId" UUID NOT NULL,

    CONSTRAINT "KraTotReturn_pkey" PRIMARY KEY ("_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "KraTotReturn_ackNumber_key" ON "KraTotReturn"("ackNumber");

-- AddForeignKey
ALTER TABLE "KraTotReturn" ADD CONSTRAINT "KraTotReturn_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

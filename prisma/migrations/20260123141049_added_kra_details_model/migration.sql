/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Business` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Business" ADD COLUMN     "address" TEXT,
ADD COLUMN     "email" TEXT;

-- CreateTable
CREATE TABLE "KraDetails" (
    "id" TEXT NOT NULL,
    "kraPin" TEXT NOT NULL,
    "taxpayerType" TEXT NOT NULL,
    "taxpayerName" TEXT NOT NULL,
    "pinStatus" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "businessId" UUID,

    CONSTRAINT "KraDetails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "KraDetails_kraPin_key" ON "KraDetails"("kraPin");

-- CreateIndex
CREATE UNIQUE INDEX "KraDetails_businessId_key" ON "KraDetails"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "Business_email_key" ON "Business"("email");

-- AddForeignKey
ALTER TABLE "KraDetails" ADD CONSTRAINT "KraDetails_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("_id") ON DELETE SET NULL ON UPDATE CASCADE;

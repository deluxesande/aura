/*
  Warnings:

  - You are about to drop the column `createdBy` on the `Expense` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Delivery" ADD COLUMN     "purchaseOrderId" UUID;

-- AlterTable
ALTER TABLE "Expense" DROP COLUMN "createdBy",
ADD COLUMN     "createdById" UUID;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder"("_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "storeId" UUID;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("_id") ON DELETE SET NULL ON UPDATE CASCADE;

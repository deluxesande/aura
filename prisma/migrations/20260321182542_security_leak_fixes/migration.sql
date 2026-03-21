-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "businessId" UUID;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "businessId" UUID;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("_id") ON DELETE SET NULL ON UPDATE CASCADE;

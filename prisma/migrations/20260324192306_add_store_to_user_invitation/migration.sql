-- AlterTable
ALTER TABLE "UserInvitation" ADD COLUMN     "storeId" UUID;

-- AddForeignKey
ALTER TABLE "UserInvitation" ADD CONSTRAINT "UserInvitation_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("_id") ON DELETE SET NULL ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the column `ownerId` on the `Business` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[createdBy]` on the table `Business` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Business_ownerId_key";

-- AlterTable
ALTER TABLE "Business" DROP COLUMN "ownerId",
ADD COLUMN     "createdBy" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Business_createdBy_key" ON "Business"("createdBy");

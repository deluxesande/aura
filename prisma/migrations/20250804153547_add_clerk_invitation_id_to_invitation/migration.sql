/*
  Warnings:

  - A unique constraint covering the columns `[clerkInvitationId]` on the table `UserInvitation` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "UserInvitation" ADD COLUMN     "clerkInvitationId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "UserInvitation_clerkInvitationId_key" ON "UserInvitation"("clerkInvitationId");

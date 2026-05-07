-- CreateIndex
CREATE INDEX IF NOT EXISTS "SubscriptionPayment_subscriptionId_idx" ON "SubscriptionPayment"("subscriptionId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "User_businessId_idx" ON "User"("businessId");

-- CreateIndex IF NOT EXISTS
CREATE INDEX IF NOT EXISTS "UserInvitation_businessId_idx" ON "UserInvitation"("businessId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "UserInvitation_invitedBy_idx" ON "UserInvitation"("invitedBy");

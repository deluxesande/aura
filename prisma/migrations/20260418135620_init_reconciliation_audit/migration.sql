-- DropForeignKey
ALTER TABLE "Expense" DROP CONSTRAINT "Expense_createdById_fkey";

-- CreateTable
CREATE TABLE "AuditLog" (
    "_id" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "details" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" UUID NOT NULL,
    "businessId" UUID NOT NULL,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "InventoryReconciliation" (
    "_id" UUID NOT NULL,
    "reference" TEXT,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "businessId" UUID NOT NULL,
    "storeId" UUID NOT NULL,
    "userId" UUID NOT NULL,

    CONSTRAINT "InventoryReconciliation_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "ReconciliationItem" (
    "_id" UUID NOT NULL,
    "reconciliationId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "systemQuantity" INTEGER NOT NULL,
    "physicalQuantity" INTEGER NOT NULL,
    "discrepancy" INTEGER NOT NULL,

    CONSTRAINT "ReconciliationItem_pkey" PRIMARY KEY ("_id")
);

-- CreateIndex
CREATE INDEX "AuditLog_businessId_idx" ON "AuditLog"("businessId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "InventoryReconciliation_businessId_idx" ON "InventoryReconciliation"("businessId");

-- CreateIndex
CREATE INDEX "InventoryReconciliation_storeId_idx" ON "InventoryReconciliation"("storeId");

-- CreateIndex
CREATE INDEX "ReconciliationItem_reconciliationId_idx" ON "ReconciliationItem"("reconciliationId");

-- CreateIndex
CREATE INDEX "ReconciliationItem_productId_idx" ON "ReconciliationItem"("productId");

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryReconciliation" ADD CONSTRAINT "InventoryReconciliation_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryReconciliation" ADD CONSTRAINT "InventoryReconciliation_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryReconciliation" ADD CONSTRAINT "InventoryReconciliation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReconciliationItem" ADD CONSTRAINT "ReconciliationItem_reconciliationId_fkey" FOREIGN KEY ("reconciliationId") REFERENCES "InventoryReconciliation"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReconciliationItem" ADD CONSTRAINT "ReconciliationItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

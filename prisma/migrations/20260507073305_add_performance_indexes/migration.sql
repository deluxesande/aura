/*
  Warnings:

  - You are about to drop the `Business` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ContactFormMessage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MpesaRouting` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Subscription` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SubscriptionPayment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserInvitation` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('SIMPLE', 'TEMPLATE', 'VARIANT');

-- DropForeignKey
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_businessId_fkey";

-- DropForeignKey
ALTER TABLE "SubscriptionPayment" DROP CONSTRAINT "SubscriptionPayment_subscriptionId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_businessId_fkey";

-- DropForeignKey
ALTER TABLE "UserInvitation" DROP CONSTRAINT "UserInvitation_businessId_fkey";

-- DropForeignKey
ALTER TABLE "UserInvitation" DROP CONSTRAINT "UserInvitation_invitedBy_fkey";

-- DropTable
DROP TABLE "Business";

-- DropTable
DROP TABLE "ContactFormMessage";

-- DropTable
DROP TABLE "MpesaRouting";

-- DropTable
DROP TABLE "Subscription";

-- DropTable
DROP TABLE "SubscriptionPayment";

-- DropTable
DROP TABLE "User";

-- DropTable
DROP TABLE "UserInvitation";

-- DropEnum
DROP TYPE "PlanTier";

-- DropEnum
DROP TYPE "SubscriptionStatus";

-- DropEnum
DROP TYPE "TenantMode";

-- CreateTable
CREATE TABLE "TenantUser" (
    "id" UUID NOT NULL,
    "clerkId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "role" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "businessId" UUID NOT NULL,
    "storeId" UUID,

    CONSTRAINT "TenantUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MpesaPayment" (
    "_id" UUID NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "accountReference" TEXT NOT NULL,
    "transactionDesc" TEXT,
    "merchantRequestId" TEXT NOT NULL,
    "checkoutRequestId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "invoiceId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "businessId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MpesaPayment_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "Product" (
    "_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "sku" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "categoryId" UUID NOT NULL,
    "inStock" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT DEFAULT '/images/default-product.png',
    "createdBy" TEXT,
    "businessId" UUID,
    "type" "ProductType" NOT NULL DEFAULT 'SIMPLE',
    "parentId" UUID,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "Attribute" (
    "_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "businessId" UUID NOT NULL,

    CONSTRAINT "Attribute_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "AttributeOption" (
    "_id" UUID NOT NULL,
    "value" TEXT NOT NULL,
    "attributeId" UUID NOT NULL,

    CONSTRAINT "AttributeOption_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "ProductAttributeValue" (
    "_id" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "attributeOptionId" UUID NOT NULL,

    CONSTRAINT "ProductAttributeValue_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "Category" (
    "_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdBy" TEXT,
    "businessId" UUID,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "_id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "customerId" UUID,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "paymentType" TEXT NOT NULL DEFAULT 'CASH',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "stockRestored" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT,
    "invoiceName" TEXT NOT NULL DEFAULT '',
    "storeId" UUID,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "businessId" UUID,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "InvoiceItem" (
    "_id" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "productId" UUID NOT NULL,
    "invoiceId" UUID,
    "createdBy" TEXT,

    CONSTRAINT "InvoiceItem_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "_id" UUID NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "phoneNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "storeId" UUID,
    "createdById" UUID NOT NULL,
    "businessId" UUID NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "FailedCallback" (
    "id" SERIAL NOT NULL,
    "merchantRequestId" TEXT NOT NULL,
    "checkoutRequestId" TEXT NOT NULL,
    "resultCode" INTEGER NOT NULL,
    "resultDesc" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "invoiceId" UUID,

    CONSTRAINT "FailedCallback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SuccessfulCallback" (
    "id" SERIAL NOT NULL,
    "merchantRequestId" TEXT NOT NULL,
    "checkoutRequestId" TEXT NOT NULL,
    "resultCode" INTEGER NOT NULL,
    "resultDesc" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "mpesaReceiptNumber" TEXT NOT NULL,
    "transactionDate" BIGINT NOT NULL,
    "phoneNumber" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "invoiceId" UUID,

    CONSTRAINT "SuccessfulCallback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Store" (
    "_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "businessId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Store_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "Supplier" (
    "_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phoneNumber" TEXT,
    "address" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "businessId" UUID NOT NULL,
    "createdById" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "PurchaseOrder" (
    "_id" UUID NOT NULL,
    "reference" TEXT NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "supplierId" UUID NOT NULL,
    "businessId" UUID NOT NULL,
    "storeId" UUID,
    "createdById" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PurchaseOrder_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "PurchaseOrderItem" (
    "_id" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitCost" DOUBLE PRECISION NOT NULL,
    "productId" UUID NOT NULL,
    "purchaseOrderId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PurchaseOrderItem_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "StockReceipt" (
    "_id" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitCost" DOUBLE PRECISION NOT NULL,
    "totalCost" DOUBLE PRECISION NOT NULL,
    "reference" TEXT,
    "productId" UUID NOT NULL,
    "storeId" UUID NOT NULL,
    "supplierId" UUID,
    "businessId" UUID NOT NULL,
    "createdById" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deliveryId" UUID,

    CONSTRAINT "StockReceipt_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "StoreInventory" (
    "_id" UUID NOT NULL,
    "storeId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "StoreInventory_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "StockTransfer" (
    "_id" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "originStoreId" UUID NOT NULL,
    "destStoreId" UUID NOT NULL,
    "createdById" UUID NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockTransfer_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "Response" (
    "id" SERIAL NOT NULL,
    "merchantRequestId" TEXT NOT NULL,
    "checkoutRequestId" TEXT NOT NULL,
    "responseCode" TEXT NOT NULL,
    "responseDescription" TEXT NOT NULL,
    "customerMessage" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Response_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResultResponse" (
    "id" SERIAL NOT NULL,
    "resultType" INTEGER NOT NULL,
    "resultCode" INTEGER NOT NULL,
    "resultDesc" TEXT NOT NULL,
    "originatorConversationID" TEXT NOT NULL,
    "conversationID" TEXT NOT NULL,
    "transactionID" TEXT NOT NULL,
    "referenceDataId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResultResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReferenceData" (
    "id" SERIAL NOT NULL,
    "referenceItemId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReferenceData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReferenceItem" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReferenceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "businessId" UUID NOT NULL,
    "storeId" UUID,
    "createdById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "KraDetails" (
    "id" TEXT NOT NULL,
    "kraPin" TEXT NOT NULL,
    "taxpayerType" TEXT NOT NULL,
    "taxpayerName" TEXT NOT NULL,
    "pinStatus" TEXT NOT NULL,
    "isAutoFilingEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "businessId" UUID,

    CONSTRAINT "KraDetails_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "Delivery" (
    "_id" UUID NOT NULL,
    "reference" TEXT,
    "totalCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'RECEIVED',
    "supplierId" UUID,
    "storeId" UUID NOT NULL,
    "businessId" UUID NOT NULL,
    "createdById" UUID NOT NULL,
    "purchaseOrderId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Delivery_pkey" PRIMARY KEY ("_id")
);

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
    "userId" TEXT NOT NULL,
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
CREATE UNIQUE INDEX "TenantUser_clerkId_key" ON "TenantUser"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "TenantUser_email_key" ON "TenantUser"("email");

-- CreateIndex
CREATE INDEX "TenantUser_businessId_idx" ON "TenantUser"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "MpesaPayment_checkoutRequestId_key" ON "MpesaPayment"("checkoutRequestId");

-- CreateIndex
CREATE INDEX "MpesaPayment_invoiceId_idx" ON "MpesaPayment"("invoiceId");

-- CreateIndex
CREATE INDEX "MpesaPayment_businessId_idx" ON "MpesaPayment"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");

-- CreateIndex
CREATE INDEX "Product_businessId_idx" ON "Product"("businessId");

-- CreateIndex
CREATE INDEX "Product_businessId_sku_idx" ON "Product"("businessId", "sku");

-- CreateIndex
CREATE INDEX "Product_businessId_categoryId_idx" ON "Product"("businessId", "categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "Attribute_name_businessId_key" ON "Attribute"("name", "businessId");

-- CreateIndex
CREATE UNIQUE INDEX "AttributeOption_value_attributeId_key" ON "AttributeOption"("value", "attributeId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductAttributeValue_productId_attributeOptionId_key" ON "ProductAttributeValue"("productId", "attributeOptionId");

-- CreateIndex
CREATE INDEX "Category_businessId_idx" ON "Category"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_createdBy_key" ON "Category"("name", "createdBy");

-- CreateIndex
CREATE INDEX "Invoice_businessId_idx" ON "Invoice"("businessId");

-- CreateIndex
CREATE INDEX "Invoice_storeId_idx" ON "Invoice"("storeId");

-- CreateIndex
CREATE INDEX "InvoiceItem_invoiceId_idx" ON "InvoiceItem"("invoiceId");

-- CreateIndex
CREATE INDEX "InvoiceItem_productId_idx" ON "InvoiceItem"("productId");

-- CreateIndex
CREATE INDEX "Customer_businessId_idx" ON "Customer"("businessId");

-- CreateIndex
CREATE INDEX "Customer_storeId_idx" ON "Customer"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_businessId_email_key" ON "Customer"("businessId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_businessId_phoneNumber_key" ON "Customer"("businessId", "phoneNumber");

-- CreateIndex
CREATE INDEX "Store_businessId_idx" ON "Store"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "Store_name_businessId_key" ON "Store"("name", "businessId");

-- CreateIndex
CREATE INDEX "Supplier_businessId_idx" ON "Supplier"("businessId");

-- CreateIndex
CREATE INDEX "PurchaseOrder_businessId_idx" ON "PurchaseOrder"("businessId");

-- CreateIndex
CREATE INDEX "PurchaseOrder_supplierId_idx" ON "PurchaseOrder"("supplierId");

-- CreateIndex
CREATE INDEX "StockReceipt_businessId_idx" ON "StockReceipt"("businessId");

-- CreateIndex
CREATE INDEX "StockReceipt_storeId_idx" ON "StockReceipt"("storeId");

-- CreateIndex
CREATE INDEX "StockReceipt_productId_idx" ON "StockReceipt"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "StoreInventory_storeId_productId_key" ON "StoreInventory"("storeId", "productId");

-- CreateIndex
CREATE INDEX "Expense_businessId_idx" ON "Expense"("businessId");

-- CreateIndex
CREATE INDEX "Expense_storeId_idx" ON "Expense"("storeId");

-- CreateIndex
CREATE INDEX "Expense_status_idx" ON "Expense"("status");

-- CreateIndex
CREATE UNIQUE INDEX "KraDetails_kraPin_key" ON "KraDetails"("kraPin");

-- CreateIndex
CREATE UNIQUE INDEX "KraDetails_businessId_key" ON "KraDetails"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "KraTotReturn_ackNumber_key" ON "KraTotReturn"("ackNumber");

-- CreateIndex
CREATE INDEX "KraTotReturn_businessId_idx" ON "KraTotReturn"("businessId");

-- CreateIndex
CREATE INDEX "Delivery_businessId_idx" ON "Delivery"("businessId");

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
ALTER TABLE "TenantUser" ADD CONSTRAINT "TenantUser_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MpesaPayment" ADD CONSTRAINT "MpesaPayment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MpesaPayment" ADD CONSTRAINT "MpesaPayment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "TenantUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Product"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttributeOption" ADD CONSTRAINT "AttributeOption_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES "Attribute"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductAttributeValue" ADD CONSTRAINT "ProductAttributeValue_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductAttributeValue" ADD CONSTRAINT "ProductAttributeValue_attributeOptionId_fkey" FOREIGN KEY ("attributeOptionId") REFERENCES "AttributeOption"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "TenantUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FailedCallback" ADD CONSTRAINT "FailedCallback_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuccessfulCallback" ADD CONSTRAINT "SuccessfulCallback_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "TenantUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "TenantUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrderItem" ADD CONSTRAINT "PurchaseOrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrderItem" ADD CONSTRAINT "PurchaseOrderItem_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockReceipt" ADD CONSTRAINT "StockReceipt_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockReceipt" ADD CONSTRAINT "StockReceipt_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockReceipt" ADD CONSTRAINT "StockReceipt_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockReceipt" ADD CONSTRAINT "StockReceipt_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "TenantUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockReceipt" ADD CONSTRAINT "StockReceipt_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "Delivery"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreInventory" ADD CONSTRAINT "StoreInventory_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreInventory" ADD CONSTRAINT "StoreInventory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockTransfer" ADD CONSTRAINT "StockTransfer_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockTransfer" ADD CONSTRAINT "StockTransfer_originStoreId_fkey" FOREIGN KEY ("originStoreId") REFERENCES "Store"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockTransfer" ADD CONSTRAINT "StockTransfer_destStoreId_fkey" FOREIGN KEY ("destStoreId") REFERENCES "Store"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockTransfer" ADD CONSTRAINT "StockTransfer_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "TenantUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResultResponse" ADD CONSTRAINT "ResultResponse_referenceDataId_fkey" FOREIGN KEY ("referenceDataId") REFERENCES "ReferenceData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferenceData" ADD CONSTRAINT "ReferenceData_referenceItemId_fkey" FOREIGN KEY ("referenceItemId") REFERENCES "ReferenceItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "TenantUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "TenantUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder"("_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryReconciliation" ADD CONSTRAINT "InventoryReconciliation_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryReconciliation" ADD CONSTRAINT "InventoryReconciliation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "TenantUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReconciliationItem" ADD CONSTRAINT "ReconciliationItem_reconciliationId_fkey" FOREIGN KEY ("reconciliationId") REFERENCES "InventoryReconciliation"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReconciliationItem" ADD CONSTRAINT "ReconciliationItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

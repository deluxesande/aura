/*
  Warnings:

  - You are about to drop the column `storeId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `storeId` on the `UserInvitation` table. All the data in the column will be lost.
  - You are about to drop the `Attribute` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AttributeOption` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AuditLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Customer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Delivery` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Expense` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FailedCallback` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `InventoryReconciliation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Invoice` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `InvoiceItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `KraDetails` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `KraTotReturn` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MpesaPayment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Product` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProductAttributeValue` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PurchaseOrder` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PurchaseOrderItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ReconciliationItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ReferenceData` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ReferenceItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Response` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ResultResponse` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StockReceipt` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StockTransfer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Store` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StoreInventory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SuccessfulCallback` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Supplier` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "TenantMode" AS ENUM ('SHARED', 'BYODB');

-- DropForeignKey
ALTER TABLE "Attribute" DROP CONSTRAINT "Attribute_businessId_fkey";

-- DropForeignKey
ALTER TABLE "AttributeOption" DROP CONSTRAINT "AttributeOption_attributeId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_businessId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_userId_fkey";

-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_businessId_fkey";

-- DropForeignKey
ALTER TABLE "Customer" DROP CONSTRAINT "Customer_businessId_fkey";

-- DropForeignKey
ALTER TABLE "Customer" DROP CONSTRAINT "Customer_createdById_fkey";

-- DropForeignKey
ALTER TABLE "Customer" DROP CONSTRAINT "Customer_storeId_fkey";

-- DropForeignKey
ALTER TABLE "Delivery" DROP CONSTRAINT "Delivery_businessId_fkey";

-- DropForeignKey
ALTER TABLE "Delivery" DROP CONSTRAINT "Delivery_createdById_fkey";

-- DropForeignKey
ALTER TABLE "Delivery" DROP CONSTRAINT "Delivery_purchaseOrderId_fkey";

-- DropForeignKey
ALTER TABLE "Delivery" DROP CONSTRAINT "Delivery_storeId_fkey";

-- DropForeignKey
ALTER TABLE "Delivery" DROP CONSTRAINT "Delivery_supplierId_fkey";

-- DropForeignKey
ALTER TABLE "Expense" DROP CONSTRAINT "Expense_businessId_fkey";

-- DropForeignKey
ALTER TABLE "Expense" DROP CONSTRAINT "Expense_createdById_fkey";

-- DropForeignKey
ALTER TABLE "Expense" DROP CONSTRAINT "Expense_storeId_fkey";

-- DropForeignKey
ALTER TABLE "FailedCallback" DROP CONSTRAINT "FailedCallback_invoiceId_fkey";

-- DropForeignKey
ALTER TABLE "InventoryReconciliation" DROP CONSTRAINT "InventoryReconciliation_businessId_fkey";

-- DropForeignKey
ALTER TABLE "InventoryReconciliation" DROP CONSTRAINT "InventoryReconciliation_storeId_fkey";

-- DropForeignKey
ALTER TABLE "InventoryReconciliation" DROP CONSTRAINT "InventoryReconciliation_userId_fkey";

-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_businessId_fkey";

-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_customerId_fkey";

-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_storeId_fkey";

-- DropForeignKey
ALTER TABLE "InvoiceItem" DROP CONSTRAINT "InvoiceItem_invoiceId_fkey";

-- DropForeignKey
ALTER TABLE "InvoiceItem" DROP CONSTRAINT "InvoiceItem_productId_fkey";

-- DropForeignKey
ALTER TABLE "KraDetails" DROP CONSTRAINT "KraDetails_businessId_fkey";

-- DropForeignKey
ALTER TABLE "KraTotReturn" DROP CONSTRAINT "KraTotReturn_businessId_fkey";

-- DropForeignKey
ALTER TABLE "MpesaPayment" DROP CONSTRAINT "MpesaPayment_businessId_fkey";

-- DropForeignKey
ALTER TABLE "MpesaPayment" DROP CONSTRAINT "MpesaPayment_invoiceId_fkey";

-- DropForeignKey
ALTER TABLE "MpesaPayment" DROP CONSTRAINT "MpesaPayment_userId_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_businessId_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_parentId_fkey";

-- DropForeignKey
ALTER TABLE "ProductAttributeValue" DROP CONSTRAINT "ProductAttributeValue_attributeOptionId_fkey";

-- DropForeignKey
ALTER TABLE "ProductAttributeValue" DROP CONSTRAINT "ProductAttributeValue_productId_fkey";

-- DropForeignKey
ALTER TABLE "PurchaseOrder" DROP CONSTRAINT "PurchaseOrder_businessId_fkey";

-- DropForeignKey
ALTER TABLE "PurchaseOrder" DROP CONSTRAINT "PurchaseOrder_createdById_fkey";

-- DropForeignKey
ALTER TABLE "PurchaseOrder" DROP CONSTRAINT "PurchaseOrder_storeId_fkey";

-- DropForeignKey
ALTER TABLE "PurchaseOrder" DROP CONSTRAINT "PurchaseOrder_supplierId_fkey";

-- DropForeignKey
ALTER TABLE "PurchaseOrderItem" DROP CONSTRAINT "PurchaseOrderItem_productId_fkey";

-- DropForeignKey
ALTER TABLE "PurchaseOrderItem" DROP CONSTRAINT "PurchaseOrderItem_purchaseOrderId_fkey";

-- DropForeignKey
ALTER TABLE "ReconciliationItem" DROP CONSTRAINT "ReconciliationItem_productId_fkey";

-- DropForeignKey
ALTER TABLE "ReconciliationItem" DROP CONSTRAINT "ReconciliationItem_reconciliationId_fkey";

-- DropForeignKey
ALTER TABLE "ReferenceData" DROP CONSTRAINT "ReferenceData_referenceItemId_fkey";

-- DropForeignKey
ALTER TABLE "ResultResponse" DROP CONSTRAINT "ResultResponse_referenceDataId_fkey";

-- DropForeignKey
ALTER TABLE "StockReceipt" DROP CONSTRAINT "StockReceipt_businessId_fkey";

-- DropForeignKey
ALTER TABLE "StockReceipt" DROP CONSTRAINT "StockReceipt_createdById_fkey";

-- DropForeignKey
ALTER TABLE "StockReceipt" DROP CONSTRAINT "StockReceipt_deliveryId_fkey";

-- DropForeignKey
ALTER TABLE "StockReceipt" DROP CONSTRAINT "StockReceipt_productId_fkey";

-- DropForeignKey
ALTER TABLE "StockReceipt" DROP CONSTRAINT "StockReceipt_storeId_fkey";

-- DropForeignKey
ALTER TABLE "StockReceipt" DROP CONSTRAINT "StockReceipt_supplierId_fkey";

-- DropForeignKey
ALTER TABLE "StockTransfer" DROP CONSTRAINT "StockTransfer_createdById_fkey";

-- DropForeignKey
ALTER TABLE "StockTransfer" DROP CONSTRAINT "StockTransfer_destStoreId_fkey";

-- DropForeignKey
ALTER TABLE "StockTransfer" DROP CONSTRAINT "StockTransfer_originStoreId_fkey";

-- DropForeignKey
ALTER TABLE "StockTransfer" DROP CONSTRAINT "StockTransfer_productId_fkey";

-- DropForeignKey
ALTER TABLE "Store" DROP CONSTRAINT "Store_businessId_fkey";

-- DropForeignKey
ALTER TABLE "StoreInventory" DROP CONSTRAINT "StoreInventory_productId_fkey";

-- DropForeignKey
ALTER TABLE "StoreInventory" DROP CONSTRAINT "StoreInventory_storeId_fkey";

-- DropForeignKey
ALTER TABLE "SuccessfulCallback" DROP CONSTRAINT "SuccessfulCallback_invoiceId_fkey";

-- DropForeignKey
ALTER TABLE "Supplier" DROP CONSTRAINT "Supplier_businessId_fkey";

-- DropForeignKey
ALTER TABLE "Supplier" DROP CONSTRAINT "Supplier_createdById_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_storeId_fkey";

-- DropForeignKey
ALTER TABLE "UserInvitation" DROP CONSTRAINT "UserInvitation_storeId_fkey";

-- AlterTable
ALTER TABLE "Business" ADD COLUMN     "tenantDatabaseUrl" TEXT,
ADD COLUMN     "tenantMode" "TenantMode" NOT NULL DEFAULT 'SHARED';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "storeId";

-- AlterTable
ALTER TABLE "UserInvitation" DROP COLUMN "storeId";

-- DropTable
DROP TABLE "Attribute";

-- DropTable
DROP TABLE "AttributeOption";

-- DropTable
DROP TABLE "AuditLog";

-- DropTable
DROP TABLE "Category";

-- DropTable
DROP TABLE "Customer";

-- DropTable
DROP TABLE "Delivery";

-- DropTable
DROP TABLE "Expense";

-- DropTable
DROP TABLE "FailedCallback";

-- DropTable
DROP TABLE "InventoryReconciliation";

-- DropTable
DROP TABLE "Invoice";

-- DropTable
DROP TABLE "InvoiceItem";

-- DropTable
DROP TABLE "KraDetails";

-- DropTable
DROP TABLE "KraTotReturn";

-- DropTable
DROP TABLE "MpesaPayment";

-- DropTable
DROP TABLE "Product";

-- DropTable
DROP TABLE "ProductAttributeValue";

-- DropTable
DROP TABLE "PurchaseOrder";

-- DropTable
DROP TABLE "PurchaseOrderItem";

-- DropTable
DROP TABLE "ReconciliationItem";

-- DropTable
DROP TABLE "ReferenceData";

-- DropTable
DROP TABLE "ReferenceItem";

-- DropTable
DROP TABLE "Response";

-- DropTable
DROP TABLE "ResultResponse";

-- DropTable
DROP TABLE "StockReceipt";

-- DropTable
DROP TABLE "StockTransfer";

-- DropTable
DROP TABLE "Store";

-- DropTable
DROP TABLE "StoreInventory";

-- DropTable
DROP TABLE "SuccessfulCallback";

-- DropTable
DROP TABLE "Supplier";

-- DropEnum
DROP TYPE "ProductType";

-- AddForeignKey
ALTER TABLE "UserInvitation" ADD CONSTRAINT "UserInvitation_invitedBy_fkey" FOREIGN KEY ("invitedBy") REFERENCES "User"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

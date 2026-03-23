-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('SIMPLE', 'TEMPLATE', 'VARIANT');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "parentId" UUID,
ADD COLUMN     "type" "ProductType" NOT NULL DEFAULT 'SIMPLE';

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

-- CreateIndex
CREATE UNIQUE INDEX "Attribute_name_businessId_key" ON "Attribute"("name", "businessId");

-- CreateIndex
CREATE UNIQUE INDEX "AttributeOption_value_attributeId_key" ON "AttributeOption"("value", "attributeId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductAttributeValue_productId_attributeOptionId_key" ON "ProductAttributeValue"("productId", "attributeOptionId");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Product"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attribute" ADD CONSTRAINT "Attribute_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttributeOption" ADD CONSTRAINT "AttributeOption_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES "Attribute"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductAttributeValue" ADD CONSTRAINT "ProductAttributeValue_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductAttributeValue" ADD CONSTRAINT "ProductAttributeValue_attributeOptionId_fkey" FOREIGN KEY ("attributeOptionId") REFERENCES "AttributeOption"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

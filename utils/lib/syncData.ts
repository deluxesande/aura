import { PrismaClient as TenantPrismaClient } from "../../prisma/generated/tenant";

export async function syncBusinessData(sourceUrl: string, targetUrl: string, businessId: string) {
    console.log(`Starting data sync for business ${businessId}`);
    
    const sourceDb = new TenantPrismaClient({ datasources: { db: { url: sourceUrl } } });
    const targetDb = new TenantPrismaClient({ datasources: { db: { url: targetUrl } } });

    try {
        // 1. Stores
        const stores = await sourceDb.store.findMany({ where: { businessId } });
        const storeIds = stores.map(s => s.id);

        // Fetch products by businessId OR by being in the business's stores
        const storeInventories = await sourceDb.storeInventory.findMany({
            where: { storeId: { in: storeIds } },
            select: { productId: true }
        });
        const inventoryProductIds = storeInventories.map(si => si.productId);

        const products = await sourceDb.product.findMany({
            where: {
                OR: [
                    { businessId: businessId },
                    { id: { in: inventoryProductIds } }
                ]
            }
        });

        // 2. Categories
        const categoryIds = [...new Set(products.map(p => p.categoryId))];
        const categories = await sourceDb.category.findMany({
            where: {
                OR: [
                    { businessId: businessId },
                    { id: { in: categoryIds } }
                ]
            }
        });

        // Write independent entities first
        if (stores.length > 0) await targetDb.store.createMany({ data: stores, skipDuplicates: true });
        if (categories.length > 0) await targetDb.category.createMany({ data: categories, skipDuplicates: true });

        const customers = await sourceDb.customer.findMany({ where: { businessId } });
        if (customers.length > 0) await targetDb.customer.createMany({ data: customers, skipDuplicates: true });

        const suppliers = await sourceDb.supplier.findMany({ where: { businessId } });
        if (suppliers.length > 0) await targetDb.supplier.createMany({ data: suppliers, skipDuplicates: true });

        const attributes = await sourceDb.attribute.findMany({ where: { businessId } });
        if (attributes.length > 0) await targetDb.attribute.createMany({ data: attributes, skipDuplicates: true });

        const expenses = await sourceDb.expense.findMany({ where: { businessId } });
        if (expenses.length > 0) await targetDb.expense.createMany({ data: expenses, skipDuplicates: true });

        // 3. Products (Parents first, then variants)
        const parentProducts = products.filter(p => !p.parentId);
        const variantProducts = products.filter(p => p.parentId);

        if (parentProducts.length > 0) await targetDb.product.createMany({ data: parentProducts, skipDuplicates: true });
        if (variantProducts.length > 0) await targetDb.product.createMany({ data: variantProducts, skipDuplicates: true });

        // 4. Product Relations
        const productIds = products.map(p => p.id);
        
        const attrOptions = await sourceDb.attributeOption.findMany({
            where: { attribute: { businessId } }
        });
        if (attrOptions.length > 0) await targetDb.attributeOption.createMany({ data: attrOptions, skipDuplicates: true });

        const prodAttrValues = await sourceDb.productAttributeValue.findMany({
            where: { productId: { in: productIds } }
        });
        if (prodAttrValues.length > 0) await targetDb.productAttributeValue.createMany({ data: prodAttrValues, skipDuplicates: true });

        const fullStoreInventories = await sourceDb.storeInventory.findMany({
            where: { storeId: { in: storeIds } }
        });
        if (fullStoreInventories.length > 0) await targetDb.storeInventory.createMany({ data: fullStoreInventories, skipDuplicates: true });

        // 5. Operations
        const purchaseOrders = await sourceDb.purchaseOrder.findMany({ where: { businessId } });
        if (purchaseOrders.length > 0) await targetDb.purchaseOrder.createMany({ data: purchaseOrders, skipDuplicates: true });

        const poItems = await sourceDb.purchaseOrderItem.findMany({
            where: { purchaseOrderId: { in: purchaseOrders.map(po => po.id) } }
        });
        if (poItems.length > 0) await targetDb.purchaseOrderItem.createMany({ data: poItems, skipDuplicates: true });

        const deliveries = await sourceDb.delivery.findMany({ where: { businessId } });
        if (deliveries.length > 0) await targetDb.delivery.createMany({ data: deliveries, skipDuplicates: true });

        const stockReceipts = await sourceDb.stockReceipt.findMany({ where: { businessId } });
        if (stockReceipts.length > 0) await targetDb.stockReceipt.createMany({ data: stockReceipts, skipDuplicates: true });

        const stockTransfers = await sourceDb.stockTransfer.findMany({
            where: { originStoreId: { in: storeIds } }
        });
        if (stockTransfers.length > 0) await targetDb.stockTransfer.createMany({ data: stockTransfers, skipDuplicates: true });

        const reconciliations = await sourceDb.inventoryReconciliation.findMany({ where: { businessId } });
        if (reconciliations.length > 0) await targetDb.inventoryReconciliation.createMany({ data: reconciliations, skipDuplicates: true });

        const recItems = await sourceDb.reconciliationItem.findMany({
            where: { reconciliationId: { in: reconciliations.map(r => r.id) } }
        });
        if (recItems.length > 0) await targetDb.reconciliationItem.createMany({ data: recItems, skipDuplicates: true });

        // 6. Invoices & Payments
        const invoices = await sourceDb.invoice.findMany({
            where: {
                OR: [
                    { businessId: businessId },
                    { storeId: { in: storeIds } }
                ]
            }
        });
        if (invoices.length > 0) await targetDb.invoice.createMany({ data: invoices, skipDuplicates: true });

        const invoiceItems = await sourceDb.invoiceItem.findMany({
            where: { invoiceId: { in: invoices.map(i => i.id) } }
        });
        if (invoiceItems.length > 0) await targetDb.invoiceItem.createMany({ data: invoiceItems, skipDuplicates: true });

        const mpesaPayments = await sourceDb.mpesaPayment.findMany({ where: { businessId } });
        if (mpesaPayments.length > 0) await targetDb.mpesaPayment.createMany({ data: mpesaPayments, skipDuplicates: true });

        // 7. KRA & Audit
        const kraDetails = await sourceDb.kraDetails.findMany({ where: { businessId } });
        if (kraDetails.length > 0) await targetDb.kraDetails.createMany({ data: kraDetails, skipDuplicates: true });

        const kraReturns = await sourceDb.kraTotReturn.findMany({ where: { businessId } });
        if (kraReturns.length > 0) await targetDb.kraTotReturn.createMany({ data: kraReturns, skipDuplicates: true });

        const auditLogs = await sourceDb.auditLog.findMany({ where: { businessId } });
        if (auditLogs.length > 0) await targetDb.auditLog.createMany({ data: auditLogs, skipDuplicates: true });

        console.log(`Successfully synced business data for ${businessId}`);
    } catch (error) {
        console.error(`Error syncing business data for ${businessId}:`, error);
        throw error;
    } finally {
        await sourceDb.$disconnect();
        await targetDb.$disconnect();
    }
}

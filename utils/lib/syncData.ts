import { PrismaClient as TenantPrismaClient } from "../../prisma/generated/tenant";

export async function syncBusinessData(sourceUrl: string, targetUrl: string, businessId: string) {
    console.log(`Starting data sync for business ${businessId}`);
    
    const sourceDb = new TenantPrismaClient({ datasources: { db: { url: sourceUrl } } });
    const targetDb = new TenantPrismaClient({ datasources: { db: { url: targetUrl } } });

    try {
        // 1. Stores
        const stores = await sourceDb.store.findMany({ where: { businessId } });
        if (stores.length > 0) {
            await targetDb.store.createMany({ data: stores, skipDuplicates: true });
        }

        // 2. Users (TenantUser)
        // Some users might not have a direct businessId in TenantUser schema, 
        // but we can query them via masterPrisma if needed. 
        // Actually, we should just use syncAllBusinessUsersToTenant for users, but it only syncs from master.
        // It's better to rely on `syncAllBusinessUsersToTenant` separately, but let's sync Store relations here.
        // Wait, TenantUser doesn't have businessId! It's global to the tenant DB or tied by storeId. 
        // Let's skip TenantUser here as `syncAllBusinessUsersToTenant` handles it via MasterDB.

        // 3. Base Entities
        const categories = await sourceDb.category.findMany({ where: { businessId } });
        if (categories.length > 0) await targetDb.category.createMany({ data: categories, skipDuplicates: true });

        const customers = await sourceDb.customer.findMany({ where: { businessId } });
        if (customers.length > 0) await targetDb.customer.createMany({ data: customers, skipDuplicates: true });

        const suppliers = await sourceDb.supplier.findMany({ where: { businessId } });
        if (suppliers.length > 0) await targetDb.supplier.createMany({ data: suppliers, skipDuplicates: true });

        const attributes = await sourceDb.attribute.findMany({ where: { businessId } });
        if (attributes.length > 0) await targetDb.attribute.createMany({ data: attributes, skipDuplicates: true });

        const expenses = await sourceDb.expense.findMany({ where: { businessId } });
        if (expenses.length > 0) await targetDb.expense.createMany({ data: expenses, skipDuplicates: true });

        // 4. Products and Related
        const products = await sourceDb.product.findMany({ where: { businessId } });
        if (products.length > 0) await targetDb.product.createMany({ data: products, skipDuplicates: true });

        const attrOptions = await sourceDb.attributeOption.findMany({
            where: { attribute: { businessId } }
        });
        if (attrOptions.length > 0) await targetDb.attributeOption.createMany({ data: attrOptions, skipDuplicates: true });

        const prodAttrValues = await sourceDb.productAttributeValue.findMany({
            where: { product: { businessId } }
        });
        if (prodAttrValues.length > 0) await targetDb.productAttributeValue.createMany({ data: prodAttrValues, skipDuplicates: true });

        const storeInventories = await sourceDb.storeInventory.findMany({
            where: { Store: { businessId } }
        });
        if (storeInventories.length > 0) await targetDb.storeInventory.createMany({ data: storeInventories, skipDuplicates: true });

        // 5. Operations
        const purchaseOrders = await sourceDb.purchaseOrder.findMany({ where: { businessId } });
        if (purchaseOrders.length > 0) await targetDb.purchaseOrder.createMany({ data: purchaseOrders, skipDuplicates: true });

        const poItems = await sourceDb.purchaseOrderItem.findMany({
            where: { PurchaseOrder: { businessId } }
        });
        if (poItems.length > 0) await targetDb.purchaseOrderItem.createMany({ data: poItems, skipDuplicates: true });

        const deliveries = await sourceDb.delivery.findMany({ where: { businessId } });
        if (deliveries.length > 0) await targetDb.delivery.createMany({ data: deliveries, skipDuplicates: true });

        const stockReceipts = await sourceDb.stockReceipt.findMany({ where: { businessId } });
        if (stockReceipts.length > 0) await targetDb.stockReceipt.createMany({ data: stockReceipts, skipDuplicates: true });

        const stockTransfers = await sourceDb.stockTransfer.findMany({
            where: { OriginStore: { businessId } }
        });
        if (stockTransfers.length > 0) await targetDb.stockTransfer.createMany({ data: stockTransfers, skipDuplicates: true });

        const reconciliations = await sourceDb.inventoryReconciliation.findMany({ where: { businessId } });
        if (reconciliations.length > 0) await targetDb.inventoryReconciliation.createMany({ data: reconciliations, skipDuplicates: true });

        const recItems = await sourceDb.reconciliationItem.findMany({
            where: { Reconciliation: { businessId } }
        });
        if (recItems.length > 0) await targetDb.reconciliationItem.createMany({ data: recItems, skipDuplicates: true });

        // 6. Invoices & Payments
        const invoices = await sourceDb.invoice.findMany({ where: { businessId } });
        if (invoices.length > 0) await targetDb.invoice.createMany({ data: invoices, skipDuplicates: true });

        const invoiceItems = await sourceDb.invoiceItem.findMany({
            where: { Invoice: { businessId } }
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

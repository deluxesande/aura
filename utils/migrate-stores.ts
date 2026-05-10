
import { masterPrisma, getTenantPrisma } from './lib/prisma';

async function main() {
  console.log("Starting zero-downtime multi-store migration...");

  const businesses = await masterPrisma.business.findMany();

  for (const biz of businesses) {
    console.log(`Processing Business: ${biz.name}`);
    const tenantPrisma = await getTenantPrisma(biz.id);

    // 1. Check if 'Main Branch' already exists to make script idempotent
    let mainStore = await tenantPrisma.store.findFirst({
      where: { businessId: biz.id, name: "Main Branch" },
    });

    // 2. Create 'Main Branch' if it doesn't exist
    if (!mainStore) {
      mainStore = await tenantPrisma.store.create({
        data: {
          name: "Main Branch",
          businessId: biz.id,
        },
      });
      console.log(`  -> Created 'Main Branch' (ID: ${mainStore.id})`);
    }

    const products = await tenantPrisma.product.findMany({
        where: { businessId: biz.id }
    });

    // 3. Move Product Quantities to StoreInventory
    for (const prod of products) {
      await tenantPrisma.storeInventory.upsert({
        where: {
          storeId_productId: {
            storeId: mainStore.id,
            productId: prod.id,
          },
        },
        update: {}, // Don't overwrite if it already exists
        create: {
          storeId: mainStore.id,
          productId: prod.id,
          quantity: prod.quantity, // Inherit existing global quantity
          businessId: biz.id,
        },
      });
    }
    console.log(`  -> Migrated ${products.length} products to StoreInventory`);

    const users = await masterPrisma.user.findMany({
        where: { businessId: biz.id }
    });

    // 4. Link Staff/Managers to Main Branch (Admins remain null/global)
    const staffToUpdate = users.filter((u) => u.role !== "admin" && !u.storeId);
    if (staffToUpdate.length > 0) {
      await masterPrisma.user.updateMany({
        where: { id: { in: staffToUpdate.map((u) => u.id) } },
        data: { storeId: mainStore.id },
      });
      console.log(`  -> Linked ${staffToUpdate.length} staff members to Main Branch`);
    }

    const invoices = await tenantPrisma.invoice.findMany({
        where: { businessId: biz.id }
    });

    // 5. Link existing Invoices to Main Branch
    const invoicesToUpdate = invoices.filter((inv) => !inv.storeId);
    if (invoicesToUpdate.length > 0) {
      await tenantPrisma.invoice.updateMany({
        where: { id: { in: invoicesToUpdate.map((inv: any) => inv.id) } },
        data: { storeId: mainStore.id },
      });
      console.log(`  -> Linked ${invoicesToUpdate.length} invoices to Main Branch`);
    }
  }

  console.log("Migration completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

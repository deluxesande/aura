
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Starting zero-downtime multi-store migration...");

  const businesses = await prisma.business.findMany({
    include: { Product: true, users: true, invoices: true },
  });

  for (const biz of businesses) {
    console.log(`Processing Business: ${biz.name}`);

    // 1. Check if 'Main Branch' already exists to make script idempotent
    let mainStore = await prisma.store.findFirst({
      where: { businessId: biz.id, name: "Main Branch" },
    });

    // 2. Create 'Main Branch' if it doesn't exist
    if (!mainStore) {
      mainStore = await prisma.store.create({
        data: {
          name: "Main Branch",
          businessId: biz.id,
        },
      });
      console.log(`  -> Created 'Main Branch' (ID: ${mainStore.id})`);
    }

    // 3. Move Product Quantities to StoreInventory
    for (const prod of biz.Product) {
      await prisma.storeInventory.upsert({
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
        },
      });
    }
    console.log(`  -> Migrated ${biz.Product.length} products to StoreInventory`);

    // 4. Link Staff/Managers to Main Branch (Admins remain null/global)
    const staffToUpdate = biz.users.filter((u) => u.role !== "admin" && !u.storeId);
    if (staffToUpdate.length > 0) {
      await prisma.user.updateMany({
        where: { id: { in: staffToUpdate.map((u) => u.id) } },
        data: { storeId: mainStore.id },
      });
      console.log(`  -> Linked ${staffToUpdate.length} staff members to Main Branch`);
    }

    // 5. Link existing Invoices to Main Branch
    const invoicesToUpdate = biz.invoices.filter((inv) => !inv.storeId);
    if (invoicesToUpdate.length > 0) {
      await prisma.invoice.updateMany({
        where: { id: { in: invoicesToUpdate.map((inv) => inv.id) } },
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
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

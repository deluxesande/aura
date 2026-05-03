import { masterPrisma, getTenantPrisma } from './lib/prisma'

async function main() {
  const businessId = process.argv[2];
  if (!businessId) {
    console.error("Please provide a businessId as an argument");
    process.exit(1);
  }

  const tenantPrisma = await getTenantPrisma(businessId);

  const expenses = await tenantPrisma.expense.findMany({
    include: {
      Store: { select: { name: true } },
    }
  })

  // Manually fetch Business info from Master
  const business = await masterPrisma.business.findUnique({
    where: { id: businessId },
    select: { name: true }
  });

  const enrichedExpenses = expenses.map(expense => ({
    ...expense,
    Business: business
  }));

  console.log(JSON.stringify(enrichedExpenses, null, 2))
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    // Note: disconnectAll() could be used here if we wanted to be thorough
  })

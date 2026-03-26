import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const expenses = await prisma.expense.findMany({
    include: {
      Business: { select: { name: true } },
      Store: { select: { name: true } },
    }
  })
  console.log(JSON.stringify(expenses, null, 2))
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

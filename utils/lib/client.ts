import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        datasourceUrl: process.env.DATABASE_URL,
        log: ["warn", "error"],
    });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Increase max listeners to prevent warning
if (typeof process !== "undefined") {
    process.setMaxListeners(20);
}

// Add graceful shutdown
process.on("beforeExit", async () => {
    await prisma.$disconnect();
});

process.on("SIGINT", async () => {
    await prisma.$disconnect();
    process.exit(0);
});

process.on("SIGTERM", async () => {
    await prisma.$disconnect();
    process.exit(0);
});

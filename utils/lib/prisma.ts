import { PrismaClient as MasterPrismaClient } from "../../prisma/generated/master";
import { PrismaClient as TenantPrismaClient } from "../../prisma/generated/tenant";
import { decrypt } from "../crypto";

const globalForMaster = globalThis as unknown as {
    masterPrisma: MasterPrismaClient | undefined;
};

export const masterPrisma =
    globalForMaster.masterPrisma ??
    new MasterPrismaClient({
        datasourceUrl: process.env.DATABASE_URL,
        log: ["warn", "error"],
    });

if (process.env.NODE_ENV !== "production") globalForMaster.masterPrisma = masterPrisma;

// Cache for tenant clients to avoid re-instantiating on every request
const tenantClients: Record<string, TenantPrismaClient> = {};

/**
 * Dynamic factory to get the correct Tenant Prisma Client based on the Business ID.
 */
export async function getTenantPrisma(businessId: string): Promise<TenantPrismaClient> {
    if (tenantClients[businessId]) {
        return tenantClients[businessId];
    }

    // Lookup business routing in Master DB
    const business = await masterPrisma.business.findUnique({
        where: { id: businessId },
        select: { tenantMode: true, tenantDatabaseUrl: true }
    });

    if (!business) {
        throw new Error(`Business ${businessId} not found`);
    }

    let url = process.env.DATABASE_URL!; // Default to shared DB (SHARED mode)

    if (business.tenantMode === "BYODB" && business.tenantDatabaseUrl) {
        try {
            url = decrypt(business.tenantDatabaseUrl);
        } catch (error) {
            console.error(`Failed to decrypt database URL for business ${businessId}`, error);
            throw new Error("Invalid database configuration for business.");
        }
    }

    const client = new TenantPrismaClient({
        datasourceUrl: url,
        log: ["warn", "error"],
    });

    tenantClients[businessId] = client;
    return client;
}

/**
 * Graceful shutdown for all cached clients
 */
export async function disconnectAll() {
    await masterPrisma.$disconnect();
    for (const id in tenantClients) {
        await tenantClients[id].$disconnect();
        delete tenantClients[id];
    }
}

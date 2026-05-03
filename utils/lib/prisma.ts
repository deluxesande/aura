import { PrismaClient as MasterPrismaClient } from "../../prisma/generated/master";
import { PrismaClient as TenantPrismaClient } from "../../prisma/generated/tenant";
import { decrypt } from "../crypto";

const globalForMaster = globalThis as unknown as {
    masterPrisma: MasterPrismaClient | undefined;
};

export const masterPrisma =
    globalForMaster.masterPrisma ??
    new MasterPrismaClient({
        datasources: {
            db: {
                url: process.env.DATABASE_URL,
            },
        },
        log: ["warn", "error"],
    });

if (process.env.NODE_ENV !== "production") globalForMaster.masterPrisma = masterPrisma;

// Cache for tenant clients to avoid re-instantiating on every request
const tenantClients: Record<string, TenantPrismaClient> = {};

/**
 * Invalidate a cached tenant client (e.g. after onboarding or updating connection details).
 */
export function invalidateTenantClient(businessId: string) {
    if (tenantClients[businessId]) {
        tenantClients[businessId].$disconnect().catch(console.error);
        delete tenantClients[businessId];
    }
}

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
        select: { name: true, tenantMode: true, tenantDatabaseUrl: true }
    });

    if (!business) {
        throw new Error(`Business ${businessId} not found`);
    }

    let url = process.env.DATABASE_URL!; // Default to shared DB (SHARED mode)

    // If the business is still named "My New Business", force the shared DB to avoid
    // connection errors before they have successfully configured their custom database.
    if (business.name !== "My New Business" && business.tenantMode === "BYODB" && business.tenantDatabaseUrl) {
        try {
            url = decrypt(business.tenantDatabaseUrl);
        } catch (error) {
            console.error(`Failed to decrypt database URL for business ${businessId}`, error);
            throw new Error("Invalid database configuration for business.");
        }
    }

    const client = new TenantPrismaClient({
        datasources: {
            db: {
                url: url,
            },
        },
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

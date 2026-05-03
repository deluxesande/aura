import { PrismaClient as MasterPrismaClient } from "../../prisma/generated/master";
import { PrismaClient as TenantPrismaClient } from "../../prisma/generated/tenant";
import { decrypt } from "../crypto";
import { LRUCache } from "lru-cache";

const globalForMaster = globalThis as unknown as {
    masterPrisma: MasterPrismaClient | undefined;
    tenantClients: LRUCache<string, TenantPrismaClient> | undefined;
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

// Cache for tenant clients to avoid re-instantiating on every request
const tenantClients: LRUCache<string, TenantPrismaClient> = 
    globalForMaster.tenantClients ?? 
    new LRUCache<string, TenantPrismaClient>({
        max: 100,
        dispose: (client, id) => {
            client.$disconnect().catch(err =>
                console.error(`[db] Failed to disconnect tenant ${id}:`, err)
            );
        },
    });

if (process.env.NODE_ENV !== "production") {
    globalForMaster.masterPrisma = masterPrisma;
    globalForMaster.tenantClients = tenantClients;
}

const pendingClients = new Map<string, Promise<TenantPrismaClient>>();

function buildUrl(rawUrl: string, connectionLimit: number, poolTimeout = 10): string {
    const u = new URL(rawUrl);
    u.searchParams.set("connection_limit", String(connectionLimit));
    u.searchParams.set("pool_timeout", String(poolTimeout));
    return u.toString();
}

/**
 * Invalidate a cached tenant client (e.g. after onboarding or updating connection details).
 */
export function invalidateTenantClient(businessId: string) {
    tenantClients.delete(businessId); // LRU dispose handles $disconnect
    pendingClients.delete(businessId);
}

/**
 * Dynamic factory to get the correct Tenant Prisma Client based on the Business ID.
 */
export async function getTenantPrisma(businessId: string): Promise<TenantPrismaClient> {
    const cached = tenantClients.get(businessId);
    if (cached) return cached;

    const pending = pendingClients.get(businessId);
    if (pending) return pending;

    const promise = (async () => {
        // Lookup business routing in Master DB
        const business = await masterPrisma.business.findUnique({
            where: { id: businessId },
            select: { isConfigured: true, tenantMode: true, tenantDatabaseUrl: true }
        });

        if (!business) {
            throw new Error(`Business ${businessId} not found`);
        }

        let url: string;

        if (business.isConfigured && business.tenantMode === "BYODB" && business.tenantDatabaseUrl) {
            try {
                url = buildUrl(decrypt(business.tenantDatabaseUrl), 3);
            } catch (error) {
                console.error(`Failed to decrypt database URL for business ${businessId}`, error);
                throw new Error("Invalid database configuration for business.");
            }
        } else {
            // Default to shared DB (SHARED mode)
            url = buildUrl(process.env.DATABASE_URL!, 2);
        }

        const client = new TenantPrismaClient({
            datasources: {
                db: {
                    url: url,
                },
            },
            log: ["warn", "error"],
        });

        tenantClients.set(businessId, client);
        return client;
    })();

    pendingClients.set(businessId, promise);
    try {
        return await promise;
    } finally {
        pendingClients.delete(businessId);
    }
}

/**
 * Graceful shutdown for all cached clients
 */
export async function disconnectAll(): Promise<void> {
    await Promise.allSettled([...pendingClients.values()]);
    await masterPrisma.$disconnect();
    tenantClients.clear(); // dispose fires $disconnect on each
}

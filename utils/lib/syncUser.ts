import { masterPrisma, getTenantPrisma } from "./prisma";

/**
 * Synchronizes user data from the Control Plane (Master DB) to the Tenant Plane (Isolated DB).
 * This ensures that the Tenant DB has the necessary identity information for fast local joins
 * and data integrity (foreign keys).
 */
export async function syncUserToTenant(clerkId: string) {
    try {
        // 1. Fetch user profile from Master DB
        const masterUser = await masterPrisma.user.findUnique({
            where: { clerkId },
            include: { Business: true }
        });

        if (!masterUser || !masterUser.businessId) {
            console.log(`User sync skipped: User ${clerkId} not found or not associated with a business.`);
            return;
        }

        // 2. Obtain the correct Tenant Prisma client (Shared or BYODB)
        const tenantPrisma = await getTenantPrisma(masterUser.businessId);

        // 3. Sync to the Tenant DB
        await tenantPrisma.tenantUser.upsert({
            where: { clerkId: masterUser.clerkId },
            update: {
                email: masterUser.email,
                firstName: masterUser.firstName,
                lastName: masterUser.lastName,
                role: masterUser.role,
                status: masterUser.status,
                updatedAt: masterUser.updatedAt,
            },
            create: {
                id: masterUser.id,
                clerkId: masterUser.clerkId,
                email: masterUser.email,
                firstName: masterUser.firstName,
                lastName: masterUser.lastName,
                role: masterUser.role,
                status: masterUser.status,
                createdAt: masterUser.createdAt,
                updatedAt: masterUser.updatedAt,
            }
        });

        console.log(`Successfully synced user ${clerkId} to tenant DB for business ${masterUser.businessId}`);
    } catch (error) {
        console.error(`Failed to sync user ${clerkId} to tenant DB:`, error);
        // In a real enterprise app, you might queue this for retry
    }
}

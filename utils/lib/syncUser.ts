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
    }
}

/**
 * Synchronizes ALL users belonging to a business to its Tenant DB.
 * Crucial for BYODB onboarding to ensure foreign key constraints (createdById) don't fail.
 */
export async function syncAllBusinessUsersToTenant(businessId: string) {
    try {
        // 1. Fetch all users for this business from Master DB
        const users = await masterPrisma.user.findMany({
            where: { businessId }
        });

        if (users.length === 0) return;

        // 2. Obtain Tenant Prisma client
        const tenantPrisma = await getTenantPrisma(businessId);

        // 3. Sync users in a transaction to the Tenant DB
        // We use a transaction to ensure all users are synced or none (though failure of one shouldn't block others)
        // Upsert many isn't a single command in Prisma, so we do it in a loop inside a transaction
        await tenantPrisma.$transaction(
            users.map(user => 
                tenantPrisma.tenantUser.upsert({
                    where: { clerkId: user.clerkId },
                    update: {
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        role: user.role,
                        status: user.status,
                        updatedAt: user.updatedAt,
                    },
                    create: {
                        id: user.id,
                        clerkId: user.clerkId,
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        role: user.role,
                        status: user.status,
                        createdAt: user.createdAt,
                        updatedAt: user.updatedAt,
                    }
                })
            )
        );

        console.log(`Successfully synced all ${users.length} users to tenant DB for business ${businessId}`);
    } catch (error) {
        console.error(`Failed to sync all users for business ${businessId}:`, error);
    }
}

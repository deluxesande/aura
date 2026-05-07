import { masterPrisma, getTenantPrisma } from "./prisma";

/**
 * Synchronizes user data from the Control Plane (Master DB) to the Tenant Plane (Isolated DB).
 * This ensures that the Tenant DB has the necessary identity information for fast local joins
 * and data integrity (foreign keys).
 * 
 * HEALING LOGIC: If businessId or storeId are missing, it attempts to prefill them based on 
 * existing database records (activity logs or business defaults).
 */
export async function syncUserToTenant(clerkId: string) {
    try {
        // 1. Fetch user profile from Master DB
        let masterUser = await masterPrisma.user.findUnique({
            where: { clerkId },
        });

        if (!masterUser) {
            console.warn(`User sync failed: User ${clerkId} not found in Master DB.`);
            return;
        }

        // HEAL: If businessId is missing in Master, try to find it from invitations or activity
        if (!masterUser.businessId) {
            const invitation = await masterPrisma.userInvitation.findFirst({
                where: { email: masterUser.email },
                select: { businessId: true }
            });
            if (invitation) {
                masterUser = await masterPrisma.user.update({
                    where: { id: masterUser.id },
                    data: { businessId: invitation.businessId },
                });
                console.log(`Healed missing businessId for user ${clerkId} from invitation.`);
            }
        }

        if (!masterUser.businessId) {
            console.log(`User sync skipped: User ${clerkId} has no associated business.`);
            return;
        }

        const businessId = masterUser.businessId;
        const tenantPrisma = await getTenantPrisma(businessId);

        // HEAL: If storeId is missing, look for existing activity in the Tenant DB
        if (!masterUser.storeId) {
            // Check most recent invoice created by this user
            const lastInvoice = await tenantPrisma.invoice.findFirst({
                where: { createdBy: clerkId },
                orderBy: { createdAt: "desc" },
                select: { storeId: true }
            });

            let inferredStoreId = lastInvoice?.storeId;

            // Fallback: Check most recent customer created by this user
            if (!inferredStoreId) {
                const lastCustomer = await tenantPrisma.customer.findFirst({
                    where: { createdById: masterUser.id },
                    orderBy: { createdAt: "desc" },
                    select: { storeId: true }
                });
                inferredStoreId = lastCustomer?.storeId;
            }

            // Ultimate Fallback: Use the first active store in the business
            if (!inferredStoreId) {
                const firstStore = await tenantPrisma.store.findFirst({
                    where: { businessId, isActive: true },
                    select: { id: true }
                });
                inferredStoreId = firstStore?.id;
            }

            if (inferredStoreId) {
                masterUser = await masterPrisma.user.update({
                    where: { id: masterUser.id },
                    data: { storeId: inferredStoreId },
                });
                console.log(`Healed missing storeId for user ${clerkId} to ${inferredStoreId}.`);
            }
        }

        // 3. Sync to the Tenant DB
        await tenantPrisma.tenantUser.upsert({
            where: { clerkId: masterUser.clerkId },
            update: {
                email: masterUser.email,
                firstName: masterUser.firstName,
                lastName: masterUser.lastName,
                role: masterUser.role,
                status: masterUser.status,
                storeId: masterUser.storeId,
                updatedAt: masterUser.updatedAt,
                businessId: businessId,
            },
            create: {
                id: masterUser.id,
                clerkId: masterUser.clerkId,
                email: masterUser.email,
                firstName: masterUser.firstName,
                lastName: masterUser.lastName,
                role: masterUser.role,
                status: masterUser.status,
                storeId: masterUser.storeId,
                createdAt: masterUser.createdAt,
                updatedAt: masterUser.updatedAt,
                businessId: businessId,
            }
        });

        console.log(`Successfully synced user ${clerkId} to tenant DB.`);
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
                        storeId: user.storeId,
                        updatedAt: user.updatedAt,
                        businessId: businessId,
                    },
                    create: {
                        id: user.id,
                        clerkId: user.clerkId,
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        role: user.role,
                        status: user.status,
                        storeId: user.storeId,
                        createdAt: user.createdAt,
                        updatedAt: user.updatedAt,
                        businessId: businessId,
                    }
                })
            )
        );

        console.log(`Successfully synced all ${users.length} users to tenant DB for business ${businessId}`);
    } catch (error) {
        console.error(`Failed to sync all users for business ${businessId}:`, error);
    }
}

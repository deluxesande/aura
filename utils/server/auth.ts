import { masterPrisma, getTenantPrisma } from "@/utils/lib/prisma";

export async function verifyStoreAccess(businessId: string, storeId: string) {
    if (!storeId || storeId === "all" || storeId === "All") {
        return null;
    }

    const tenantPrisma = await getTenantPrisma(businessId);
    const store = await tenantPrisma.store.findFirst({
        where: { id: storeId, businessId: businessId },
        select: { id: true }
    });

    return store ? store.id : null;
}

export async function getUserAndBusiness(userId: string) {
    const user = await masterPrisma.user.findUnique({
        where: { clerkId: userId },
        select: { businessId: true, role: true, storeId: true, firstName: true, lastName: true }
    });

    if (!user || !user.businessId) return null;

    return user;
}

import { getTenantPrisma } from "@/utils/lib/prisma";

export async function logAction({
    action,
    entityType,
    entityId,
    details,
    userId,
    businessId,
    ipAddress,
    userAgent,
}: {
    action: string;
    entityType: string;
    entityId?: string;
    details?: any;
    userId: string;
    businessId: string;
    ipAddress?: string;
    userAgent?: string;
}) {
    try {
        const tenantPrisma = await getTenantPrisma(businessId);
        
        await tenantPrisma.auditLog.create({
            data: {
                action,
                entityType,
                entityId,
                details: details ? JSON.stringify(details) : null,
                userId,
                businessId, // Logical reference in tenant DB
                ipAddress,
                userAgent,
            },
        });
    } catch (error) {
        console.error("Failed to log audit action:", error);
    }
}

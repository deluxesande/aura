import { prisma } from "@/utils/lib/client";

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
        await prisma.auditLog.create({
            data: {
                action,
                entityType,
                entityId,
                details: details ? JSON.stringify(details) : null,
                userId,
                businessId,
                ipAddress,
                userAgent,
            },
        });
    } catch (error) {
        console.error("Failed to log audit action:", error);
    }
}

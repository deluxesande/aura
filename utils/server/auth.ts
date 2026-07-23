import { getAuth } from "@clerk/nextjs/server";
import type { NextApiRequest } from "next";
import { masterPrisma, getTenantPrisma } from "@/utils/lib/prisma";

type BusinessAccessResult =
    | { ok: true; userId: string }
    | { ok: false; status: number; error: string };

/**
 * Authorizes access to a business record. Returns 401 when unauthenticated and
 * 404 (never 403) when the caller is not entitled, to avoid ID enumeration.
 * `mode: "owner"` requires the caller to be the business creator/admin;
 * `mode: "member"` only requires the caller to belong to the business.
 */
export async function requireBusinessAccess(
    req: NextApiRequest,
    businessId: string,
    mode: "owner" | "member",
): Promise<BusinessAccessResult> {
    const { userId } = getAuth(req);
    if (!userId) {
        return { ok: false, status: 401, error: "Unauthorized" };
    }

    try {
        const business = await masterPrisma.business.findUnique({
            where: { id: businessId },
            select: { createdBy: true },
        });

        if (!business) {
            return { ok: false, status: 404, error: "Business not found" };
        }

        if (mode === "owner") {
            if (business.createdBy !== userId) {
                return { ok: false, status: 404, error: "Business not found" };
            }
        } else {
            const membership = await masterPrisma.user.findFirst({
                where: { clerkId: userId, businessId },
                select: { id: true },
            });
            if (!membership) {
                return { ok: false, status: 404, error: "Business not found" };
            }
        }

        return { ok: true, userId };
    } catch (error) {
        console.error("requireBusinessAccess DB error:", (error as Error)?.message);
        return { ok: false, status: 500, error: "Internal server error" };
    }
}

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

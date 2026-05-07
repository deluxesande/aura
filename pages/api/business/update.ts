import { getAuth } from "@clerk/nextjs/server";
import { NextApiRequest, NextApiResponse } from "next";
import { masterPrisma as prisma, invalidateTenantClient } from "@/utils/lib/prisma";
import { encrypt, decrypt } from "@/utils/crypto";
import { logAction } from "@/utils/server/audit";
import { syncAllBusinessUsersToTenant } from "@/utils/lib/syncUser";
import { syncBusinessData } from "@/utils/lib/syncData";
import { exec } from "child_process";
import util from "util";
import net from "net";
import { z } from "zod";

const execAsync = util.promisify(exec);

const updateBusinessSchema = z.object({
    name: z.string().optional(),
    email: z.string().email().optional().nullable(),
    phone: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    logo: z.string().url().optional().nullable(),
    mpesaConsumerKey: z.string().optional().nullable(),
    mpesaConsumerSecret: z.string().optional().nullable(),
    mpesaPassKey: z.string().optional().nullable(),
    mpesaShortCode: z.string().optional().nullable(),
    tenantMode: z.enum(["SHARED", "BYODB"]).optional(),
    tenantDatabaseUrl: z.string().optional().nullable(),
}).strict();

/**
 * Validates a database URL to prevent SSRF and other connection-based attacks.
 * Rejects non-postgres protocols and blocks loopback, private RFC-1918, and link-local ranges.
 */
function isSafeUrl(urlStr: string): boolean {
    if (!urlStr || typeof urlStr !== 'string') return false;
    try {
        const url = new URL(urlStr);
        // 1. Reject non-postgres protocols
        if (url.protocol !== "postgresql:" && url.protocol !== "postgres:") {
            return false;
        }

        const host = url.hostname;
        if (!host) return false;

        // net.isIP returns 4 for IPv4, 6 for IPv6, 0 for non-IP
        const ipVersion = net.isIP(host);

        // 2. Block loopback and "any" interface
        if (host === "localhost" || host === "0.0.0.0" || host === "::") {
            return false;
        }

        if (ipVersion === 4) {
            // Loopback 127.0.0.0/8
            if (host.startsWith("127.")) return false;
            // 3. Block private RFC-1918 ranges
            // 10.0.0.0/8
            if (host.startsWith("10.")) return false;
            // 172.16.0.0/12
            if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host)) return false;
            // 192.168.0.0/16
            if (host.startsWith("192.168.")) return false;
            // 4. Block link-local 169.254.0.0/16
            if (host.startsWith("169.254.")) return false;
        } else if (ipVersion === 6) {
            const lower = host.toLowerCase();
            // Loopback ::1
            if (lower === "::1") return false;
            // Unique Local Addresses (fc00::/7)
            if (lower.startsWith("fc") || lower.startsWith("fd")) return false;
            // Link-local (fe80::/10)
            if (lower.startsWith("fe8") || lower.startsWith("fe9") || lower.startsWith("fea") || lower.startsWith("feb")) return false;
        }

        return true;
    } catch {
        return false;
    }
}

export const updateBusiness = async (
    req: NextApiRequest,
    res: NextApiResponse,
) => {
    try {
        const user = getAuth(req);

        if (!user.userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // Validate request body
        const validation = updateBusinessSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ 
                error: "Invalid request body", 
                details: validation.error.format() 
            });
        }

        const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;

        const {
            name,
            email,
            phone,
            address,
            logo,
            mpesaConsumerKey,
            mpesaConsumerSecret,
            mpesaPassKey,
            mpesaShortCode,
            tenantMode,
            tenantDatabaseUrl,
        } = validation.data;

        if (!id) {
            return res
                .status(400)
                .json({ error: "Invalid or missing business ID" });
        }

        const existingBusiness = await prisma.business.findUnique({
            where: { id },
            select: { 
                id: true, 
                createdBy: true, 
                isConfigured: true, 
                tenantMode: true, 
                tenantDatabaseUrl: true,
                subscriptions: {
                    where: {
                        status: { in: ["ACTIVE", "PAST_DUE", "TRIALING"] },
                    },
                    orderBy: { createdAt: "desc" },
                    take: 1,
                }
            },
        });

        if (!existingBusiness) {
            return res.status(404).json({ error: "Business not found" });
        }

        if (existingBusiness.createdBy !== user.userId) {
            return res.status(403).json({
                error: "Forbidden: Only the business administrator can perform this action.",
            });
        }

        const activeSubscription = existingBusiness.subscriptions[0];
        const isPaidPlan = activeSubscription && (activeSubscription.plan === "STANDARD" || activeSubscription.plan === "PREMIUM");

        const currentUser = await prisma.user.findUnique({
            where: { clerkId: user.userId },
            select: { id: true }
        });

        const updateData: any = {
            name,
            logo,
            email: email || null,
            address: address || null,
        };

        const changedFields: string[] = [];
        if (name) changedFields.push("name");
        if (email) changedFields.push("email");
        if (address) changedFields.push("address");
        if (logo) changedFields.push("logo");

        let shouldSyncToByoDb = false;
        let shouldSyncToSharedDb = false;
        let oldByoDbUrl = "";

        // BYODB Logic with Security Fixes
        if (tenantMode === "BYODB" && tenantDatabaseUrl) {
            if (!isPaidPlan) {
                return res.status(403).json({ error: "BYODB configuration is only available on paid plans." });
            }

            // SSRF Protection
            if (!isSafeUrl(tenantDatabaseUrl)) {
                return res.status(400).json({ error: "Invalid or restricted database URL provided." });
            }

            console.log("Pushing schema to BYO database...");
            try {
                // Remove --accept-data-loss and add timeout
                await execAsync("npx prisma db push --schema=./prisma/schema.tenant.prisma", {
                    env: { ...process.env, DATABASE_URL: tenantDatabaseUrl },
                    timeout: 30000 // 30 second timeout
                });
                
                // If push succeeds, mark as configured and update URL
                updateData.tenantMode = "BYODB";
                updateData.isConfigured = true;
                updateData.tenantDatabaseUrl = encrypt(tenantDatabaseUrl);
                changedFields.push("tenantMode", "tenantDatabaseUrl", "isConfigured");

                // Only sync data if we are switching from SHARED
                if (existingBusiness.tenantMode !== "BYODB") {
                    shouldSyncToByoDb = true;
                }
            } catch (execError: any) {
                console.error("Failed to push schema:", execError);
                return res.status(500).json({ error: "Failed to initialize tables in BYO database. Ensure the database is accessible and permissions are correct." });
            }
        } else if (tenantMode === "SHARED" && existingBusiness.tenantMode === "BYODB") {
            updateData.tenantMode = "SHARED";
            updateData.tenantDatabaseUrl = null;
            updateData.isConfigured = false; // Reset to false for shared as it's the default plane
            changedFields.push("tenantMode", "tenantDatabaseUrl", "isConfigured");
            
            shouldSyncToSharedDb = true;
            if (existingBusiness.tenantDatabaseUrl) {
                oldByoDbUrl = decrypt(existingBusiness.tenantDatabaseUrl);
            }
        }

        if (mpesaConsumerKey !== undefined) {
            updateData.mpesaConsumerKey = mpesaConsumerKey
                ? encrypt(mpesaConsumerKey)
                : null;
            changedFields.push("mpesaConsumerKey");
        }
        if (mpesaConsumerSecret !== undefined) {
            updateData.mpesaConsumerSecret = mpesaConsumerSecret
                ? encrypt(mpesaConsumerSecret)
                : null;
            changedFields.push("mpesaConsumerSecret");
        }
        if (mpesaPassKey !== undefined) {
            updateData.mpesaPassKey = mpesaPassKey ? encrypt(mpesaPassKey) : null;
            changedFields.push("mpesaPassKey");
        }
        if (mpesaShortCode !== undefined) {
            updateData.mpesaShortCode = mpesaShortCode || null;
            changedFields.push("mpesaShortCode");
        }

        const updatedBusiness = await prisma.business.update({
            where: { id: id },
            data: updateData,
        });

        // Invalidate the cached tenant client so the next request uses the fresh database details
        invalidateTenantClient(id);

        // Perform Data Synchronization after the database routing cache is cleared
        try {
            if (shouldSyncToByoDb && tenantDatabaseUrl) {
                const sharedDbUrl = process.env.DATABASE_URL!;
                // Sync users FIRST to satisfy foreign key constraints (like createdById)
                await syncAllBusinessUsersToTenant(id); 
                // Then sync the rest of the business data
                await syncBusinessData(sharedDbUrl, tenantDatabaseUrl, id);
            } else if (shouldSyncToSharedDb && oldByoDbUrl) {
                const sharedDbUrl = process.env.DATABASE_URL!;
                // Sync users FIRST
                await syncAllBusinessUsersToTenant(id); 
                // Then sync the data
                await syncBusinessData(oldByoDbUrl, sharedDbUrl, id);
            }
        } catch (syncError) {
            console.error("Error during data synchronization between stores:", syncError);
            // Data is not lost, but maybe not fully synced. Don't block the UI, it can be retried.
        }

        // Log Audit Action
        if (currentUser) {
            await logAction({
                action: "UPDATE_BUSINESS_SETTINGS",
                entityType: "BUSINESS",
                entityId: id,
                details: { changedFields },
                userId: currentUser.id,
                businessId: id,
                ipAddress: req.headers["x-forwarded-for"] as string || req.socket.remoteAddress,
                userAgent: req.headers["user-agent"],
            });
        }

        const safeResponse = {
            ...updatedBusiness,
            mpesaConsumerKey: updatedBusiness.mpesaConsumerKey
                ? "********"
                : null,
            mpesaConsumerSecret: updatedBusiness.mpesaConsumerSecret
                ? "********"
                : null,
            mpesaPassKey: updatedBusiness.mpesaPassKey ? "********" : null,
            tenantDatabaseUrl: updatedBusiness.tenantDatabaseUrl ? "********" : null,
        };

        res.status(200).json(safeResponse);
    } catch (error: any) {
        console.log(error);
        if (error.code === "P2002" && error.meta?.target?.includes("email")) {
            return res.status(409).json({
                error: "This email is already in use by another business.",
            });
        }

        res.status(500).json({ error: "Failed to update business" });
    }
};

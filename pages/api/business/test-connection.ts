import { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import { PrismaClient } from "../../../prisma/generated/tenant";
import { exec } from "child_process";
import util from "util";
import { masterPrisma as prisma, invalidateTenantClient } from "@/utils/lib/prisma";
import { encrypt } from "@/utils/crypto";
import { syncAllBusinessUsersToTenant } from "@/utils/lib/syncUser";
import net from "net";

const execAsync = util.promisify(exec);

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

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        // Ownership Check
        const { userId } = getAuth(req);
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const { url } = req.body;
        let { businessId } = req.body;

        if (!url) {
            return res.status(400).json({ error: "Database URL is required" });
        }

        // Auto-fetch businessId if not provided (Fix for onboarding modal)
        if (!businessId) {
            const user = await prisma.user.findUnique({
                where: { clerkId: userId },
                select: { businessId: true }
            });
            businessId = user?.businessId;
        }

        if (!businessId) {
            return res.status(400).json({ error: "Business ID is required or could not be resolved." });
        }

        // SSRF Protection
        if (!isSafeUrl(url)) {
            return res.status(400).json({ error: "Invalid or restricted database URL provided." });
        }

        // Verify Ownership
        const business = await prisma.business.findUnique({
            where: { id: businessId },
            select: { id: true, createdBy: true, isConfigured: true },
        });

        if (!business) {
            return res.status(404).json({ error: "Business not found" });
        }

        if (business.createdBy !== userId) {
            return res.status(403).json({ error: "Forbidden: You do not own this business" });
        }

        // Idempotency Guard
        if (business.isConfigured) {
            return res.status(409).json({ error: "Business is already configured. Use the settings page to update connection details." });
        }

        // Persist URL before push
        await prisma.business.update({
            where: { id: businessId },
            data: { 
                tenantDatabaseUrl: encrypt(url),
                tenantMode: "BYODB"
            },
        });

        // Attempt to connect using the tenant Prisma client
        const tempClient = new PrismaClient({
            datasources: {
                db: {
                    url: url,
                },
            },
        });

        try {
            // Guarantee disconnection
            await tempClient.$connect();
            
            // Push the tenant schema to their BYO database to create the necessary tables
            console.log("Connection successful. Pushing tenant schema to BYO database...");
            try {
                // Remove --accept-data-loss and Add timeout
                const { stdout, stderr } = await execAsync("npx prisma db push --schema=./prisma/schema.tenant.prisma", {
                    env: { ...process.env, DATABASE_URL: url },
                    timeout: 30000 // 30 second timeout
                });
                console.log("Schema push output:", stdout);
                if (stderr) console.error("Schema push stderr:", stderr);

                // Mark as configured and invalidate cache
                await prisma.business.update({
                    where: { id: businessId },
                    data: { isConfigured: true },
                });

                // Sync all users to the new database to fix foreign key constraints
                await syncAllBusinessUsersToTenant(businessId);
                
                invalidateTenantClient(businessId);

            } catch (execError: any) {
                console.error("Failed to push schema:", execError);
                return res.status(500).json({
                    success: false,
                    error: "Connected to database, but failed to initialize tables. Check permissions."
                });
            }

            return res.status(200).json({ success: true, message: "Connection successful and tables initialized." });
        } catch (dbError: any) {
            console.error("DB Connection Test Failed:", dbError);
            return res.status(400).json({ 
                success: false, 
                error: "Failed to connect to the provided database. Please check the URL and ensure it's accessible." 
            });
        } finally {
            // Guarantee disconnection
            await tempClient.$disconnect();
        }
    } catch (error) {
        console.error("Test Connection Error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

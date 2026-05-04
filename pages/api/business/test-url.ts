import { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import { PrismaClient } from "../../../prisma/generated/tenant";
import net from "net";

/**
 * Validates a database URL to prevent SSRF and other connection-based attacks.
 */
function isSafeUrl(urlStr: string): boolean {
    if (!urlStr || typeof urlStr !== 'string') return false;
    try {
        const url = new URL(urlStr);
        if (url.protocol !== "postgresql:" && url.protocol !== "postgres:") {
            return false;
        }
        const host = url.hostname;
        if (!host) return false;
        const ipVersion = net.isIP(host);
        if (host === "localhost" || host === "0.0.0.0" || host === "::") {
            return false;
        }
        if (ipVersion === 4) {
            if (host.startsWith("127.")) return false;
            if (host.startsWith("10.")) return false;
            if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host)) return false;
            if (host.startsWith("192.168.")) return false;
            if (host.startsWith("169.254.")) return false;
        } else if (ipVersion === 6) {
            const lower = host.toLowerCase();
            if (lower === "::1") return false;
            if (lower.startsWith("fc") || lower.startsWith("fd")) return false;
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
        const { userId } = getAuth(req);
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const { url } = req.body;
        if (!url) return res.status(400).json({ error: "Database URL is required" });

        if (!isSafeUrl(url)) {
            return res.status(400).json({ error: "Invalid or restricted database URL provided." });
        }

        const tempClient = new PrismaClient({
            datasources: { db: { url: url } },
        });

        try {
            await tempClient.$connect();
            return res.status(200).json({ success: true, message: "Connection successful." });
        } catch (dbError: any) {
            return res.status(400).json({ 
                success: false, 
                error: "Failed to connect to the provided database. Please check the URL and ensure it's accessible." 
            });
        } finally {
            await tempClient.$disconnect();
        }
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
}

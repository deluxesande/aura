import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/utils/lib/client";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    const { userId: clerkId } = getAuth(req);
    if (!clerkId) return res.status(401).json({ error: "Unauthorized" });

    const user = await prisma.user.findUnique({
        where: { clerkId },
        select: { id: true, businessId: true, role: true },
    });

    if (!user || !user.businessId || user.role !== "admin") {
        return res.status(403).json({ error: "Access denied. Admins only." });
    }

    if (req.method === "GET") {
        try {
            const logs = await prisma.auditLog.findMany({
                where: { businessId: user.businessId },
                orderBy: { createdAt: "desc" },
                take: 100, // Limit to last 100 logs
                include: {
                    User: {
                        select: {
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                },
            });
            return res.status(200).json(logs);
        } catch (error) {
            console.error("GET_AUDIT_LOGS_ERROR", error);
            return res.status(500).json({ error: "Failed to fetch audit logs" });
        }
    }

    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
}

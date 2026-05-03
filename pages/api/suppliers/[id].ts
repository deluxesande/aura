import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import { masterPrisma, getTenantPrisma } from "@/utils/lib/prisma";
import { logAction } from "@/utils/server/audit";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { userId: clerkId } = getAuth(req);
    const { id } = req.query;
    if (!clerkId || typeof id !== "string") return res.status(401).json({ error: "Unauthorized" });

    // 1. Fetch User and Business context from Master DB
    const user = await masterPrisma.user.findUnique({
        where: { clerkId },
        select: { id: true, businessId: true },
    });

    if (!user || !user.businessId) return res.status(403).json({ error: "Forbidden" });

    const businessId = user.businessId;
    const tenantPrisma = await getTenantPrisma(businessId);

    switch (req.method) {
        case "GET":
            try {
                const supplier = await tenantPrisma.supplier.findUnique({
                    where: { id: id as string, businessId: businessId },
                    include: {
                        deliveries: {
                            where: { status: "RECEIVED" },
                            include: {
                                Store: { select: { name: true } },
                                receipts: {
                                    include: {
                                        Product: { select: { name: true, sku: true } }
                                    }
                                }
                            },
                            orderBy: { createdAt: "desc" }
                        }
                    }
                });
                if (!supplier) return res.status(404).json({ error: "Supplier not found" });
                return res.status(200).json(supplier);
            } catch (error) {
                console.error("GET_SUPPLIER_DETAILS_ERROR", error);
                return res.status(500).json({ error: "Fetch failed" });
            }
        case "PATCH":
            try {
                const updated = await tenantPrisma.supplier.update({
                    where: { id, businessId: businessId },
                    data: req.body,
                });

                // Log Audit Action
                await logAction({
                    action: "UPDATE_SUPPLIER",
                    entityType: "SUPPLIER",
                    entityId: id,
                    details: { name: updated.name, email: updated.email },
                    userId: user.id,
                    businessId: businessId,
                    ipAddress: req.headers["x-forwarded-for"] as string || req.socket.remoteAddress,
                    userAgent: req.headers["user-agent"],
                });

                return res.status(200).json(updated);
            } catch (error) {
                return res.status(500).json({ error: "Update failed" });
            }
        case "DELETE":
            try {
                const deleted = await tenantPrisma.supplier.update({
                    where: { id, businessId: businessId },
                    data: { isDeleted: true },
                });

                // Log Audit Action
                await logAction({
                    action: "DELETE_SUPPLIER",
                    entityType: "SUPPLIER",
                    entityId: id,
                    details: { name: deleted.name },
                    userId: user.id,
                    businessId: businessId,
                    ipAddress: req.headers["x-forwarded-for"] as string || req.socket.remoteAddress,
                    userAgent: req.headers["user-agent"],
                });

                return res.status(200).json({ message: "Soft deleted" });
            } catch (error) {
                return res.status(500).json({ error: "Delete failed" });
            }
        default:
            res.setHeader("Allow", ["GET", "PATCH", "DELETE"]);
            return res.status(405).end();
    }
}


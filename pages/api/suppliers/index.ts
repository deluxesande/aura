import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/utils/lib/client";
import { logAction } from "@/utils/server/audit";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { userId: clerkId } = getAuth(req);
    if (!clerkId) return res.status(401).json({ error: "Unauthorized" });

    const user = await prisma.user.findUnique({
        where: { clerkId },
        select: { id: true, businessId: true, role: true },
    });

    if (!user || !user.businessId) return res.status(403).json({ error: "Business profile not found" });
    const { businessId, id: userId } = user;

    switch (req.method) {
        case "GET":
            try {
                const suppliers = await prisma.supplier.findMany({
                    where: { businessId, isDeleted: false },
                    include: {
                        CreatedBy: { 
                            select: { 
                                clerkId: true,
                                firstName: true, 
                                lastName: true, 
                                role: true 
                            } 
                        }
                    },
                    orderBy: { createdAt: "desc" },
                });

                // Fetch image from Clerk
                const clerk = await clerkClient();
                const clerkIds = Array.from(new Set(suppliers.map(s => s.CreatedBy.clerkId)));
                const clerkUsersResults = await Promise.allSettled(clerkIds.map(id => clerk.users.getUser(id)));
                
                const clerkMap = new Map();
                clerkUsersResults.forEach(res => {
                    if (res.status === "fulfilled") clerkMap.set(res.value.id, res.value.imageUrl);
                });

                const result = suppliers.map(s => ({
                    ...s,
                    CreatedBy: {
                        firstName: s.CreatedBy.firstName,
                        lastName: s.CreatedBy.lastName,
                        role: s.CreatedBy.role,
                        imageUrl: clerkMap.get(s.CreatedBy.clerkId) || null
                    }
                }));

                return res.status(200).json(result);
            } catch (error) {
                console.error("GET_SUPPLIERS_ERROR", error);
                return res.status(500).json({ error: "Fetch failed" });
            }

        case "POST":
            try {
                const { name, email, phoneNumber, address } = req.body;
                if (!name) return res.status(400).json({ error: "Name is required" });

                const supplier = await prisma.supplier.create({
                    data: { name, email, phoneNumber, address, businessId, createdById: userId },
                });

                // Log Audit Action
                await logAction({
                    action: "CREATE_SUPPLIER",
                    entityType: "SUPPLIER",
                    entityId: supplier.id,
                    details: { name: supplier.name, email: supplier.email },
                    userId: user.id,
                    businessId: user.businessId,
                    ipAddress: req.headers["x-forwarded-for"] as string || req.socket.remoteAddress,
                    userAgent: req.headers["user-agent"],
                });

                return res.status(201).json(supplier);
            } catch (error) {
                console.error("POST_SUPPLIER_ERROR", error);
                return res.status(500).json({ error: "Creation failed" });
            }

        default:
            res.setHeader("Allow", ["GET", "POST"]);
            return res.status(405).end();
    }
}


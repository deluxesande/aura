import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/utils/lib/client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { userId: clerkId } = getAuth(req);
    if (!clerkId) return res.status(401).json({ error: "Unauthorized" });

    const user = await prisma.user.findUnique({
        where: { clerkId },
        select: { id: true, businessId: true, role: true },
    });

    if (!user || !user.businessId) return res.status(403).json({ error: "Business profile not found" });
    const { businessId } = user;

    switch (req.method) {
        case "GET":
            try {
                const suppliers = await prisma.supplier.findMany({
                    where: { businessId, isDeleted: false },
                    orderBy: { createdAt: "desc" },
                });

                // Fetch creator details from Clerk
                const creatorIds = Array.from(new Set(suppliers.map(s => s.createdBy).filter(Boolean))) as string[];
                const clerk = await clerkClient();
                const clerkUsersResults = await Promise.allSettled(creatorIds.map(id => clerk.users.getUser(id)));
                
                const usersMap = new Map();
                clerkUsersResults.forEach((res) => {
                    if (res.status === "fulfilled") {
                        usersMap.set(res.value.id, {
                            firstName: res.value.firstName,
                            lastName: res.value.lastName,
                            imageUrl: res.value.imageUrl,
                        });
                    }
                });

                const result = suppliers.map(s => ({
                    ...s,
                    creator: s.createdBy ? usersMap.get(s.createdBy) : null
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
                    data: { name, email, phoneNumber, address, businessId, createdBy: clerkId },
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

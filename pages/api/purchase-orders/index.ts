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

    if (!user || !user.businessId) return res.status(403).json({ error: "Forbidden" });
    const { businessId } = user;

    switch (req.method) {
        case "GET":
            try {
                const pos = await prisma.purchaseOrder.findMany({
                    where: { businessId, isDeleted: false },
                    include: {
                        Supplier: { select: { name: true } },
                        items: { include: { Product: { select: { name: true, sku: true } } } },
                    },
                    orderBy: { createdAt: "desc" },
                });

                const creatorIds = Array.from(new Set(pos.map(po => po.createdBy).filter(Boolean))) as string[];
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

                const result = pos.map(po => ({
                    ...po,
                    creator: po.createdBy ? usersMap.get(po.createdBy) : null
                }));

                return res.status(200).json(result);
            } catch (error) {
                console.error("GET_PO_ERROR", error);
                return res.status(500).json({ error: "Fetch failed" });
            }

        case "POST":
            try {
                const { supplierId, reference, totalAmount, status, items } = req.body;
                if (!supplierId || !reference || !items) return res.status(400).json({ error: "Missing required fields" });

                const po = await prisma.purchaseOrder.create({
                    data: {
                        supplierId,
                        reference,
                        totalAmount: parseFloat(totalAmount),
                        status: status || "PENDING",
                        businessId,
                        createdBy: clerkId,
                        items: {
                            create: items.map((i: any) => ({
                                productId: i.productId,
                                quantity: parseInt(i.quantity),
                                unitCost: parseFloat(i.unitCost),
                            })),
                        },
                    },
                    include: { items: true },
                });
                return res.status(201).json(po);
            } catch (error) {
                console.error("POST_PO_ERROR", error);
                return res.status(500).json({ error: "Creation failed" });
            }
        default:
            res.setHeader("Allow", ["GET", "POST"]);
            return res.status(405).end();
    }
}

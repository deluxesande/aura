import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/utils/lib/client";
import { notifyBusinessStaff } from "@/utils/server/novu";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    const { userId: clerkId } = getAuth(req);
    if (!clerkId) return res.status(401).json({ error: "Unauthorized" });

    const user = await prisma.user.findUnique({
        where: { clerkId },
        select: { id: true, businessId: true, firstName: true, lastName: true },
    });

    if (!user || !user.businessId)
        return res.status(403).json({ error: "Forbidden" });
    const { businessId, id: userId } = user;

    switch (req.method) {
        case "GET":
            try {
                const pos = await prisma.purchaseOrder.findMany({
                    where: { businessId, isDeleted: false },
                    include: {
                        Supplier: { select: { name: true } },
                        Store: { select: { name: true } },
                        items: {
                            include: {
                                Product: { select: { name: true, sku: true } },
                            },
                        },
                        CreatedBy: {
                            select: {
                                clerkId: true,
                                firstName: true,
                                lastName: true,
                                role: true,
                            },
                        },
                    },
                    orderBy: { createdAt: "desc" },
                });

                const clerk = await clerkClient();
                const clerkIds = Array.from(
                    new Set(pos.map((p) => p.CreatedBy.clerkId)),
                );
                const clerkUsersResults = await Promise.allSettled(
                    clerkIds.map((id) => clerk.users.getUser(id)),
                );

                const clerkMap = new Map();
                clerkUsersResults.forEach((res) => {
                    if (res.status === "fulfilled")
                        clerkMap.set(res.value.id, res.value.imageUrl);
                });

                const result = pos.map((p) => ({
                    ...p,
                    CreatedBy: {
                        firstName: p.CreatedBy.firstName,
                        lastName: p.CreatedBy.lastName,
                        role: p.CreatedBy.role,
                        imageUrl: clerkMap.get(p.CreatedBy.clerkId) || null,
                    },
                }));

                return res.status(200).json(result);
            } catch (error) {
                console.error("GET_PO_ERROR", error);
                return res.status(500).json({ error: "Fetch failed" });
            }

        case "POST":
            try {
                const { supplierId, storeId, reference, totalAmount, status, items } =
                    req.body;
                if (!supplierId || !reference || !items)
                    return res
                        .status(400)
                        .json({ error: "Missing required fields" });

                const po = await prisma.purchaseOrder.create({
                    data: {
                        supplierId,
                        storeId: storeId || null,
                        reference,
                        totalAmount: parseFloat(totalAmount),
                        status: status || "PENDING",
                        businessId,
                        createdById: userId,
                        items: {
                            create: items.map((i: any) => ({
                                productId: i.productId,
                                quantity: parseInt(i.quantity),
                                unitCost: parseFloat(i.unitCost),
                            })),
                        },
                    },
                    include: {
                        items: true,
                        Supplier: { select: { name: true } },
                    },
                });

                // NOTIFY
                await notifyBusinessStaff({
                    businessId,
                    workflowId: "supplier-order-created",
                    payload: {
                        reference: po.reference,
                        supplierName: po.Supplier.name,
                        totalAmount: String(po.totalAmount),
                        itemCount: String(po.items.length),
                    },
                    includeCreatorId: clerkId,
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

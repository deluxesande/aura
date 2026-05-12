import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth, clerkClient } from "@clerk/nextjs/server";
import { masterPrisma, getTenantPrisma } from "@/utils/lib/prisma";
import { verifyStoreAccess } from "@/utils/server/auth";

export const getInvoices = async (
    req: NextApiRequest,
    res: NextApiResponse,
) => {
    try {
        const { userId } = getAuth(req);

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // 1. Get current user from Master DB
        const user = await masterPrisma.user.findUnique({
            where: { clerkId: userId },
            select: { businessId: true, role: true },
        });

        if (!user || !user.businessId) {
            return res
                .status(200)
                .json({ data: [], total: 0, page: 1, totalPages: 0 });
        }

        const tenantPrisma = await getTenantPrisma(user.businessId);
        const activeStoreHeader = req.headers["x-store-id"] as string;

        // 2. EARLY PARALLELIZATION: Fetch routing rules AND business users simultaneously
        const [tenantUser, firstStore, businessUsers] = await Promise.all([
            user.role !== "admin"
                ? tenantPrisma.tenantUser.findUnique({
                      where: { clerkId: userId },
                      select: { storeId: true },
                  })
                : Promise.resolve(null),
            user.role === "admin" && !activeStoreHeader
                ? tenantPrisma.store.findFirst({
                      where: { businessId: user.businessId, isActive: true },
                      select: { id: true },
                  })
                : Promise.resolve(null),
            masterPrisma.user.findMany({
                where: { businessId: user.businessId },
                select: {
                    clerkId: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                },
            }),
        ]);

        let targetStoreId = activeStoreHeader;
        if (tenantUser?.storeId) targetStoreId = tenantUser.storeId;

        if (targetStoreId) {
            const validatedStoreId = await verifyStoreAccess(
                user.businessId,
                targetStoreId,
            );
            if (
                !validatedStoreId &&
                targetStoreId !== "all" &&
                targetStoreId !== "All"
            ) {
                return res
                    .status(403)
                    .json({ error: "Unauthorized store access" });
            }
            targetStoreId = validatedStoreId || targetStoreId;
        }

        // Fallback for admins
        if (!targetStoreId && firstStore) {
            targetStoreId = firstStore.id;
        }

        if (!targetStoreId) {
            return res
                .status(200)
                .json({ data: [], total: 0, page: 1, totalPages: 0 });
        }

        const isAllStores = targetStoreId === "all" || targetStoreId === "All";
        const userIds = businessUsers.map((u) => u.clerkId);

        const page = parseInt(req.query.page as string) || 1;
        const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
        const skip = (page - 1) * limit;

        const baseWhere: any = {
            createdBy: { in: userIds },
            businessId: user.businessId,
            isDeleted: false,
        };

        const failedWhere: any = {
            status: { in: ["FAILED", "CANCELLED"] },
            stockRestored: false,
            businessId: user.businessId,
        };

        const recoveredWhere: any = {
            status: { in: ["PAID", "COMPLETED"] },
            stockRestored: true,
            businessId: user.businessId,
        };

        if (!isAllStores) {
            baseWhere.storeId = targetStoreId;
            failedWhere.storeId = targetStoreId;
            recoveredWhere.storeId = targetStoreId;
        }

        const clerk = await clerkClient();

        // 3. THE GOD PROMISE: Execute all heavy reads simultaneously with STRICT LIMITS
        const [clerkUsers, invoices, total, failedInvoices, recoveredInvoices] =
            await Promise.all([
                clerk.users.getUserList({ userId: userIds }),

                tenantPrisma.invoice.findMany({
                    where: baseWhere,
                    orderBy: { createdAt: "desc" },
                    include: {
                        invoiceItems: {
                            select: {
                                quantity: true,
                                Product: {
                                    select: {
                                        name: true,
                                        price: true,
                                        type: true,
                                        attributeValues: {
                                            include: { attributeOption: true },
                                        },
                                    },
                                },
                            },
                        },
                        Customer: {
                            select: {
                                firstName: true,
                                lastName: true,
                                email: true,
                                phoneNumber: true,
                            },
                        },
                    },
                    take: limit,
                    skip: skip,
                }),
                tenantPrisma.invoice.count({ where: baseWhere }),

                // BOUNDED HEALING: Only process 20 at a time to prevent Vercel 10s timeouts
                tenantPrisma.invoice.findMany({
                    where: failedWhere,
                    select: {
                        id: true,
                        storeId: true,
                        invoiceItems: {
                            select: {
                                productId: true,
                                quantity: true,
                                Product: { select: { type: true } },
                            },
                        },
                    },
                    take: 20,
                }),
                tenantPrisma.invoice.findMany({
                    where: recoveredWhere,
                    select: {
                        id: true,
                        storeId: true,
                        invoiceItems: {
                            select: {
                                productId: true,
                                quantity: true,
                                Product: { select: { type: true } },
                            },
                        },
                    },
                    take: 20,
                }),
            ]);

        // 4. AGGREGATED SELF-HEALING (Now safely bounded)
        const healingPromises = [];

        if (failedInvoices.length > 0) {
            const restockMap = new Map();
            failedInvoices.forEach((inv) => {
                const targetStore = isAllStores ? inv.storeId : targetStoreId;
                inv.invoiceItems.forEach((item) => {
                    if (item.Product.type !== "TEMPLATE" && targetStore) {
                        const key = `${targetStore}_${item.productId}`;
                        restockMap.set(key, {
                            storeId: targetStore,
                            productId: item.productId,
                            qty:
                                (restockMap.get(key)?.qty || 0) + item.quantity,
                        });
                    }
                });
            });

            if (restockMap.size > 0) {
                healingPromises.push(
                    tenantPrisma.$transaction(async (tx) => {
                        const ops = [];
                        for (const { storeId, productId, qty } of Array.from(
                            restockMap.values(),
                        )) {
                            ops.push(
                                tx.storeInventory.updateMany({
                                    where: { storeId, productId },
                                    data: { quantity: { increment: qty } },
                                }),
                            );
                            ops.push(
                                tx.product.update({
                                    where: { id: productId },
                                    data: { inStock: true },
                                }),
                            );
                        }
                        ops.push(
                            tx.invoice.updateMany({
                                where: {
                                    id: { in: failedInvoices.map((i) => i.id) },
                                },
                                data: { stockRestored: true },
                            }),
                        );
                        await Promise.all(ops);
                    }),
                );
            }
        }

        if (recoveredInvoices.length > 0) {
            const deductMap = new Map();
            recoveredInvoices.forEach((inv) => {
                const targetStore = isAllStores ? inv.storeId : targetStoreId;
                inv.invoiceItems.forEach((item) => {
                    if (item.Product.type !== "TEMPLATE" && targetStore) {
                        const key = `${targetStore}_${item.productId}`;
                        deductMap.set(key, {
                            storeId: targetStore,
                            productId: item.productId,
                            qty: (deductMap.get(key)?.qty || 0) + item.quantity,
                        });
                    }
                });
            });

            if (deductMap.size > 0) {
                healingPromises.push(
                    tenantPrisma.$transaction(async (tx) => {
                        const ops = [];
                        for (const { storeId, productId, qty } of Array.from(
                            deductMap.values(),
                        )) {
                            ops.push(
                                (async () => {
                                    const inv =
                                        await tx.storeInventory.findUnique({
                                            where: {
                                                storeId_productId: {
                                                    storeId,
                                                    productId,
                                                },
                                            },
                                            select: {
                                                id: true,
                                                quantity: true,
                                            },
                                        });
                                    if (inv) {
                                        const newQty = inv.quantity - qty;
                                        await tx.storeInventory.update({
                                            where: { id: inv.id },
                                            data: { quantity: newQty },
                                        });
                                        await tx.product.update({
                                            where: { id: productId },
                                            data: { inStock: newQty > 0 },
                                        });
                                    }
                                })(),
                            );
                        }
                        ops.push(
                            tx.invoice.updateMany({
                                where: {
                                    id: {
                                        in: recoveredInvoices.map((i) => i.id),
                                    },
                                },
                                data: { stockRestored: false },
                            }),
                        );
                        await Promise.all(ops);
                    }),
                );
            }
        }

        // Wait for all bounded DB writes to finish
        if (healingPromises.length > 0) {
            await Promise.all(healingPromises);
        }

        // 5. Map Clerk images to DB Users
        const usersMap = new Map();
        businessUsers.forEach((dbUser) => {
            const clerkUser = clerkUsers.data.find(
                (u) => u.id === dbUser.clerkId,
            );
            usersMap.set(dbUser.clerkId, {
                firstName: dbUser.firstName || clerkUser?.firstName,
                lastName: dbUser.lastName || clerkUser?.lastName,
                role: dbUser.role,
                imageUrl: clerkUser?.imageUrl || null,
            });
        });

        // 6. Format final JSON response
        const updatedInvoices = invoices.map((invoice) => {
            let mostExpensiveItem: any = null;
            let totalQuantity = 0;

            invoice.invoiceItems.forEach((item) => {
                totalQuantity += item.quantity;
                if (
                    !mostExpensiveItem ||
                    item.Product.price > mostExpensiveItem.Product.price
                ) {
                    mostExpensiveItem = item;
                }
            });

            return {
                ...invoice,
                itemName: mostExpensiveItem?.Product.name,
                totalQuantity,
                creator: invoice.createdBy
                    ? usersMap.get(invoice.createdBy)
                    : null,
            };
        });

        res.status(200).json({
            data: updatedInvoices,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error("Error fetching invoices:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

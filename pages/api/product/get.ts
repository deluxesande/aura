import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth, clerkClient } from "@clerk/nextjs/server";
import { masterPrisma, getTenantPrisma } from "@/utils/lib/prisma";

export const getProducts = async (
    req: NextApiRequest,
    res: NextApiResponse,
) => {
    try {
        const { userId } = getAuth(req);

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const user = await masterPrisma.user.findUnique({
            where: { clerkId: userId },
            select: { businessId: true, role: true },
        });

        if (!user || !user.businessId) {
            return res.status(200).json([]);
        }

        const businessId = user.businessId;
        const tenantPrisma = await getTenantPrisma(businessId);
        const activeStoreHeader = req.headers["x-store-id"] as string;

        // Fetch user store info from Tenant DB if not admin
        let targetStoreId = activeStoreHeader;
        if (user.role !== "admin") {
            const tenantUser = await tenantPrisma.tenantUser.findUnique({
                where: { clerkId: userId },
                select: { storeId: true }
            });
            if (tenantUser?.storeId) targetStoreId = tenantUser.storeId;
        }

        // Fallback for admins if no store header is provided
        if (!targetStoreId && user.role === "admin") {
            const firstStore = await tenantPrisma.store.findFirst({
                where: { businessId, isActive: true },
                select: { id: true },
            });
            if (firstStore) targetStoreId = firstStore.id;
        }

        if (!targetStoreId) {
            return res.status(200).json([]);
        }

        const products = await tenantPrisma.product.findMany({
            where: {
                businessId: businessId,
                isArchived: false,
                OR: [
                    { type: "TEMPLATE" },
                    {
                        storeInventories: {
                            some: { storeId: targetStoreId },
                        },
                    },
                    {
                        variants: {
                            some: {
                                isArchived: false,
                                storeInventories: {
                                    some: { storeId: targetStoreId },
                                },
                            },
                        },
                    },
                ],
            },
            include: {
                Category: true,
                storeInventories: {
                    where: { storeId: targetStoreId },
                    select: { quantity: true },
                },
                purchaseOrderItems: {
                    where: {
                        PurchaseOrder: {
                            storeId: targetStoreId,
                            status: { in: ["PENDING", "IN_TRANSIT"] },
                            isDeleted: false,
                        },
                    },
                    select: { quantity: true },
                },
                variants: {
                    where: { isArchived: false },
                    include: {
                        storeInventories: {
                            where: { storeId: targetStoreId },
                            select: { quantity: true },
                        },
                        purchaseOrderItems: {
                            where: {
                                PurchaseOrder: {
                                    storeId: targetStoreId,
                                    status: { in: ["PENDING", "IN_TRANSIT"] },
                                    isDeleted: false,
                                },
                            },
                            select: { quantity: true },
                        },
                        attributeValues: {
                            include: {
                                attributeOption: {
                                    include: {
                                        attribute: true,
                                    },
                                },
                            },
                        },
                    },
                },
                attributeValues: {
                    include: {
                        attributeOption: {
                            include: {
                                attribute: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        // Map quantity from storeInventories AND purchaseOrderItems to the flat quantity field for frontend compatibility
        const productsWithQuantity = products.map((p) => {
            const inventoryQty = p.storeInventories[0]?.quantity || 0;
            const pendingPOQty = p.purchaseOrderItems.reduce((sum, item) => sum + item.quantity, 0);
            const quantity = inventoryQty + pendingPOQty;

            const variants = p.variants.map((v) => {
                const vInventoryQty = v.storeInventories[0]?.quantity || 0;
                const vPendingPOQty = v.purchaseOrderItems.reduce((sum, item) => sum + item.quantity, 0);
                return {
                    ...v,
                    quantity: vInventoryQty + vPendingPOQty,
                };
            });
            return { ...p, quantity, variants };
        });

        const businessUsers = await masterPrisma.user.findMany({
            where: { businessId: businessId },
            select: {
                clerkId: true,
                firstName: true,
                lastName: true,
                role: true,
            },
        });

        const clerk = await clerkClient();
        const usersMap = new Map();

        const clerkUsersResults = await Promise.allSettled(
            businessUsers.map((dbUser) => clerk.users.getUser(dbUser.clerkId)),
        );

        businessUsers.forEach((dbUser, index) => {
            const result = clerkUsersResults[index];

            if (result.status === "fulfilled") {
                const clerkUser = result.value;
                usersMap.set(dbUser.clerkId, {
                    firstName: dbUser.firstName || clerkUser.firstName,
                    lastName: dbUser.lastName || clerkUser.lastName,
                    role: dbUser.role,
                    imageUrl: clerkUser.imageUrl,
                });
            } else {
                usersMap.set(dbUser.clerkId, {
                    firstName: dbUser.firstName,
                    lastName: dbUser.lastName,
                    role: dbUser.role,
                    imageUrl: null,
                });
            }
        });

        // Helper to attach creator to a product and its variants
        const attachCreator = (product: any) => {
            const creator = product.createdBy
                ? usersMap.get(product.createdBy)
                : null;
            const productWithCreator = { ...product, creator: creator || null };

            if (productWithCreator.variants) {
                productWithCreator.variants = productWithCreator.variants.map(
                    (v: any) => ({
                        ...v,
                        creator: v.createdBy ? usersMap.get(v.createdBy) : null,
                    }),
                );
            }

            return productWithCreator;
        };

        const productsWithCreator = productsWithQuantity.map(attachCreator);

        if (productsWithCreator.length === 0) {
            return res.status(200).json([]);
        }

        res.status(200).json(productsWithCreator);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

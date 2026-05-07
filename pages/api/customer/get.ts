import { getAuth, clerkClient } from "@clerk/nextjs/server";
import type { NextApiRequest, NextApiResponse } from "next";
import { masterPrisma, getTenantPrisma } from "@/utils/lib/prisma";

export const getCustomers = async (
    req: NextApiRequest,
    res: NextApiResponse
) => {
    try {
        const { userId: clerkUserId } = getAuth(req);

        if (!clerkUserId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const user = await masterPrisma.user.findUnique({
            where: { clerkId: clerkUserId },
            select: { businessId: true, role: true },
        });

        if (!user || !user.businessId) {
            // During onboarding, return empty list instead of erroring
            return res.status(200).json([]);
        }

        const tenantPrisma = await getTenantPrisma(user.businessId);
        const activeStoreHeader = req.headers["x-store-id"] as string;

        const targetStoreId = activeStoreHeader;

        if (!targetStoreId) {
            return res.status(200).json([]); // No store selected yet
        }

        const page = parseInt(req.query.page as string) || 1;
        const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
        const skip = (page - 1) * limit;

        const [customers, total] = await Promise.all([
            tenantPrisma.customer.findMany({
                where: {
                    storeId: targetStoreId,
                    businessId: user.businessId,
                },
                include: {
                    CreatedBy: {
                        select: {
                            firstName: true,
                            lastName: true,
                            role: true,
                            clerkId: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
                take: limit,
                skip: skip,
            }),
            tenantPrisma.customer.count({
                where: {
                    storeId: targetStoreId,
                    businessId: user.businessId,
                },
            }),
        ]);

        const client = await clerkClient();
        const imageCache = new Map<string, string>();

        const customersWithImages = await Promise.all(
            customers.map(async (customer) => {
                let imageUrl = "/images/user.png"; // Default fallback

                if (customer.CreatedBy?.clerkId) {
                    const cId = customer.CreatedBy.clerkId;

                    if (imageCache.has(cId)) {
                        imageUrl = imageCache.get(cId)!;
                    } else {
                        try {
                            const clerkUser = await client.users.getUser(cId);
                            if (clerkUser.imageUrl) {
                                imageUrl = clerkUser.imageUrl;
                                imageCache.set(cId, imageUrl);
                            }
                        } catch (error) {
                            console.warn(
                                `Could not fetch image for user ${cId}`
                            );
                        }
                    }
                }

                return {
                    ...customer,
                    CreatedBy: customer.CreatedBy
                        ? {
                              ...customer.CreatedBy,
                              imageUrl: imageUrl,
                          }
                        : null,
                };
            })
        );

        res.status(200).json({
            data: customersWithImages,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error("Error fetching customers:", error);
        res.status(500).json({ error: "Failed to fetch customers" });
    }
};

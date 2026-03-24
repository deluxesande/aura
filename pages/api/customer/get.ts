import { getAuth, clerkClient } from "@clerk/nextjs/server";
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/utils/lib/client";

export const getCustomers = async (
    req: NextApiRequest,
    res: NextApiResponse
) => {
    try {
        const { userId: clerkUserId } = getAuth(req);

        if (!clerkUserId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const activeStoreHeader = req.headers["x-store-id"] as string;

        const dbUser = await prisma.user.findUnique({
            where: { clerkId: clerkUserId },
            select: { role: true, storeId: true }
        });

        const targetStoreId = dbUser?.role === "admin" ? activeStoreHeader : (dbUser?.storeId as string);

        if (!targetStoreId) {
            return res.status(400).json({ error: "No active store selected." });
        }

        const user = await prisma.user.findUnique({
            where: { clerkId: clerkUserId },
            select: { businessId: true },
        });

        if (!user || !user.businessId) {
            return res
                .status(400)
                .json({ error: "User is not linked to a business" });
        }

        const customers = await prisma.customer.findMany({
            where: {
                businessId: user.businessId,
                storeId: targetStoreId,
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
        });

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

        res.status(200).json(customersWithImages);
    } catch (error) {
        console.error("Error fetching customers:", error);
        res.status(500).json({ error: "Failed to fetch customers" });
    }
};

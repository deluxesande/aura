import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/utils/lib/client";

export const getProducts = async (
    req: NextApiRequest,
    res: NextApiResponse
) => {
    try {
        const { userId } = getAuth(req);

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const currentUser = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { businessId: true },
        });

        if (!currentUser || !currentUser.businessId) {
            return res
                .status(404)
                .json({ error: "User or business not found" });
        }

        const products = await prisma.product.findMany({
            where: {
                businessId: currentUser.businessId,
            },
            include: {
                Category: true,
                variants: {
                    include: {
                        attributeValues: {
                            include: {
                                attributeOption: {
                                    include: {
                                        attribute: true
                                    }
                                }
                            }
                        }
                    }
                },
                attributeValues: {
                    include: {
                        attributeOption: {
                            include: {
                                attribute: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        const businessUsers = await prisma.user.findMany({
            where: { businessId: currentUser.businessId },
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
            businessUsers.map((dbUser) => clerk.users.getUser(dbUser.clerkId))
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
            const creator = product.createdBy ? usersMap.get(product.createdBy) : null;
            const productWithCreator = { ...product, creator: creator || null };
            
            if (productWithCreator.variants) {
                productWithCreator.variants = productWithCreator.variants.map((v: any) => ({
                    ...v,
                    creator: v.createdBy ? usersMap.get(v.createdBy) : null
                }));
            }
            
            return productWithCreator;
        };

        const productsWithCreator = products.map(attachCreator);

        if (productsWithCreator.length === 0) {
            return res.status(200).json([]);
        }

        res.status(200).json(productsWithCreator);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ error: "Internal Server Error" });
    } finally {
        await prisma.$disconnect();
    }
};

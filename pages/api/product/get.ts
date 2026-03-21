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

        // 1. Get current user with their business
        const currentUser = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { businessId: true },
        });

        if (!currentUser || !currentUser.businessId) {
            return res
                .status(404)
                .json({ error: "User or business not found" });
        }

        // 2. Get products belonging to the same business
        const products = await prisma.product.findMany({
            where: {
                businessId: currentUser.businessId,
            },
            include: {
                Category: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        // 3. Get all users in the same business to map names/images
        const businessUsers = await prisma.user.findMany({
            where: { businessId: currentUser.businessId },
            select: {
                clerkId: true,
                firstName: true,
                lastName: true,
                role: true,
            },
        });

        // 4. Get Clerk client to fetch user images
        const clerk = await clerkClient();

        // 5. Build the users Map (Merging Prisma Data + Clerk Image)
        const usersMap = new Map();

        for (const dbUser of businessUsers) {
            try {
                // Fetch specific user from Clerk to get the Image URL
                const clerkUser = await clerk.users.getUser(dbUser.clerkId);

                usersMap.set(dbUser.clerkId, {
                    firstName: dbUser.firstName || clerkUser.firstName,
                    lastName: dbUser.lastName || clerkUser.lastName,
                    role: dbUser.role,
                    imageUrl: clerkUser.imageUrl, // This comes from Clerk
                });
            } catch (error) {
                // If Clerk fetch fails, fallback to database info only with null image
                usersMap.set(dbUser.clerkId, {
                    firstName: dbUser.firstName,
                    lastName: dbUser.lastName,
                    role: dbUser.role,
                    imageUrl: null,
                });
            }
        }

        // 6. Attach creator details to products
        const productsWithCreator = products.map((product) => {
            // Get creator user info from the map
            const creator = product.createdBy
                ? usersMap.get(product.createdBy)
                : null;

            return {
                ...product,
                creator: creator || null,
            };
        });

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

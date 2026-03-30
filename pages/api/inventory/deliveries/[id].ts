import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/utils/lib/client";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    if (req.method !== "GET") {
        res.setHeader("Allow", ["GET"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { userId: clerkId } = getAuth(req);
    if (!clerkId) return res.status(401).json({ error: "Unauthorized" });

    const user = await prisma.user.findUnique({
        where: { clerkId },
        select: { id: true, businessId: true },
    });

    if (!user || !user.businessId) {
        return res.status(403).json({ error: "Access denied." });
    }

    const deliveryId = req.query.id as string;
    if (!deliveryId)
        return res.status(400).json({ error: "Missing delivery ID" });

    try {
        const delivery = await prisma.delivery.findUnique({
            where: {
                id: deliveryId,
                businessId: user.businessId,
            },
            include: {
                Store: { select: { name: true } },
                Supplier: { select: { name: true, email: true, phoneNumber: true } },
                CreatedBy: {
                    select: {
                        firstName: true,
                        lastName: true,
                        role: true,
                        clerkId: true,
                    },
                },
                receipts: {
                    include: {
                        Product: { select: { name: true, sku: true } },
                    },
                },
            },
        });

        if (!delivery) {
            return res.status(404).json({ error: "Delivery not found" });
        }

        // Fetch creator's image from Clerk
        let creatorImage = "/images/user.png";
        if (delivery.CreatedBy?.clerkId) {
            const clerk = await clerkClient();
            try {
                const clerkUser = await clerk.users.getUser(
                    delivery.CreatedBy.clerkId,
                );
                creatorImage = clerkUser.imageUrl;
            } catch (e) {
                console.error("Clerk fetch error", e);
            }
        }

        const deliveryWithImage = {
            ...delivery,
            creator: delivery.CreatedBy
                ? {
                      firstName: delivery.CreatedBy.firstName,
                      lastName: delivery.CreatedBy.lastName,
                      role: delivery.CreatedBy.role,
                      imageUrl: creatorImage,
                  }
                : null,
        };

        return res.status(200).json(deliveryWithImage);
    } catch (error) {
        console.error("GET_DELIVERY_ERROR", error);
        return res
            .status(500)
            .json({ error: "Failed to fetch delivery details" });
    }
}

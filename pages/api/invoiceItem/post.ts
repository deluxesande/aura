import type { NextApiRequest, NextApiResponse } from "next";
import { addCreatedBy } from "../middleware";
import { prisma } from "@/utils/lib/client";
import { Novu } from "@novu/api"; // Ensure you have this installed

const novu = new Novu({
    secretKey: process.env.NOVU_SECRET_KEY!,
});

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const { invoiceId = null, productId, quantity, price } = req.body;
    const userId = req.body.createdBy; // Clerk ID

    const activeStoreHeader = req.headers["x-store-id"] as string;

    try {
        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { role: true, storeId: true }
        });

        if (!user) return res.status(404).json({ error: "User not found" });

        const targetStoreId = user.role === "admin" ? activeStoreHeader : (user.storeId as string);

        if (!targetStoreId) {
            return res.status(400).json({ error: "No active store selected." });
        }

        // 1. Check if the inventory exists for this store
        const inventory = await prisma.storeInventory.findUnique({
            where: {
                storeId_productId: {
                    storeId: targetStoreId,
                    productId: productId,
                },
            },
            include: { Product: true }
        });

        if (!inventory) {
            return res.status(400).json({ error: "Product not found in this store's inventory" });
        }

        // 2. Check if the store has enough quantity
        if (inventory.quantity < quantity) {
            return res
                .status(400)
                .json({ error: "Insufficient product quantity in this store" });
        }

        // 3. Update StoreInventory and global Product inStock status
        const [updatedInventory, updatedProduct] = await prisma.$transaction([
            prisma.storeInventory.update({
                where: { id: inventory.id },
                data: { quantity: { decrement: quantity } },
            }),
            prisma.product.update({
                where: { id: productId },
                data: {
                    inStock: inventory.quantity - quantity === 0 ? false : undefined,
                },
            })
        ]);

        // 4. Create the invoice item
        const invoiceItem = await prisma.invoiceItem.create({
            data: {
                invoiceId,
                quantity,
                price,
                productId,
                createdBy: userId,
            },
        });

        // 5. Check if updated inventory quantity is at or below threshold (5)
        try {
            if (updatedInventory.quantity <= 5) {
                // Get current user to identify the business
                const currentUser = await prisma.user.findUnique({
                    where: { clerkId: userId },
                });

                if (currentUser?.businessId) {
                    // Find Admins & Managers for this business
                    const adminsAndManagers = await prisma.user.findMany({
                        where: {
                            businessId: currentUser.businessId,
                            role: { in: ["admin", "manager"] },
                        },
                    });

                    // Trigger notifications in parallel
                    await Promise.all(
                        adminsAndManagers.map((admin) => {
                            return novu.trigger({
                                to: {
                                    subscriberId: admin.clerkId,
                                },
                                workflowId: "low-stock-alert",
                                payload: {
                                    name: updatedProduct.name,
                                    quantity: String(updatedInventory.quantity),
                                },
                            });
                        })
                    );
                }
            }
        } catch (notificationError) {
            console.error(
                "Failed to send stock notification:",
                notificationError
            );
        }

        res.status(201).json(invoiceItem);
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: "Failed to add or update invoice item" });
    }
};

export const addInvoiceItem = addCreatedBy(handler);

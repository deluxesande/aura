import type { NextApiRequest, NextApiResponse } from "next";
import { addCreatedBy } from "../middleware";
import { prisma } from "@/utils/lib/client";
import { Novu } from "@novu/api"; // Ensure you have this installed

const novu = new Novu({
    secretKey: process.env.NOVU_SECRET_KEY!,
});

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const { invoiceId = null, productId, quantity, price } = req.body;
    const userId = req.body.createdBy; // Extracted from middleware

    try {
        // 1. Check if the productId exists
        const product = await prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product) {
            return res.status(400).json({ error: "Invalid productId" });
        }

        // 2. Check if the product has enough quantity
        if (product.quantity < quantity) {
            return res
                .status(400)
                .json({ error: "Insufficient product quantity" });
        }

        // 3. Reduce the product quantity and update inStock
        // We capture the 'updatedProduct' to check its new quantity immediately
        const updatedProduct = await prisma.product.update({
            where: { id: productId },
            data: {
                quantity: {
                    decrement: quantity,
                },
                inStock: product.quantity - quantity === 0 ? false : undefined,
            },
        });

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

        // 5. Check if updated product quantity is at or below threshold (5)
        try {
            if (updatedProduct.quantity <= 5) {
                // Get current user to identify the business
                const currentUser = await prisma.user.findUnique({
                    where: { clerkId: req.body.createdBy },
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
                                    quantity: String(updatedProduct.quantity),
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

import type { NextApiRequest, NextApiResponse } from "next";
import { addCreatedBy } from "../middleware";
import { masterPrisma, getTenantPrisma } from "@/utils/lib/prisma";
import { Novu } from "@novu/api";
import { getAuth } from "@clerk/nextjs/server";
import { verifyStoreAccess } from "@/utils/server/auth";

const novu = new Novu({
    secretKey: process.env.NOVU_SECRET_KEY!,
});

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const { cartItems, totalAmount, paymentType, customerId, createdBy } =
        req.body;

    const { userId } = getAuth(req);

    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    if (!cartItems || cartItems.length === 0) {
        return res.status(400).json({ error: "Cart is empty" });
    }

    const currentDate = new Date();
    const formattedDate = currentDate
        .toISOString()
        .replace("T", "-")
        .split(".")[0];
    const invoiceName = `Invoice-${formattedDate}`;
    const invoiceStatus = paymentType === "CASH" ? "PAID" : "PENDING";

    try {
        const creator = await masterPrisma.user.findUnique({
            where: { clerkId: createdBy },
        });

        if (!creator?.businessId) {
            return res
                .status(400)
                .json({ error: "User is not linked to a business" });
        }

        const businessId = creator.businessId;
        const tenantPrisma = await getTenantPrisma(businessId);

        const activeStoreHeader = req.headers["x-store-id"] as string;
        let targetStoreId = activeStoreHeader;

        if (creator.role !== "admin") {
            const tenantUser = await tenantPrisma.tenantUser.findUnique({
                where: { clerkId: userId },
                select: { storeId: true }
            });
            if (tenantUser?.storeId) targetStoreId = tenantUser.storeId;
        }

        // Verify store access to prevent leakage
        const validatedStoreId = await verifyStoreAccess(businessId, targetStoreId);
        if (!validatedStoreId) {
            return res.status(403).json({ error: "Unauthorized store access" });
        }
        targetStoreId = validatedStoreId;

        const result = await tenantPrisma.$transaction(
            async (tx) => {
                const productIds = cartItems.map((item: any) => item.productId);
                const dbProducts = await tx.product.findMany({
                    where: { id: { in: productIds } },
                    include: {
                        storeInventories: {
                            where: { storeId: targetStoreId }
                        }
                    }
                });

                const productMap = new Map(dbProducts.map((p) => [p.id, p]));
                const lowStockAlerts: any[] = [];
                const updatePromises: any[] = [];

                for (const item of cartItems) {
                    const product = productMap.get(item.productId);

                    if (!product) {
                        throw new Error(`Product not found: ${item.productId}`);
                    }

                    // For TEMPLATE products, we bypass the stock check and decrement
                    if (product.type === "TEMPLATE") {
                        continue;
                    }

                    const inventory = product.storeInventories[0];
                    const availableQuantity = inventory?.quantity || 0;

                    if (availableQuantity < item.quantity) {
                        throw new Error(
                            `Insufficient stock for ${product.name}. Available: ${availableQuantity}`,
                        );
                    }

                    const updatePromise = tx.storeInventory.update({
                        where: { id: inventory.id },
                        data: {
                            quantity: { decrement: item.quantity },
                        },
                    });
                    updatePromises.push(updatePromise);

                    // Also update the global product's inStock status if it hits 0 in this store
                    // This matches the behavior in pages/api/invoiceItem/post.ts
                    const productUpdate = tx.product.update({
                        where: { id: item.productId },
                        data: {
                            inStock: availableQuantity - item.quantity > 0,
                        },
                    });
                    updatePromises.push(productUpdate);

                    // Check for low stock based on calculation
                    if (availableQuantity - item.quantity <= 5) {
                        lowStockAlerts.push({
                            name: product.name,
                            quantity: availableQuantity - item.quantity,
                        });
                    }
                }

                const invoice = await tx.invoice.create({
                    data: {
                        invoiceName,
                        totalAmount: parseFloat(totalAmount),
                        paymentType,
                        status: invoiceStatus,
                        customerId: customerId || null,
                        storeId: targetStoreId,
                        createdBy,
                        businessId: businessId,
                    },
                });

                await Promise.all([
                    tx.invoiceItem.createMany({
                        data: cartItems.map((item: any) => {
                            const product = productMap.get(item.productId);
                            return {
                                invoiceId: invoice.id,
                                productId: item.productId,
                                quantity: item.quantity,
                                price: product?.price || item.price, // Use actual product price
                                createdBy,
                                businessId: businessId,
                            };
                        }),
                    }),
                    ...updatePromises
                ]);

                return { invoice, lowStockAlerts };
            },
            {
                timeout: 10000,
            },
        );

        const { invoice, lowStockAlerts } = result;

        const adminsAndManagers = await masterPrisma.user.findMany({
            where: {
                businessId: creator.businessId,
                OR: [
                    { role: { in: ["admin", "manager"] } },
                    { clerkId: createdBy },
                ],
            },
        });

        Promise.all(
            adminsAndManagers.map((admin) =>
                novu.trigger({
                    to: { subscriberId: admin.clerkId },
                    workflowId: "invoice-generated",
                    payload: {
                        invoiceId: invoice.id,
                        invoiceName: invoice.invoiceName,
                        totalAmount: invoice.totalAmount,
                        createdBy: `${creator.firstName} ${creator.lastName}`,
                    },
                }),
            ),
        ).catch((e) => console.error("Notification Error", e));

        if (lowStockAlerts.length > 0) {
            Promise.all(
                lowStockAlerts.flatMap((prod) =>
                    adminsAndManagers.map((admin) =>
                        novu.trigger({
                            to: { subscriberId: admin.clerkId },
                            workflowId: "low-stock-alert",
                            payload: {
                                name: prod.name,
                                quantity: String(prod.quantity),
                            },
                        }),
                    ),
                ),
            ).catch((e) => console.error("Stock Alert Error", e));
        }

        return res.status(201).json(invoice);
    } catch (error: any) {
        console.error("Batch Creation Error:", error);
        return res
            .status(400)
            .json({ error: error.message || "Failed to process order" });
    }
};

export default addCreatedBy(handler);

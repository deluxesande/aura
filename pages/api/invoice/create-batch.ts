import type { NextApiRequest, NextApiResponse } from "next";
import { addCreatedBy } from "../middleware";
import { prisma } from "@/utils/lib/client";
import { Novu } from "@novu/api";
import { getAuth } from "@clerk/nextjs/server";

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
        const creator = await prisma.user.findUnique({
            where: { clerkId: createdBy },
        });

        if (!creator?.businessId) {
            return res
                .status(400)
                .json({ error: "User is not linked to a business" });
        }

        const result = await prisma.$transaction(async (tx) => {
            const invoice = await tx.invoice.create({
                data: {
                    invoiceName,
                    totalAmount: parseFloat(totalAmount),
                    paymentType,
                    status: invoiceStatus,
                    customerId: customerId || null,
                    businessId: creator.businessId,
                    createdBy,
                },
            });

            const lowStockAlerts = [];

            for (const item of cartItems) {
                const product = await tx.product.findUnique({
                    where: { id: item.productId },
                });

                if (!product) {
                    throw new Error(`Product not found: ${item.productId}`);
                }

                if (product.quantity < item.quantity) {
                    throw new Error(`Insufficient stock for ${product.name}`);
                }

                const updatedProduct = await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        quantity: { decrement: item.quantity },
                        inStock: product.quantity - item.quantity > 0,
                    },
                });
                await tx.invoiceItem.create({
                    data: {
                        invoiceId: invoice.id,
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.price,
                        createdBy,
                    },
                });

                if (updatedProduct.quantity <= 5) {
                    lowStockAlerts.push(updatedProduct);
                }
            }

            return { invoice, lowStockAlerts };
        });

        const { invoice, lowStockAlerts } = result;

        const adminsAndManagers = await prisma.user.findMany({
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
        ).catch((err) => console.error("Invoice Notification Error:", err));

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
            ).catch((err) => console.error("Stock Notification Error:", err));
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

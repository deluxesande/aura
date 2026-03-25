import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/utils/lib/client";

export const deleteInvoiceItem = async (
    req: NextApiRequest,
    res: NextApiResponse
) => {
    const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;

    if (!id) {
        return res.status(400).json({ error: "Missing invoice item ID" });
    }

    try {
        const item = await prisma.invoiceItem.findUnique({
            where: { id: id },
            include: {
                Invoice: { select: { storeId: true } },
                Product: { select: { type: true } },
            },
        });

        if (!item) {
            return res.status(404).json({ error: "Invoice item not found" });
        }

        await prisma.$transaction(async (tx) => {
            // Restore stock if not a template and storeId exists
            if (item.Product.type !== "TEMPLATE" && item.Invoice?.storeId) {
                await tx.storeInventory.updateMany({
                    where: {
                        storeId: item.Invoice.storeId,
                        productId: item.productId,
                    },
                    data: {
                        quantity: { increment: item.quantity },
                    },
                });

                // Update global inStock status
                await tx.product.update({
                    where: { id: item.productId },
                    data: { inStock: true },
                });
            }

            await tx.invoiceItem.delete({
                where: { id: id },
            });
        });

        res.status(204).end();
    } catch (error) {
        res.status(404).json({ error: "Failed to delete invoice item" });
    }
};

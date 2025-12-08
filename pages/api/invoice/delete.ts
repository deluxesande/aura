import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/utils/lib/client";

export const deleteInvoice = async (
    req: NextApiRequest,
    res: NextApiResponse
) => {
    const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;

    try {
        // First, get all invoice items for this invoice
        const invoiceItems = await prisma.invoiceItem.findMany({
            where: {
                invoiceId: id,
            },
            include: {
                Product: true, // Include product details
            },
        });

        // Use a transaction to ensure all operations succeed or fail together
        await prisma.$transaction(async (tx) => {
            // Restore product quantities
            for (const item of invoiceItems) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        quantity: {
                            increment: item.quantity, // Add back the quantity
                        },
                        inStock: true, // Product is back in stock
                    },
                });
            }

            // Delete the invoice (cascade will delete invoice items)
            await tx.invoice.delete({
                where: {
                    id: id,
                },
            });
        });

        res.status(204).end();
    } catch (error) {
        console.error("Failed to delete invoice:", error);
        res.status(404).json({ error: "Failed to delete invoice" });
    }
};

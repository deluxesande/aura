import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/utils/lib/client";
import { Novu } from "@novu/api";
import { getAuth } from "@clerk/nextjs/server";

const novu = new Novu({
    secretKey: process.env.NOVU_SECRET_KEY!,
});

async function sendDeleteNotification(invoice: any, deletedBy: any) {
    if (!invoice.createdBy) {
        console.warn("Invoice has no creator, skipping notification.");
        return;
    }

    const creator = await prisma.user.findUnique({
        where: { clerkId: invoice.createdBy },
    });

    if (!creator || !creator.businessId) {
        console.error("Creator or business not found for notification");
        return;
    }

    const adminsAndManagers = await prisma.user.findMany({
        where: {
            businessId: creator.businessId,
            role: { in: ["admin", "manager"] },
        },
    });

    for (const admin of adminsAndManagers) {
        try {
            await novu.trigger({
                to: {
                    subscriberId: admin.clerkId,
                },
                workflowId: "invoice-deleted",
                payload: {
                    invoiceName: invoice.invoiceName || "Unnamed Invoice",
                    totalAmount: String(invoice.totalAmount),
                    deletedBy: `${deletedBy.firstName} ${deletedBy.lastName}`,
                },
            });
        } catch (error) {
            console.error(
                `Failed to send Novu notification to ${admin.email}:`,
                error
            );
        }
    }
}

export const deleteInvoice = async (
    req: NextApiRequest,
    res: NextApiResponse
) => {
    const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;

    try {
        // Get the invoice details for notification
        const deletedInvoice = await prisma.invoice.findUnique({
            where: { id: id },
        });

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

        const user = getAuth(req);
        const deleteBy = await prisma.user.findUnique({
            where: { clerkId: user.userId || "" },
            select: { firstName: true, lastName: true },
        });

        sendDeleteNotification(deletedInvoice, deleteBy).catch((err) =>
            console.error("Notification Error:", err)
        );

        res.status(204).end();
    } catch (error) {
        console.error("Failed to delete invoice:", error);
        res.status(404).json({ error: "Failed to delete invoice" });
    }
};

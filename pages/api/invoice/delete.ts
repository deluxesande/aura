import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/utils/lib/client";
import { Novu } from "@novu/api";
import { getAuth } from "@clerk/nextjs/server";

const novu = new Novu({
    secretKey: process.env.NOVU_SECRET_KEY!,
});

async function sendDeleteNotification(invoice: any, deletedBy: any) {
    if (!invoice.createdBy) return;

    const creator = await prisma.user.findUnique({
        where: { clerkId: invoice.createdBy },
    });

    if (!creator || !creator.businessId) return;

    const adminsAndManagers = await prisma.user.findMany({
        where: {
            businessId: creator.businessId,
            role: { in: ["admin", "manager"] },
        },
    });

    for (const admin of adminsAndManagers) {
        try {
            await novu.trigger({
                to: { subscriberId: admin.clerkId },
                workflowId: "invoice-deleted",
                payload: {
                    invoiceName: invoice.invoiceName || "Unnamed Invoice",
                    totalAmount: String(invoice.totalAmount),
                    deletedBy: deletedBy
                        ? `${deletedBy.firstName} ${deletedBy.lastName}`
                        : "Unknown User",
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

    if (!id) return res.status(400).json({ error: "Missing invoice ID" });

    try {
        const deletedInvoice = await prisma.invoice.findUnique({
            where: { id: id },
        });

        if (!deletedInvoice) {
            return res.status(404).json({ error: "Invoice not found" });
        }

        const invoiceItems = await prisma.invoiceItem.findMany({
            where: { invoiceId: id },
            include: { Product: true },
        });

        await prisma.$transaction(async (tx) => {
            // 1. Restore product quantities
            for (const item of invoiceItems) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        quantity: { increment: item.quantity },
                        inStock: true,
                    },
                });
            }

            // 2. Clean up M-Pesa related data linked to this invoice
            await tx.successfulCallback.deleteMany({
                where: { invoiceId: id },
            });

            await tx.failedCallback.deleteMany({
                where: { invoiceId: id },
            });

            await tx.mpesaPayment.deleteMany({
                where: { invoiceId: id },
            });

            // 3. Delete the invoice (Cascade will handle InvoiceItems)
            await tx.invoice.delete({
                where: { id: id },
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
        res.status(500).json({ error: "Failed to delete invoice" });
    }
};

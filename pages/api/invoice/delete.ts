import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/utils/lib/client";
import { Novu } from "@novu/api";
import { getAuth } from "@clerk/nextjs/server";
import { logAction } from "@/utils/server/audit";

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

    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    if (!id) return res.status(400).json({ error: "Missing invoice ID" });

    try {
        const existingInvoice = await prisma.invoice.findUnique({
            where: { id: id },
        });

        if (!existingInvoice || existingInvoice.isDeleted) {
            return res.status(404).json({ error: "Invoice not found or already deleted" });
        }

        const currentUser = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { id: true, businessId: true }
        });

        if (!currentUser) return res.status(404).json({ error: "User not found" });

        const invoiceItems = await prisma.invoiceItem.findMany({
            where: { invoiceId: id },
            include: { Product: true },
        });

        await prisma.$transaction(async (tx) => {
            // 1. Restore product quantities to StoreInventory
            if (existingInvoice.storeId) {
                for (const item of invoiceItems) {
                    // Skip if it's a template
                    if (item.Product.type === "TEMPLATE") continue;

                    await tx.storeInventory.updateMany({
                        where: {
                            storeId: existingInvoice.storeId,
                            productId: item.productId,
                        },
                        data: {
                            quantity: { increment: item.quantity },
                        },
                    });

                    // Update global inStock status
                    await tx.product.update({
                        where: { id: item.productId },
                        data: {
                            inStock: true,
                        },
                    });
                }
            }

            // SOFT DELETE: Update the invoice status and isDeleted flag
            // We keep M-Pesa related data for historical reference in soft-deleted invoices
            await tx.invoice.update({
                where: { id: id },
                data: {
                    isDeleted: true,
                    status: "VOIDED",
                    stockRestored: true, // Mark as restored since we just did it above
                },
            });
        });

        // Log Audit Action
        await logAction({
            action: "VOID_INVOICE",
            entityType: "INVOICE",
            entityId: id,
            details: { invoiceName: existingInvoice.invoiceName, totalAmount: existingInvoice.totalAmount },
            userId: currentUser.id,
            businessId: currentUser.businessId!,
            ipAddress: req.headers["x-forwarded-for"] as string || req.socket.remoteAddress,
            userAgent: req.headers["user-agent"],
        });

        const deleteBy = await prisma.user.findUnique({
            where: { clerkId: userId || "" },
            select: { firstName: true, lastName: true },
        });

        sendDeleteNotification(existingInvoice, deleteBy).catch((err) =>
            console.error("Notification Error:", err)
        );

        res.status(200).json({ message: "Invoice voided successfully" });
    } catch (error) {
        console.error("Failed to delete invoice:", error);
        res.status(500).json({ error: "Failed to delete invoice" });
    }
};


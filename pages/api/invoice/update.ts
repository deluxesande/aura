import { InvoiceItem } from "@/utils/typesDefinitions";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/utils/lib/client";
import { Novu } from "@novu/api";
import { getAuth } from "@clerk/nextjs/server";

// Initialize Novu
const novu = new Novu({
    secretKey: process.env.NOVU_SECRET_KEY!,
});

export const updateInvoice = async (
    req: NextApiRequest,
    res: NextApiResponse
) => {
    const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
    const { customerId, invoiceItems, totalAmount, status } = req.body;

    if (!id) {
        return res.status(400).json({ error: "Invalid or missing invoice ID" });
    }

    // 1. Construct Update Data
    const dataToUpdate: any = {};
    if (customerId) dataToUpdate.customerId = customerId;
    if (totalAmount) dataToUpdate.totalAmount = totalAmount;
    if (status) dataToUpdate.status = status;

    if (invoiceItems && Array.isArray(invoiceItems)) {
        dataToUpdate.invoiceItems = {
            deleteMany: {},
            create: invoiceItems.map((item: InvoiceItem) => ({
                quantity: item.quantity,
                price: item.price,
                productId: item.productId,
            })),
        };
    }

    try {
        // 2. Perform the Update
        const updatedInvoice = await prisma.invoice.update({
            where: { id: id },
            data: dataToUpdate,
            include: {
                Customer: true,
                invoiceItems: { include: { Product: true } },
            },
        });

        // 3. CHECK FOR CANCELLATION & SEND NOTIFICATION
        if (status === "CANCELLED") {
            // Get the logged in user
            const user = getAuth(req);
            const cancelledBy = await prisma.user.findUnique({
                where: { clerkId: user.userId || "" },
                select: { firstName: true, lastName: true },
            });
            sendCancellationNotification(updatedInvoice, cancelledBy).catch(
                (err) => console.error("Notification Error:", err)
            );
        }

        res.status(200).json(updatedInvoice);
    } catch (error) {
        // console.error(error);
        res.status(500).json({ error: "Failed to update invoice" });
    }
};

async function sendCancellationNotification(invoice: any, cancelledBy: any) {
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
                workflowId: "invoice-cancelled",
                payload: {
                    invoiceName: invoice.invoiceName || "Unnamed Invoice",
                    totalAmount: String(invoice.totalAmount),
                    cancelledBy: `${cancelledBy.firstName} ${cancelledBy.lastName}`,
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

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // Route Method Dispatcher
    if (req.method === "PUT" || req.method === "PATCH") {
        return updateInvoice(req, res);
    }

    // ... Handle GET/DELETE etc. if needed ...
    res.status(405).json({ error: "Method not allowed" });
}

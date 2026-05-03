import { InvoiceItem } from "@/utils/typesDefinitions";
import { NextApiRequest, NextApiResponse } from "next";
import { masterPrisma, getTenantPrisma } from "@/utils/lib/prisma";
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

    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    if (!id) {
        return res.status(400).json({ error: "Invalid or missing invoice ID" });
    }

    try {
        // 1. Fetch User and Business context from Master DB
        const user = await masterPrisma.user.findUnique({
            where: { clerkId: userId },
            select: { businessId: true }
        });

        if (!user?.businessId) return res.status(404).json({ error: "Business not found" });

        const businessId = user.businessId;
        const tenantPrisma = await getTenantPrisma(businessId);

        // 2. Construct Update Data
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

        // 3. Perform the Update in Tenant DB
        const updatedInvoice = await tenantPrisma.invoice.update({
            where: { id: id },
            data: dataToUpdate,
            include: {
                Customer: true,
                invoiceItems: { include: { Product: true } },
            },
        });

        // 4. CHECK FOR CANCELLATION & SEND NOTIFICATION
        if (status === "CANCELLED") {
            const cancelledBy = await masterPrisma.user.findUnique({
                where: { clerkId: userId },
                select: { firstName: true, lastName: true },
            });
            sendCancellationNotification(updatedInvoice, cancelledBy, businessId).catch(
                (err) => console.error("Notification Error:", err)
            );
        }

        res.status(200).json(updatedInvoice);
    } catch (error) {
        console.error("Update Invoice Error:", error);
        res.status(500).json({ error: "Failed to update invoice" });
    }
};

async function sendCancellationNotification(invoice: any, cancelledBy: any, businessId: string) {
    const creator = await masterPrisma.user.findUnique({
        where: { clerkId: invoice.createdBy },
    });

    if (!creator) {
        console.error("Creator not found for notification");
        return;
    }

    const adminsAndManagers = await masterPrisma.user.findMany({
        where: {
            businessId: businessId,
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
                    cancelledBy: cancelledBy ? `${cancelledBy.firstName} ${cancelledBy.lastName}` : "Unknown User",
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

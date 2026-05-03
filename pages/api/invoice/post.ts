import type { NextApiRequest, NextApiResponse } from "next";
import { InvoiceItem } from "@/utils/typesDefinitions";
import { addCreatedBy } from "../middleware";
import { masterPrisma, getTenantPrisma } from "@/utils/lib/prisma";
import { Novu } from "@novu/api";
import { getAuth } from "@clerk/nextjs/server";
import { checkSubscription } from "@/utils/subscription/checkSubscription";
import { logAction } from "@/utils/server/audit";

const novu = new Novu({
    secretKey: process.env.NOVU_SECRET_KEY!,
});

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const { customerId, invoiceItems, totalAmount, mpesaDetails, paymentType } =
        req.body;

    const currentDate = new Date();
    const formattedDate = currentDate
        .toISOString()
        .replace("T", "-")
        .split(".")[0];
    const invoiceName = `Invoice-${formattedDate}`;

    const { userId } = getAuth(req);

    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const activeStoreHeader = req.headers["x-store-id"] as string;

    const { authorized, error: subError, businessId } = await checkSubscription(userId);

    if (!authorized) {
        return res.status(403).json({ error: subError });
    }

    const bId = businessId as string;

    // 1. Fetch User context from Master DB
    const dbUser = await masterPrisma.user.findUnique({
        where: { clerkId: userId },
        select: { id: true, businessId: true, role: true },
    });

    if (!dbUser || !dbUser.businessId) {
        return res.status(404).json({ error: "User or business not found" });
    }

    // 2. Get Tenant Prisma client
    const tenantPrisma = await getTenantPrisma(bId);

    // Fetch user store access from Tenant DB if not admin
    let targetStoreId = activeStoreHeader;
    if (dbUser.role !== "admin") {
        const tenantUser = await tenantPrisma.tenantUser.findUnique({
            where: { clerkId: userId },
            select: { storeId: true }
        });
        if (tenantUser?.storeId) targetStoreId = tenantUser.storeId;
    }

    if (!targetStoreId) {
        return res.status(400).json({ error: "No active store selected." });
    }

    try {
        if (customerId) {
            const customerExists = await tenantPrisma.customer.findUnique({
                where: { id: customerId },
            });
            if (!customerExists) {
                return res.status(400).json({ error: "Customer not found" });
            }
        }

        // Check for already linked items in Tenant DB
        const existingInvoiceItems = await tenantPrisma.invoiceItem.findMany({
            where: {
                id: { in: invoiceItems.map((item: InvoiceItem) => item.id) },
                invoiceId: { not: null },
            },
        });

        if (existingInvoiceItems.length > 0) {
            return res.status(400).json({
                error: "One or more invoice items are already linked to another invoice",
            });
        }

        // If paymentType is CASH, automatically mark as PAID.
        const invoiceStatus =
            paymentType === "CASH" ? "PAID" : (req.body.status ?? "PENDING");

        const invoiceData: any = {
            invoiceName,
            totalAmount: parseFloat(totalAmount),
            invoiceItems: {
                connect: invoiceItems.map((item: InvoiceItem) => ({
                    id: item.id,
                })),
            },
            paymentType: paymentType,
            status: invoiceStatus,
            createdBy: req.body.createdBy,
            businessId: bId, // Logical reference
            storeId: targetStoreId,
        };

        if (customerId) {
            invoiceData.customerId = customerId;
        }

        const invoice = await tenantPrisma.invoice.create({
            data: invoiceData,
        });

        // Log Audit Action (tenantPrisma)
        await logAction({
            action: "CREATE_INVOICE",
            entityType: "INVOICE",
            entityId: invoice.id,
            details: { invoiceName, totalAmount, paymentType, storeId: targetStoreId },
            userId: dbUser.id,
            businessId: bId,
            ipAddress: req.headers["x-forwarded-for"] as string || req.socket.remoteAddress,
            userAgent: req.headers["user-agent"],
        });

        // 3. Handle M-Pesa payment linking if applicable
        if (mpesaDetails && paymentType === "MPESA") {
            const parsedAmount = parseFloat(totalAmount);
            if (!isNaN(parsedAmount)) {
                try {
                    await tenantPrisma.mpesaPayment.create({
                        data: {
                            invoiceId: invoice.id,
                            businessId: bId,
                            userId: dbUser.id,
                            amount: parsedAmount,
                            phoneNumber: mpesaDetails.phoneNumber,
                            accountReference: "Salesense",
                            transactionDesc: "Invoice Payment",
                            merchantRequestId: mpesaDetails.merchantRequestId,
                            checkoutRequestId: mpesaDetails.checkoutRequestId,
                            status: "PENDING",
                        },
                    });
                } catch (mpesaError) {
                    console.error("Failed to link M-Pesa payment to invoice:", mpesaError);
                }
            }
        }

        // 4. Send Novu Notifications
        // Fetch creator and relevant team members from Master DB
        const creator = await masterPrisma.user.findUnique({
            where: { clerkId: req.body.createdBy },
        });

        if (creator) {
            const adminsAndManagers = await masterPrisma.user.findMany({
                where: {
                    businessId: bId,
                    OR: [
                        { role: { in: ["admin", "manager"] } },
                        { clerkId: creator.clerkId },
                    ],
                },
            });

            await Promise.allSettled(
                adminsAndManagers.map((recipient) =>
                    novu.trigger({
                        to: { subscriberId: recipient.clerkId },
                        workflowId: "invoice-generated",
                        payload: {
                            invoiceId: invoice.id,
                            invoiceName: invoice.invoiceName,
                            totalAmount: invoice.totalAmount,
                            createdBy: creator.firstName + " " + creator.lastName,
                        },
                    }).catch(err => console.error(`Failed to notify ${recipient.email}:`, err))
                )
            );
        }

        res.status(201).json(invoice);
    } catch (error) {
        console.error("Invoice Creation Error:", error);
        res.status(400).json({ error: "Failed to add or update invoice" });
    }
};

export const addInvoice = addCreatedBy(handler);


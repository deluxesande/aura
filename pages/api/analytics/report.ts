import type { NextApiRequest, NextApiResponse } from "next";
import { masterPrisma, getTenantPrisma } from "@/utils/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { userId } = getAuth(req);
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const activeStoreHeader = req.headers["x-store-id"] as string;

        // 1. Get current user context from Master DB
        const user = await masterPrisma.user.findUnique({
            where: { clerkId: userId },
            select: { businessId: true, role: true },
        });

        if (!user || !user.businessId) {
            return res.status(404).json({ error: "User or business not found" });
        }

        const businessId = user.businessId;
        const tenantPrisma = await getTenantPrisma(businessId);

        // Fetch Business User IDs for inclusive filtering
        const businessUsers = await masterPrisma.user.findMany({
            where: { businessId },
            select: { clerkId: true },
        });
        const userIds = businessUsers.map((u) => u.clerkId);

        // Fetch user store access from Tenant DB if not admin
        let targetStoreId = activeStoreHeader;
        if (user.role !== "admin") {
            const tenantUser = await tenantPrisma.tenantUser.findUnique({
                where: { clerkId: userId },
                select: { storeId: true }
            });
            if (tenantUser?.storeId) targetStoreId = tenantUser.storeId;
        }

        if (!targetStoreId) {
            return res.status(400).json({ error: "No active store selected." });
        }

        const { timePeriod } = req.query;
        let startDate = new Date(0);

        if (timePeriod && timePeriod !== "all") {
            const days = parseInt(timePeriod as string, 10);
            if (!isNaN(days)) {
                const now = new Date();
                startDate = new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    now.getDate() - days,
                    0,
                    0,
                    0,
                    0,
                );
            }
        }

        // 2. Fetch Operational Data from Tenant DB
        const [invoices, deliveries, expenses] = await Promise.all([
            tenantPrisma.invoice.findMany({
                where: {
                    storeId: targetStoreId,
                    createdAt: { gte: startDate },
                    status: { in: ["PAID", "paid", "COMPLETED", "completed"] },
                    isDeleted: false,
                    OR: [
                        { businessId: businessId },
                        { createdBy: { in: userIds } }
                    ]
                },
                include: {
                    Customer: { select: { firstName: true, lastName: true } },
                    invoiceItems: { include: { Product: { select: { name: true, sku: true } } } },
                },
                orderBy: { createdAt: "desc" },
            }),
            tenantPrisma.delivery.findMany({
                where: {
                    businessId: businessId,
                    storeId: targetStoreId,
                    createdAt: { gte: startDate },
                    status: "RECEIVED",
                },
                include: {
                    Supplier: { select: { name: true } },
                    Store: { select: { name: true } },
                },
                orderBy: { createdAt: "desc" },
            }),
            tenantPrisma.expense.findMany({
                where: {
                    businessId: businessId,
                    storeId: targetStoreId,
                    createdAt: { gte: startDate },
                    status: "ACTIVE",
                },
            })
        ]);

        // 4. Aggregation Engine
        let totalRevenue = 0;
        let mpesaTotal = 0;
        let cashTotal = 0;
        let totalStockValue = 0;
        let totalExpenses = 0;

        const productSales: Record<
            string,
            { name: string; sku: string; qty: number; revenue: number }
        > = {};
        const ledger: any[] = [];
        const deliveryLedger: any[] = [];

        invoices.forEach((inv) => {
            totalRevenue += inv.totalAmount;

            const pType = (inv.paymentType || "CASH").toUpperCase();

            if (pType === "MPESA") {
                mpesaTotal += inv.totalAmount;
            } else {
                cashTotal += inv.totalAmount;
            }

            const customerName = inv.Customer
                ? `${inv.Customer.firstName || ""} ${inv.Customer.lastName || ""}`.trim()
                : inv.invoiceName || "Walk-in";

            ledger.push({
                date: inv.createdAt.toISOString(),
                invoiceId: inv.id,
                customer: customerName || "Walk-in",
                method: pType,
                amount: inv.totalAmount,
            });

            inv.invoiceItems.forEach((item) => {
                const pid = item.productId;

                if (!productSales[pid]) {
                    productSales[pid] = {
                        name: item.Product?.name || "Unknown Product",
                        sku: item.Product?.sku || "-",
                        qty: 0,
                        revenue: 0,
                    };
                }

                productSales[pid].qty += item.quantity;
                productSales[pid].revenue += item.quantity * item.price;
            });
        });

        deliveries.forEach((d) => {
            totalStockValue += d.totalCost;
            deliveryLedger.push({
                date: d.createdAt.toISOString(),
                reference: d.reference || "N/A",
                supplier: d.Supplier?.name || "Direct/Cash",
                store: d.Store?.name || "Main",
                cost: d.totalCost,
            });
        });

        expenses.forEach((e) => {
            totalExpenses += e.amount;
        });

        const topProducts = Object.values(productSales).sort(
            (a, b) => b.revenue - a.revenue,
        );

        return res.status(200).json({
            summary: {
                totalRevenue,
                totalInvoices: invoices.length,
                mpesaTotal,
                cashTotal,
                totalStockValue,
                totalDeliveries: deliveries.length,
                totalExpenses,
            },
            ledger,
            topProducts,
            deliveries: deliveryLedger,
        });
    } catch (error) {
        console.error("Report Generation Error:", error);
        return res
            .status(500)
            .json({ error: "Failed to generate report data" });
    }
}

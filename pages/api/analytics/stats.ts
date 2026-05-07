import { masterPrisma, getTenantPrisma } from "@/utils/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "GET")
        return res.status(405).json({ error: "Method not allowed" });

    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    try {
        // 1. Get the business ID and role from Master DB
        const user = await masterPrisma.user.findUnique({
            where: { clerkId: userId },
            select: { businessId: true, role: true },
        });

        if (!user || !user.businessId) {
            return res.status(200).json({
                stats: { totalInvoices: 0, totalRevenue: 0, paidInvoices: 0, profit: 0, totalProcurement: 0, totalExpenses: 0 },
                percentageChanges: { totalInvoices: 0, totalRevenue: 0, paidInvoices: 0, profit: 0 },
                mpesaBalance: 0,
            });
        }

        const businessId = user.businessId;
        const tenantPrisma = await getTenantPrisma(businessId);
        const activeStoreHeader = req.headers["x-store-id"] as string;

        // Fetch user store info from Tenant DB if not admin
        let targetStoreId = activeStoreHeader;
        if (user.role !== "admin") {
            const tenantUser = await tenantPrisma.tenantUser.findUnique({
                where: { clerkId: userId },
                select: { storeId: true }
            });
            if (tenantUser?.storeId) targetStoreId = tenantUser.storeId;
        }

        // Fallback for admins if no store header is provided
        if (!targetStoreId && user.role === "admin") {
            const firstStore = await tenantPrisma.store.findFirst({
                where: { businessId, isActive: true },
                select: { id: true },
            });
            if (firstStore) targetStoreId = firstStore.id;
        }

        if (!targetStoreId) {
            return res.status(200).json({
                stats: { totalInvoices: 0, totalRevenue: 0, paidInvoices: 0, profit: 0, totalProcurement: 0, totalExpenses: 0 },
                percentageChanges: { totalInvoices: 0, totalRevenue: 0, paidInvoices: 0, profit: 0 },
                mpesaBalance: 0,
            });
        }

        // 2. Fetch Business User IDs for inclusive filtering
        const businessUsers = await masterPrisma.user.findMany({
            where: { businessId },
            select: { clerkId: true },
        });
        const userIds = businessUsers.map((u) => u.clerkId);

        // 3. Define Time Ranges (UTC)
        const { timePeriod } = req.query;
        const now = new Date();
        
        let statsStartDate: Date | undefined;
        if (timePeriod && timePeriod !== "all") {
            const days = parseInt(timePeriod as string);
            if (!isNaN(days)) {
                statsStartDate = new Date(
                    now.getUTCFullYear(),
                    now.getUTCMonth(),
                    now.getUTCDate() - days,
                    0, 0, 0, 0
                );
            }
        }

        const startOfToday = new Date(
            Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
        );
        const startOfYesterday = new Date(startOfToday);
        startOfYesterday.setUTCDate(startOfYesterday.getUTCDate() - 1);
        const endOfYesterday = new Date(startOfToday);

        // 4. Helper to fetch stats (Optional Date Range)
        const getStats = async (startDate?: Date, endDate?: Date) => {
            // Build Filter: If no dates provided, fetch ALL TIME
            const dateFilter: any = {};
            if (startDate) dateFilter.gte = startDate;
            if (endDate) dateFilter.lt = endDate;

            const whereClause: any = {
                businessId,
                storeId: targetStoreId,
            };

            const invoiceWhere: any = {
                storeId: targetStoreId,
                isDeleted: false,
                OR: [
                    { businessId: businessId },
                    { createdBy: { in: userIds } }
                ]
            };

            // Only add createdAt to query if dates are provided
            if (startDate || endDate) {
                invoiceWhere.createdAt = dateFilter;
                whereClause.createdAt = dateFilter;
            }

            // Fetch Invoices with items to calculate Gross Revenue
            const invoices = await tenantPrisma.invoice.findMany({
                where: {
                    ...invoiceWhere,
                    status: { in: ["PAID", "paid", "COMPLETED", "completed"] },
                },
                select: { 
                    totalAmount: true,
                    invoiceItems: {
                        select: { quantity: true, price: true }
                    }
                }
            });

            // Aggregate Totals (Invoices Count)
            const invoiceCount = await tenantPrisma.invoice.count({
                where: invoiceWhere,
            });

            // Aggregate Procurement (Deliveries)
            const deliveryData = await tenantPrisma.delivery.aggregate({
                where: {
                    ...whereClause,
                    status: "RECEIVED",
                },
                _sum: { totalCost: true },
            });

            // Aggregate Expenses
            const expenseData = await tenantPrisma.expense.aggregate({
                where: {
                    ...whereClause,
                    status: "ACTIVE",
                },
                _sum: { amount: true },
            });

            let totalRevenue = 0;
            invoices.forEach(inv => {
                inv.invoiceItems.forEach(item => {
                    totalRevenue += item.quantity * item.price;
                });
            });

            const totalProcurement = deliveryData._sum.totalCost || 0;
            const totalExpenses = expenseData._sum.amount || 0;

            return {
                totalInvoices: invoiceCount,
                paidInvoices: invoices.length,
                totalRevenue: totalRevenue,
                totalProcurement: totalProcurement,
                totalExpenses: totalExpenses,
                profit: totalRevenue - totalExpenses - totalProcurement,
            };
        };

        const [periodStats, todayStats, yesterdayStats, mpesaData, inventoryData] =
            await Promise.all([
                getStats(statsStartDate), // Period Stats
                getStats(startOfToday), // Today
                getStats(startOfYesterday, endOfYesterday), // Yesterday
                tenantPrisma.mpesaPayment.aggregate({
                    where: { 
                        businessId, 
                        status: "COMPLETED",
                        Invoice: {
                            storeId: targetStoreId,
                            isDeleted: false,
                        }
                    },
                    _sum: { amount: true },
                }),
                tenantPrisma.storeInventory.findMany({
                    where: { storeId: targetStoreId, Product: { isArchived: false } },
                    include: { Product: { select: { price: true } } }
                })
            ]);

        const currentInventoryValue = inventoryData.reduce((acc, inv) => acc + (inv.quantity * inv.Product.price), 0);

        // 5. Calculate Percentages (Velocity: Today vs Yesterday)
        const calcChange = (curr: number, prev: number) => {
            if (prev === 0) return curr > 0 ? 100 : 0;
            const change = ((curr - prev) / prev) * 100;
            return isFinite(change) ? change : (curr > 0 ? 100 : 0);
        };

        const finalStats = {
            ...periodStats,
            inventoryValue: currentInventoryValue,
        };

        res.status(200).json({
            stats: finalStats, // Returns filtered numbers for the main cards
            percentageChanges: {
                totalInvoices: calcChange(
                    todayStats.totalInvoices,
                    yesterdayStats.totalInvoices
                ),
                totalRevenue: calcChange(
                    todayStats.totalRevenue,
                    yesterdayStats.totalRevenue
                ),
                paidInvoices: calcChange(
                    todayStats.paidInvoices,
                    yesterdayStats.paidInvoices
                ),
                profit: calcChange(todayStats.profit, yesterdayStats.profit),
            },
            mpesaBalance: mpesaData._sum.amount || 0,
        });
    } catch (error) {
        console.error("Stats Error:", error);
        res.status(500).json({ error: "Failed to fetch stats" });
    }
}

import { prisma } from "@/utils/lib/client";
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
        // 1. Get the business ID, role and storeId
        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { businessId: true, role: true, storeId: true },
        });

        if (!user || !user.businessId) {
            return res.status(200).json({
                stats: {
                    totalInvoices: 0,
                    totalRevenue: 0,
                    paidInvoices: 0,
                    profit: 0,
                },
                percentageChanges: {
                    totalInvoices: 0,
                    totalRevenue: 0,
                    paidInvoices: 0,
                    profit: 0,
                },
                mpesaBalance: 0,
            });
        }

        const activeStoreHeader = req.headers["x-store-id"] as string;
        const targetStoreId = user.role === "admin" ? activeStoreHeader : (user.storeId as string);

        if (!targetStoreId) {
            return res.status(400).json({ error: "No active store selected." });
        }

        const businessId = user.businessId;

        // 2. Define Time Ranges
        const { timePeriod } = req.query;
        const now = new Date();
        
        let statsStartDate: Date | undefined;
        if (timePeriod && timePeriod !== "all") {
            const days = parseInt(timePeriod as string);
            if (!isNaN(days)) {
                statsStartDate = new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    now.getDate() - days,
                    0, 0, 0, 0
                );
            }
        }

        const startOfToday = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
        );
        const startOfYesterday = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() - 1
        );
        const endOfYesterday = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
        );

        // 3. Helper to fetch stats (Optional Date Range)
        const getStats = async (startDate?: Date, endDate?: Date) => {
            // Get all User IDs for this business
            const businessUsers = await prisma.user.findMany({
                where: { businessId },
                select: { clerkId: true },
            });
            const userIds = businessUsers.map((u) => u.clerkId);

            // Build Filter: If no dates provided, fetch ALL TIME
            const dateFilter: any = {};
            if (startDate) dateFilter.gte = startDate;
            if (endDate) dateFilter.lt = endDate;

            const whereClause: any = {
                businessId,
                storeId: targetStoreId,
            };

            const invoiceWhere: any = {
                ...whereClause,
                createdBy: { in: userIds },
                isDeleted: false,
            };

            // Only add createdAt to query if dates are provided
            if (startDate || endDate) {
                invoiceWhere.createdAt = dateFilter;
                whereClause.createdAt = dateFilter;
            }

            // Aggregate Totals (Invoices)
            const invoiceData = await prisma.invoice.aggregate({
                where: invoiceWhere,
                _count: { id: true }, // Total Invoices
            });

            // Aggregate Revenue (Paid Only)
            const paidData = await prisma.invoice.aggregate({
                where: {
                    ...invoiceWhere,
                    status: { in: ["PAID", "paid", "COMPLETED", "completed"] },
                },
                _count: { id: true }, // Paid Invoices count
                _sum: { totalAmount: true }, // Total Revenue
            });

            // Aggregate Procurement (Deliveries)
            const deliveryData = await prisma.delivery.aggregate({
                where: {
                    ...whereClause,
                    status: "RECEIVED",
                },
                _sum: { totalCost: true },
                _count: { id: true },
            });

            // Aggregate Expenses
            const expenseData = await prisma.expense.aggregate({
                where: {
                    ...whereClause,
                    status: "ACTIVE",
                },
                _sum: { amount: true },
            });

            const totalRevenue = paidData._sum.totalAmount || 0;
            const totalProcurement = deliveryData._sum.totalCost || 0;
            const totalExpenses = expenseData._sum.amount || 0;

            return {
                totalInvoices: invoiceData._count.id,
                paidInvoices: paidData._count.id,
                totalRevenue: totalRevenue,
                totalProcurement: totalProcurement,
                totalExpenses: totalExpenses,
                profit: totalRevenue - totalProcurement - totalExpenses,
            };
        };

        // 4. Execute Queries in Parallel
        const [periodStats, todayStats, yesterdayStats, mpesaData] =
            await Promise.all([
                getStats(statsStartDate), // Period Stats (Filtered by timePeriod if provided)
                getStats(startOfToday), // Today
                getStats(startOfYesterday, endOfYesterday), // Yesterday
                prisma.mpesaPayment.aggregate({
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
            ]);

        // 5. Calculate Percentages (Velocity: Today vs Yesterday)
        const calcChange = (curr: number, prev: number) => {
            if (prev === 0) return curr > 0 ? 100 : 0;
            return ((curr - prev) / prev) * 100;
        };

        res.status(200).json({
            stats: periodStats, // Returns filtered numbers for the main cards
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

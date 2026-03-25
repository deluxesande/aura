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
        const now = new Date();
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
                createdBy: { in: userIds },
                storeId: targetStoreId,
            };

            // Only add createdAt to query if dates are provided
            if (startDate || endDate) {
                whereClause.createdAt = dateFilter;
            }

            // Aggregate Totals
            const data = await prisma.invoice.aggregate({
                where: whereClause,
                _count: { id: true }, // Total Invoices
            });

            // Aggregate Revenue (Paid Only)
            const paidData = await prisma.invoice.aggregate({
                where: {
                    ...whereClause,
                    status: { in: ["PAID", "paid", "COMPLETED", "completed"] },
                },
                _count: { id: true }, // Paid Invoices count
                _sum: { totalAmount: true }, // Total Revenue
            });

            const totalRevenue = paidData._sum.totalAmount || 0;

            return {
                totalInvoices: data._count.id,
                paidInvoices: paidData._count.id,
                totalRevenue: totalRevenue,
                profit: totalRevenue * 0.3, // 30% Profit
            };
        };

        // 4. Execute Queries in Parallel
        // - allTimeStats: No date filters (Returns historical totals)
        // - todayStats & yesterdayStats: Used ONLY for calculating the "Trend" percentage
        const [allTimeStats, todayStats, yesterdayStats, mpesaData] =
            await Promise.all([
                getStats(), // All Time
                getStats(startOfToday), // Today
                getStats(startOfYesterday, endOfYesterday), // Yesterday
                prisma.mpesaPayment.aggregate({
                    where: { 
                        businessId, 
                        status: "COMPLETED",
                        Invoice: {
                            storeId: targetStoreId
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
            stats: allTimeStats, // Returns ALL TIME numbers for the main cards
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

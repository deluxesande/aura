import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/utils/lib/client";

interface AnalyticsData {
    labels: string[];
    data: number[];
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { userId } = getAuth(req);

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // Get current user with their business
        const currentUser = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { businessId: true },
        });

        if (!currentUser || !currentUser.businessId) {
            return res
                .status(404)
                .json({ error: "User or business not found" });
        }

        // Get all users in the same business
        const businessUsers = await prisma.user.findMany({
            where: { businessId: currentUser.businessId },
            select: { clerkId: true },
        });

        const userIds = businessUsers.map((user) => user.clerkId);

        // Get time period from query parameter (default to 7 days)
        const timePeriod = parseInt(req.query.timePeriod as string) || 7;

        // Fetch invoices created by users in the same business
        const invoices = await prisma.invoice.findMany({
            where: {
                createdBy: {
                    in: userIds,
                },
                status: "PENDING", // Filter by PENDING status
            },
            select: {
                id: true,
                createdAt: true,
                totalAmount: true,
                status: true,
            },
        });

        // Filter by time period
        const now = new Date();
        const startDate = new Date();
        startDate.setUTCDate(now.getUTCDate() - timePeriod);

        const filteredInvoices = invoices.filter((invoice) => {
            const invoiceDate = new Date(invoice.createdAt);
            return invoiceDate >= startDate && invoiceDate <= now;
        });

        let labels: string[] = [];
        let revenueData: number[] = [];

        if (timePeriod === 7) {
            // Group by day for 7 days
            const dailyRevenue = new Array(7).fill(0);
            const dayLabels: string[] = [];

            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setUTCDate(date.getUTCDate() - i);
                dayLabels.push(
                    date.toLocaleDateString("en-US", {
                        weekday: "short",
                    })
                );
            }

            filteredInvoices.forEach((invoice) => {
                const invoiceDate = new Date(invoice.createdAt);
                const invoiceDateOnly = new Date(
                    invoiceDate.getUTCFullYear(),
                    invoiceDate.getUTCMonth(),
                    invoiceDate.getUTCDate()
                );
                const nowDateOnly = new Date(
                    now.getUTCFullYear(),
                    now.getUTCMonth(),
                    now.getUTCDate()
                );

                const daysDiff = Math.floor(
                    (nowDateOnly.getTime() - invoiceDateOnly.getTime()) /
                        (1000 * 60 * 60 * 24)
                );
                const index = 6 - daysDiff;
                if (index >= 0 && index < 7) {
                    dailyRevenue[index] += invoice.totalAmount;
                }
            });

            labels = dayLabels;
            revenueData = dailyRevenue.map((amount) =>
                Math.round(amount / 1000)
            );
        } else if (timePeriod === 30) {
            // Group by week for 30 days
            const weeklyRevenue = new Array(4).fill(0);
            const weekLabels: string[] = [];

            for (let i = 3; i >= 0; i--) {
                const weekEnd = new Date();
                weekEnd.setUTCDate(weekEnd.getUTCDate() - i * 7);
                const weekStart = new Date(weekEnd);
                weekStart.setUTCDate(weekStart.getUTCDate() - 6);

                weekLabels.push(
                    `${weekStart.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                    })} - ${weekEnd.toLocaleDateString("en-US", {
                        day: "numeric",
                    })}`
                );
            }

            filteredInvoices.forEach((invoice) => {
                const invoiceDate = new Date(invoice.createdAt);
                const invoiceDateOnly = new Date(
                    invoiceDate.getUTCFullYear(),
                    invoiceDate.getUTCMonth(),
                    invoiceDate.getUTCDate()
                );
                const nowDateOnly = new Date(
                    now.getUTCFullYear(),
                    now.getUTCMonth(),
                    now.getUTCDate()
                );

                const daysDiff = Math.floor(
                    (nowDateOnly.getTime() - invoiceDateOnly.getTime()) /
                        (1000 * 60 * 60 * 24)
                );
                const weekIndex = Math.floor(daysDiff / 7);
                const index = 3 - weekIndex;
                if (index >= 0 && index < 4) {
                    weeklyRevenue[index] += invoice.totalAmount;
                }
            });

            labels = weekLabels;
            revenueData = weeklyRevenue.map((amount) =>
                Math.round(amount / 1000)
            );
        } else if (timePeriod === 90) {
            // Group by month for 90 days
            const monthlyRevenue = new Array(3).fill(0);
            const monthLabels: string[] = [];

            for (let i = 2; i >= 0; i--) {
                const date = new Date();
                date.setUTCMonth(date.getUTCMonth() - i);
                monthLabels.push(
                    date.toLocaleDateString("en-US", { month: "short" })
                );
            }

            filteredInvoices.forEach((invoice) => {
                const invoiceDate = new Date(invoice.createdAt);
                const monthsDiff =
                    (now.getUTCFullYear() - invoiceDate.getUTCFullYear()) * 12 +
                    now.getUTCMonth() -
                    invoiceDate.getUTCMonth();
                const index = 2 - monthsDiff;
                if (index >= 0 && index < 3) {
                    monthlyRevenue[index] += invoice.totalAmount;
                }
            });

            labels = monthLabels;
            revenueData = monthlyRevenue.map((amount) =>
                Math.round(amount / 1000)
            );
        } else if (timePeriod === 365) {
            // Group by month for 1 year
            const monthlyRevenue = new Array(12).fill(0);
            const monthLabels: string[] = [];

            for (let i = 11; i >= 0; i--) {
                const date = new Date();
                date.setUTCMonth(date.getUTCMonth() - i);
                monthLabels.push(
                    date.toLocaleDateString("en-US", { month: "short" })
                );
            }

            filteredInvoices.forEach((invoice) => {
                const invoiceDate = new Date(invoice.createdAt);
                const monthsDiff =
                    (now.getUTCFullYear() - invoiceDate.getUTCFullYear()) * 12 +
                    now.getUTCMonth() -
                    invoiceDate.getUTCMonth();
                const index = 11 - monthsDiff;
                if (index >= 0 && index < 12) {
                    monthlyRevenue[index] += invoice.totalAmount;
                }
            });

            labels = monthLabels;
            revenueData = monthlyRevenue.map((amount) =>
                Math.round(amount / 1000)
            );
        }

        const analyticsData: AnalyticsData = {
            labels,
            data: revenueData,
        };

        res.status(200).json(analyticsData);
    } catch (error) {
        console.error("Error fetching invoice analytics:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

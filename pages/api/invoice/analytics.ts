import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/utils/lib/client";
import { getTenantPrisma } from "@/utils/lib/prisma";

interface AnalyticsData {
    labels: string[];
    revenue: number[];
    profit: number[];
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

        const activeStoreHeader = req.headers["x-store-id"] as string;

        // Get current user with their business and role
        const currentUser = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { businessId: true, role: true, storeId: true },
        });

        if (!currentUser || !currentUser.businessId) {
            return res
                .status(404)
                .json({ error: "User or business not found" });
        }

        const tenantPrisma = await getTenantPrisma(currentUser.businessId);

        let targetStoreId = currentUser.role === "admin" ? activeStoreHeader : (currentUser.storeId as string);

        // Fallback for admins if no store header is provided
        if (!targetStoreId && currentUser.role === "admin") {
            const firstStore = await tenantPrisma.store.findFirst({
                where: { businessId: currentUser.businessId, isActive: true },
                select: { id: true },
            });
            if (firstStore) targetStoreId = firstStore.id;
        }

        if (!targetStoreId) {
            return res.status(200).json({
                labels: [],
                revenue: [],
                profit: [],
            });
        }

        // Get all users in the same business
        const businessUsers = await prisma.user.findMany({
            where: { businessId: currentUser.businessId },
            select: { clerkId: true },
        });

        const userIds = businessUsers.map((user) => user.clerkId);

        // Get time period from query parameter (default to 7 days)
        const timePeriod = parseInt(req.query.timePeriod as string) || 7;

        // Filter by time period - use start of day for consistent results
        const now = new Date();
        const startDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() - timePeriod,
            0,
            0,
            0,
            0,
        );

        // Fetch Invoices, Deliveries and Expenses in parallel
        const [invoices, deliveries, expenses] = await Promise.all([
            tenantPrisma.invoice.findMany({
                where: {
                    createdBy: { in: userIds },
                    storeId: targetStoreId,
                    status: { in: ["PAID", "paid", "COMPLETED", "completed"] },
                    isDeleted: false,
                    createdAt: { gte: startDate },
                },
                select: { createdAt: true, totalAmount: true },
            }),
            tenantPrisma.delivery.findMany({
                where: {
                    businessId: currentUser.businessId,
                    storeId: targetStoreId,
                    status: "RECEIVED",
                    createdAt: { gte: startDate },
                },
                select: { createdAt: true, totalCost: true },
            }),
            tenantPrisma.expense.findMany({
                where: {
                    businessId: currentUser.businessId,
                    storeId: targetStoreId,
                    status: "ACTIVE",
                    createdAt: { gte: startDate },
                },
                select: { createdAt: true, amount: true },
            }),
        ]);

        let labels: string[] = [];
        let revenueData: number[] = [];
        let profitData: number[] = [];

        const getIndex = (date: Date) => {
            const invoiceDateOnly = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
            const nowDateOnly = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
            const daysDiff = Math.floor((nowDateOnly.getTime() - invoiceDateOnly.getTime()) / (1000 * 60 * 60 * 24));
            
            if (timePeriod === 7) return 6 - daysDiff;
            if (timePeriod === 30) return 3 - Math.floor(daysDiff / 7);
            if (timePeriod === 90) {
                const monthsDiff = (now.getUTCFullYear() - date.getUTCFullYear()) * 12 + now.getUTCMonth() - date.getUTCMonth();
                return 2 - monthsDiff;
            }
            if (timePeriod === 365) {
                const monthsDiff = (now.getUTCFullYear() - date.getUTCFullYear()) * 12 + now.getUTCMonth() - date.getUTCMonth();
                return 11 - monthsDiff;
            }
            return -1;
        };

        const numSlots = timePeriod === 7 ? 7 : timePeriod === 30 ? 4 : timePeriod === 90 ? 3 : 12;
        revenueData = new Array(numSlots).fill(0);
        const procurementData = new Array(numSlots).fill(0);
        const expenseData = new Array(numSlots).fill(0);

        invoices.forEach(inv => {
            const idx = getIndex(new Date(inv.createdAt));
            if (idx >= 0 && idx < numSlots) revenueData[idx] += inv.totalAmount;
        });

        deliveries.forEach(d => {
            const idx = getIndex(new Date(d.createdAt));
            if (idx >= 0 && idx < numSlots) procurementData[idx] += d.totalCost;
        });

        expenses.forEach(e => {
            const idx = getIndex(new Date(e.createdAt));
            if (idx >= 0 && idx < numSlots) expenseData[idx] += e.amount;
        });

        profitData = revenueData.map((rev, i) => rev - procurementData[i] - expenseData[i]);

        // Generate Labels
        if (timePeriod === 7) {
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setUTCDate(date.getUTCDate() - i);
                labels.push(date.toLocaleDateString("en-US", { weekday: "short" }));
            }
        } else if (timePeriod === 30) {
            for (let i = 3; i >= 0; i--) {
                const weekEnd = new Date();
                weekEnd.setUTCDate(weekEnd.getUTCDate() - i * 7);
                const weekStart = new Date(weekEnd);
                weekStart.setUTCDate(weekStart.getUTCDate() - 6);
                labels.push(`${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${weekEnd.toLocaleDateString("en-US", { day: "numeric" })}`);
            }
        } else {
            const months = timePeriod === 90 ? 3 : 12;
            for (let i = months - 1; i >= 0; i--) {
                const date = new Date();
                date.setUTCMonth(date.getUTCMonth() - i);
                labels.push(date.toLocaleDateString("en-US", { month: "short" }));
            }
        }

        res.status(200).json({
            labels,
            revenue: revenueData.map(v => Math.round(v)),
            profit: profitData.map(v => Math.round(v)),
        });
    } catch (error) {
        console.error("Error fetching invoice analytics:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

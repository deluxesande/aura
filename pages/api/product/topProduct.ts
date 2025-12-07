import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/utils/lib/client";
import { getAuth } from "@clerk/nextjs/server";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === "GET") {
        try {
            // 1. Check authentication
            const { userId } = getAuth(req);

            if (!userId) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            // 2. Get current user with their business
            const currentUser = await prisma.user.findUnique({
                where: { clerkId: userId },
                select: { businessId: true },
            });

            if (!currentUser || !currentUser.businessId) {
                return res
                    .status(404)
                    .json({ error: "User or business not found" });
            }

            // 3. Get all users in the same business
            const businessUsers = await prisma.user.findMany({
                where: { businessId: currentUser.businessId },
                select: { clerkId: true },
            });

            const userIds = businessUsers.map((user) => user.clerkId);

            const { timePeriod = "30" } = req.query;
            const days = parseInt(timePeriod as string);

            // Calculate start date based on time period
            const now = new Date();
            const today = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate()
            );

            let startDate: Date;
            let endDate: Date;

            if (days === 365) {
                // For 365 days, start from January 1st of current year
                startDate = new Date(now.getFullYear(), 0, 1);
            } else if (days === 90) {
                // For 90 days, start from 3 months ago
                startDate = new Date(today);
                startDate.setMonth(today.getMonth() - 2);
                startDate.setDate(1);
            } else {
                // For 7 and 30 days, use the standard calculation
                startDate = new Date(today);
                startDate.setDate(today.getDate() - days + 1);
            }

            // Set end date to end of today
            endDate = new Date(today);
            endDate.setHours(23, 59, 59, 999);

            // 4. Fetch invoices with their items within the time period
            const invoices = await prisma.invoice.findMany({
                where: {
                    createdBy: {
                        in: userIds,
                    },
                    createdAt: {
                        gte: startDate,
                        lte: endDate,
                    },
                    status: "PENDING",
                },
                include: {
                    invoiceItems: {
                        include: {
                            Product: true,
                        },
                    },
                },
            });

            // Helper function to get week start (Monday)
            const getWeekStart = (date: Date): string => {
                const d = new Date(date);
                const day = d.getDay();
                // Adjust: Sunday=0, Monday=1, ..., Saturday=6
                // We want Monday, so: if Sunday (0), subtract 6; if Monday (1), subtract 0; if Tuesday (2), subtract 1, etc.
                const daysToSubtract = day === 0 ? 6 : day - 1;
                d.setDate(d.getDate() - daysToSubtract);
                return d.toISOString().split("T")[0];
            };

            // Group products by time period
            const getTimePeriodKey = (date: Date, days: number): string => {
                const dateOnly = new Date(
                    date.getFullYear(),
                    date.getMonth(),
                    date.getDate()
                );

                if (days === 7) {
                    // Daily for 7-day period
                    return dateOnly.toISOString().split("T")[0];
                } else if (days === 30) {
                    // Weekly for 30-day period (Monday start)
                    return getWeekStart(dateOnly);
                } else if (days === 90) {
                    // Monthly for 90-day period
                    return `${dateOnly.getFullYear()}-${String(
                        dateOnly.getMonth() + 1
                    ).padStart(2, "0")}`;
                } else if (days === 365) {
                    // Monthly for 365-day period
                    return `${dateOnly.getFullYear()}-${String(
                        dateOnly.getMonth() + 1
                    ).padStart(2, "0")}`;
                }
                return dateOnly.toISOString().split("T")[0];
            };

            // Generate all time period keys for the range
            const generateAllPeriodKeys = (
                startDate: Date,
                endDate: Date,
                days: number
            ): string[] => {
                const keys: string[] = [];
                const current = new Date(startDate);

                if (days === 7) {
                    // Daily grouping for 7 day periods
                    while (current <= endDate) {
                        keys.push(current.toISOString().split("T")[0]);
                        current.setDate(current.getDate() + 1);
                    }
                } else if (days === 30) {
                    // Weekly grouping for 30-day period (Monday-based)
                    const weekStarts = new Set<string>();
                    const temp = new Date(startDate);
                    while (temp <= endDate) {
                        weekStarts.add(getWeekStart(temp));
                        temp.setDate(temp.getDate() + 1);
                    }
                    keys.push(...Array.from(weekStarts).sort());
                } else if (days === 90) {
                    // Monthly grouping for 90-day period - 3 months
                    const startMonth = current.getMonth();
                    for (let i = 0; i < 3; i++) {
                        keys.push(
                            `${current.getFullYear()}-${String(
                                current.getMonth() + 1
                            ).padStart(2, "0")}`
                        );
                        current.setMonth(current.getMonth() + 1);
                    }
                } else if (days === 365) {
                    // Monthly grouping for 365-day period - all 12 months of current year
                    const year = current.getFullYear();
                    for (let i = 1; i <= 12; i++) {
                        keys.push(`${year}-${String(i).padStart(2, "0")}`);
                    }
                }

                return keys;
            };

            // Calculate product sales grouped by time period
            const productSalesByPeriod: {
                [period: string]: {
                    [productId: string]: {
                        product: any;
                        quantity: number;
                        revenue: number;
                    };
                };
            } = {};

            // Initialize all periods with empty products
            const allPeriodKeys = generateAllPeriodKeys(
                startDate,
                endDate,
                days
            );
            allPeriodKeys.forEach((key) => {
                productSalesByPeriod[key] = {};
            });

            // Aggregate invoice items by period
            invoices.forEach((invoice) => {
                const periodKey = getTimePeriodKey(
                    new Date(invoice.createdAt),
                    days
                );

                if (!productSalesByPeriod[periodKey]) {
                    productSalesByPeriod[periodKey] = {};
                }

                invoice.invoiceItems.forEach((item) => {
                    const productId = item.productId;

                    if (!productSalesByPeriod[periodKey][productId]) {
                        productSalesByPeriod[periodKey][productId] = {
                            product: item.Product,
                            quantity: 0,
                            revenue: 0,
                        };
                    }

                    productSalesByPeriod[periodKey][productId].quantity +=
                        item.quantity;
                    productSalesByPeriod[periodKey][productId].revenue +=
                        item.price * item.quantity;
                });
            });

            // Return each period with top 2 sold products
            const result = allPeriodKeys.map((periodKey) => {
                const periodProducts = Object.values(
                    productSalesByPeriod[periodKey]
                )
                    .map((sale) => ({
                        ...sale.product,
                        soldQuantity: sale.quantity,
                        totalRevenue: sale.revenue,
                    }))
                    .sort(
                        (a, b) => (b.soldQuantity || 0) - (a.soldQuantity || 0)
                    )
                    .slice(0, 2); // Get top 2 for this period

                return {
                    period: periodKey,
                    products: periodProducts,
                };
            });

            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({
                error: "Failed to fetch top products",
                message:
                    error instanceof Error ? error.message : "Unknown error",
            });
        }
    } else {
        return res.status(405).json({ error: "Method not allowed" });
    }
}

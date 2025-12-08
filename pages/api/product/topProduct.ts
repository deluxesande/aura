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

            // Helper function to format local date as YYYY-MM-DD
            const formatLocalDate = (date: Date): string => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, "0");
                const day = String(date.getDate()).padStart(2, "0");
                return `${year}-${month}-${day}`;
            };

            // Helper function to get week start (Monday) as local date
            const getWeekStart = (date: Date): string => {
                const d = new Date(
                    date.getFullYear(),
                    date.getMonth(),
                    date.getDate()
                );
                const day = d.getDay();
                const daysToSubtract = day === 0 ? 6 : day - 1;
                d.setDate(d.getDate() - daysToSubtract);
                return formatLocalDate(d);
            };

            // Calculate start and end dates in local time
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
                startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
                endDate = new Date(
                    today.getFullYear(),
                    today.getMonth(),
                    today.getDate(),
                    23,
                    59,
                    59,
                    999
                );
            } else if (days === 90) {
                // For 90 days, start from 3 months ago
                startDate = new Date(
                    today.getFullYear(),
                    today.getMonth() - 2,
                    1,
                    0,
                    0,
                    0,
                    0
                );
                endDate = new Date(
                    today.getFullYear(),
                    today.getMonth(),
                    today.getDate(),
                    23,
                    59,
                    59,
                    999
                );
            } else {
                // For 7 and 30 days, calculate from today
                startDate = new Date(today);
                startDate.setDate(today.getDate() - (days - 1));
                startDate.setHours(0, 0, 0, 0);

                endDate = new Date(today);
                endDate.setHours(23, 59, 59, 999);
            }

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

            // console.log("DEBUG - Date Range:", { startDate, endDate, days });
            // console.log("DEBUG - User IDs:", userIds);
            // console.log("DEBUG - Invoices Found:", invoices.length);
            // invoices.forEach((inv) => {
            //     console.log("Invoice:", {
            //         id: inv.id,
            //         createdAt: inv.createdAt,
            //         status: inv.status,
            //         itemCount: inv.invoiceItems.length,
            //     });
            // });

            // Group products by time period using local dates
            const getTimePeriodKey = (date: Date, days: number): string => {
                const localDate = new Date(date);

                if (days === 7) {
                    // Daily for 7-day period
                    return formatLocalDate(localDate);
                } else if (days === 30) {
                    // Weekly for 30-day period (Monday start)
                    return getWeekStart(localDate);
                } else if (days === 90 || days === 365) {
                    // Monthly for 90 and 365-day periods
                    return `${localDate.getFullYear()}-${String(
                        localDate.getMonth() + 1
                    ).padStart(2, "0")}`;
                }
                return formatLocalDate(localDate);
            };

            // Generate all time period keys for the range
            const generateAllPeriodKeys = (
                startDate: Date,
                endDate: Date,
                days: number
            ): string[] => {
                const keys: string[] = [];
                const current = new Date(
                    startDate.getFullYear(),
                    startDate.getMonth(),
                    startDate.getDate()
                );

                if (days === 7) {
                    // Daily grouping for 7 day periods
                    while (current <= endDate) {
                        keys.push(formatLocalDate(current));
                        current.setDate(current.getDate() + 1);
                    }
                } else if (days === 30) {
                    // Weekly grouping for 30-day period - return exactly 4 weeks
                    // Start from the most recent Monday before or on endDate
                    const endWeekStart = new Date(
                        endDate.getFullYear(),
                        endDate.getMonth(),
                        endDate.getDate()
                    );
                    const endDay = endWeekStart.getDay();
                    const daysToSubtract = endDay === 0 ? 6 : endDay - 1;
                    endWeekStart.setDate(
                        endWeekStart.getDate() - daysToSubtract
                    );

                    // Generate exactly 4 weeks going backwards
                    for (let i = 3; i >= 0; i--) {
                        const weekStart = new Date(endWeekStart);
                        weekStart.setDate(endWeekStart.getDate() - i * 7);
                        keys.push(formatLocalDate(weekStart));
                    }
                } else if (days === 90) {
                    // Monthly grouping for 90-day period - 3 months
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

import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/utils/lib/client";
import { getAuth } from "@clerk/nextjs/server";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === "GET") {
        try {
            const { userId } = getAuth(req);

            if (!userId) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            const activeStoreHeader = req.headers["x-store-id"] as string;

            const currentUser = await prisma.user.findUnique({
                where: { clerkId: userId },
                select: { businessId: true, role: true, storeId: true },
            });

            if (!currentUser || !currentUser.businessId) {
                return res
                    .status(404)
                    .json({ error: "User or business not found" });
            }

            let targetStoreId = currentUser.role === "admin" ? activeStoreHeader : (currentUser.storeId as string);

            // Fallback for admins if no store header is provided
            if (!targetStoreId && currentUser.role === "admin") {
                const firstStore = await prisma.store.findFirst({
                    where: { businessId: currentUser.businessId, isActive: true },
                    select: { id: true },
                });
                if (firstStore) targetStoreId = firstStore.id;
            }

            if (!targetStoreId) {
                return res.status(200).json([]);
            }

            const businessUsers = await prisma.user.findMany({
                where: { businessId: currentUser.businessId },
                select: { clerkId: true },
            });

            const userIds = businessUsers.map((user) => user.clerkId);

            const { timePeriod = "30" } = req.query;
            const days = parseInt(timePeriod as string);
            
            // ... (rest of date logic)
            
            const formatLocalDate = (date: Date): string => {
                const year = date.getUTCFullYear();
                const month = String(date.getUTCMonth() + 1).padStart(2, "0");
                const day = String(date.getUTCDate()).padStart(2, "0");
                return `${year}-${month}-${day}`;
            };

            const getWeekStart = (date: Date): string => {
                const d = new Date(
                    date.getUTCFullYear(),
                    date.getUTCMonth(),
                    date.getUTCDate()
                );
                const day = d.getDay();
                const daysToSubtract = day === 0 ? 6 : day - 1;
                d.setUTCDate(d.getUTCDate() - daysToSubtract);
                return formatLocalDate(d);
            };

            const now = new Date();
            const today = new Date(
                now.getUTCFullYear(),
                now.getUTCMonth(),
                now.getUTCDate()
            );

            let startDate: Date;
            let endDate: Date;

            if (days === 365) {
                startDate = new Date(today);
                startDate.setUTCMonth(startDate.getUTCMonth() - 11);
                startDate.setUTCDate(1);
                startDate.setHours(0, 0, 0, 0);

                endDate = new Date(today);
                endDate.setHours(23, 59, 59, 999);
            } else if (days === 90) {
                startDate = new Date(
                    today.getUTCFullYear(),
                    today.getUTCMonth() - 2,
                    1,
                    0,
                    0,
                    0,
                    0
                );
                endDate = new Date(
                    today.getUTCFullYear(),
                    today.getUTCMonth(),
                    today.getUTCDate(),
                    23,
                    59,
                    59,
                    999
                );
            } else {
                startDate = new Date(today);
                startDate.setUTCDate(today.getUTCDate() - (days - 1));
                startDate.setHours(0, 0, 0, 0);

                endDate = new Date(today);
                endDate.setHours(23, 59, 59, 999);
            }

            const invoices = await prisma.invoice.findMany({
                where: {
                    createdBy: { in: userIds },
                    storeId: targetStoreId,
                    createdAt: { gte: startDate, lte: endDate },
                    status: { in: ["PAID", "paid", "COMPLETED", "completed"] },
                    isDeleted: false,
                },
                include: {
                    invoiceItems: {
                        include: { Product: true },
                    },
                },
            });

            const getTimePeriodKey = (date: Date, days: number): string => {
                const localDate = new Date(date);

                if (days === 7) {
                    return formatLocalDate(localDate);
                } else if (days === 30) {
                    return getWeekStart(localDate);
                } else if (days === 90 || days === 365) {
                    return `${localDate.getUTCFullYear()}-${String(
                        localDate.getUTCMonth() + 1
                    ).padStart(2, "0")}`;
                }
                return formatLocalDate(localDate);
            };

            const generateAllPeriodKeys = (
                startDate: Date,
                endDate: Date,
                days: number
            ): string[] => {
                const keys: string[] = [];
                const current = new Date(
                    startDate.getUTCFullYear(),
                    startDate.getUTCMonth(),
                    startDate.getUTCDate()
                );

                if (days === 7) {
                    while (current <= endDate) {
                        keys.push(formatLocalDate(current));
                        current.setUTCDate(current.getUTCDate() + 1);
                    }
                } else if (days === 30) {
                    const endWeekStart = new Date(
                        endDate.getUTCFullYear(),
                        endDate.getUTCMonth(),
                        endDate.getUTCDate()
                    );
                    const endDay = endWeekStart.getDay();
                    const daysToSubtract = endDay === 0 ? 6 : endDay - 1;
                    endWeekStart.setUTCDate(
                        endWeekStart.getUTCDate() - daysToSubtract
                    );

                    for (let i = 3; i >= 0; i--) {
                        const weekStart = new Date(endWeekStart);
                        weekStart.setUTCDate(endWeekStart.getUTCDate() - i * 7);
                        keys.push(formatLocalDate(weekStart));
                    }
                } else if (days === 90) {
                    for (let i = 0; i < 3; i++) {
                        keys.push(
                            `${current.getUTCFullYear()}-${String(
                                current.getUTCMonth() + 1
                            ).padStart(2, "0")}`
                        );
                        current.setUTCMonth(current.getUTCMonth() + 1);
                    }
                } else if (days === 365) {
                    for (let i = 0; i < 12; i++) {
                        keys.push(
                            `${current.getUTCFullYear()}-${String(
                                current.getUTCMonth() + 1
                            ).padStart(2, "0")}`
                        );
                        current.setUTCMonth(current.getUTCMonth() + 1);
                    }
                }

                return keys;
            };

            const productSalesByPeriod: any = {};
            const allPeriodKeys = generateAllPeriodKeys(
                startDate,
                endDate,
                days
            );

            allPeriodKeys.forEach((key) => {
                productSalesByPeriod[key] = {};
            });

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

            const result = allPeriodKeys.map((periodKey) => {
                const periodProducts = Object.values(
                    productSalesByPeriod[periodKey]
                )
                    // @ts-ignore
                    .map((sale: any) => ({
                        id: sale.product.id,
                        name: sale.product.name,
                        price: sale.product.price,
                        soldQuantity: sale.quantity,
                        totalRevenue: sale.revenue,
                    }))
                    .sort(
                        (a: any, b: any) =>
                            (b.soldQuantity || 0) - (a.soldQuantity || 0)
                    )
                    .slice(0, 2);

                return {
                    period: periodKey,
                    products: periodProducts,
                };
            });
            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({ error: "Failed to fetch data" });
        }
    } else {
        return res.status(405).json({ error: "Method not allowed" });
    }
}

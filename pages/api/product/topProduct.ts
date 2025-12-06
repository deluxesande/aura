import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/utils/lib/client";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === "GET") {
        try {
            const { timePeriod = "30" } = req.query;
            const days = parseInt(timePeriod as string);

            // Calculate start date based on time period
            const now = new Date();
            const today = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate()
            );
            const startDate = new Date(today);
            startDate.setDate(today.getDate() - days);

            // Fetch invoices with their items within the time period
            const invoices = await prisma.invoice.findMany({
                where: {
                    createdAt: {
                        gte: startDate,
                        lte: today,
                    },
                    status: "PENDING", // TODO: Only count paid invoices
                },
                include: {
                    invoiceItems: {
                        include: {
                            Product: true,
                        },
                    },
                },
            });

            // Calculate product sales
            const productSales: {
                [key: string]: {
                    product: any;
                    quantity: number;
                    revenue: number;
                };
            } = {};

            invoices.forEach((invoice) => {
                invoice.invoiceItems.forEach((item) => {
                    const productId = item.productId;

                    if (!productSales[productId]) {
                        productSales[productId] = {
                            product: item.Product,
                            quantity: 0,
                            revenue: 0,
                        };
                    }

                    productSales[productId].quantity += item.quantity;
                    productSales[productId].revenue +=
                        item.price * item.quantity;
                });
            });

            // Convert to array and sort by quantity sold
            const topProducts = Object.values(productSales)
                .map((sale) => ({
                    ...sale.product,
                    soldQuantity: sale.quantity,
                    totalRevenue: sale.revenue,
                }))
                .sort((a, b) => b.soldQuantity - a.soldQuantity)
                .slice(0, 5); // Get top 5 products

            return res.status(200).json(topProducts);
        } catch (error) {
            // console.error("Error fetching top products:", error);
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

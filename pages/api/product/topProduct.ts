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
            const startDate = new Date(today);
            startDate.setDate(today.getDate() - days);

            // 4. Fetch invoices with their items within the time period
            // ONLY for users in the same business
            const invoices = await prisma.invoice.findMany({
                where: {
                    createdBy: {
                        in: userIds, // ← THIS IS THE KEY FILTER
                    },
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

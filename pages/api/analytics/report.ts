import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/utils/lib/client";
import { getAuth } from "@clerk/nextjs/server";
import { checkSubscription } from "@/utils/subscription/checkSubscription";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { userId } = getAuth(req);
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const { authorized, businessId } = await checkSubscription(userId);
        if (!authorized || !businessId) {
            return res
                .status(403)
                .json({ error: "Unauthorized or no business linked" });
        }

        const { timePeriod } = req.query;
        let startDate = new Date(0);

        if (timePeriod && timePeriod !== "all") {
            const days = parseInt(timePeriod as string, 10);
            if (!isNaN(days)) {
                startDate = new Date();
                startDate.setDate(startDate.getDate() - days);
            }
        }

        const invoices = await prisma.invoice.findMany({
            where: {
                businessId: businessId as string,
                createdAt: { gte: startDate },
                status: "PAID",
            },
            include: {
                Customer: {
                    select: { firstName: true, lastName: true },
                },
                invoiceItems: {
                    include: {
                        Product: {
                            select: { name: true, sku: true },
                        },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        // 4. Aggregation Engine
        let totalRevenue = 0;
        let mpesaTotal = 0;
        let cashTotal = 0;

        const productSales: Record<
            string,
            { name: string; sku: string; qty: number; revenue: number }
        > = {};
        const ledger: any[] = [];

        invoices.forEach((inv) => {
            totalRevenue += inv.totalAmount;

            if (inv.paymentType === "MPESA") {
                mpesaTotal += inv.totalAmount;
            } else {
                cashTotal += inv.totalAmount;
            }

            const customerName = inv.Customer
                ? `${inv.Customer.firstName || ""} ${inv.Customer.lastName || ""}`.trim()
                : inv.invoiceName || "Walk-in";

            ledger.push({
                date: inv.createdAt.toISOString(),
                invoiceId: inv.id,
                customer: customerName || "Walk-in",
                method: inv.paymentType || "CASH",
                amount: inv.totalAmount,
            });

            inv.invoiceItems.forEach((item) => {
                const pid = item.productId;

                if (!productSales[pid]) {
                    productSales[pid] = {
                        name: item.Product?.name || "Unknown Product",
                        sku: item.Product?.sku || "-",
                        qty: 0,
                        revenue: 0,
                    };
                }

                productSales[pid].qty += item.quantity;
                productSales[pid].revenue += item.quantity * item.price;
            });
        });

        const topProducts = Object.values(productSales).sort(
            (a, b) => b.revenue - a.revenue,
        );

        return res.status(200).json({
            summary: {
                totalRevenue,
                totalInvoices: invoices.length,
                mpesaTotal,
                cashTotal,
            },
            ledger,
            topProducts,
        });
    } catch (error) {
        console.error("Report Generation Error:", error);
        return res
            .status(500)
            .json({ error: "Failed to generate report data" });
    }
}

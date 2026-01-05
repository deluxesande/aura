import { getAuth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

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

        // 1. Get the current user to find their Business ID
        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { businessId: true },
        });

        if (!user || !user.businessId) {
            return res
                .status(404)
                .json({ error: "User or Business not found" });
        }

        // 2. Fetch all subscriptions for this business
        const history = await prisma.subscription.findMany({
            where: {
                businessId: user.businessId,
            },
            include: {
                payments: {
                    select: {
                        amount: true,
                        mpesaReceiptNumber: true,
                        status: true,
                        createdAt: true,
                        phoneNumber: true,
                    },
                    orderBy: { createdAt: "desc" },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        // 3. Format the data for the frontend table
        const formattedHistory = history.map((sub) => {
            const successPayment =
                sub.payments.find((p) => p.status === "COMPLETED") ||
                sub.payments[0];

            return {
                id: sub.id,
                plan: sub.plan,
                status: sub.status,
                startDate: sub.currentPeriodStart,
                endDate: sub.currentPeriodEnd,
                amount: successPayment?.amount || 0,
                receiptNumber: successPayment?.mpesaReceiptNumber || "N/A",
                paymentDate: successPayment?.createdAt || sub.createdAt,
            };
        });

        return res.status(200).json(formattedHistory);
    } catch (error) {
        console.error("Billing History Error:", error);
        return res
            .status(500)
            .json({ error: "Failed to fetch billing history" });
    }
}

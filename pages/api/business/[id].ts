import { NextApiRequest, NextApiResponse } from "next";
import { updateBusiness } from "./update";
import { deleteBusiness } from "./delete";
import { prisma } from "@/utils/lib/client";

async function getBusinessById(req: NextApiRequest, res: NextApiResponse) {
    const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;

    if (!id) {
        return res
            .status(400)
            .json({ error: "Invalid or missing Business ID" });
    }

    try {
        const business = await prisma.business.findUnique({
            where: { id: id },
            include: {
                subscriptions: {
                    where: { status: "ACTIVE" },
                    orderBy: { createdAt: "desc" },
                    take: 1,
                },
                _count: {
                    select: { users: true },
                },
            },
        });

        if (!business) {
            return res.status(404).json({ error: "Business not found" });
        }

        const activeSubscription = business.subscriptions[0] || null;

        let currentPeriodTransactions = 0;
        if (activeSubscription) {
            currentPeriodTransactions = await prisma.invoice.count({
                where: {
                    businessId: id,
                    status: "PAID",
                    paymentType: "MPESA",
                    createdAt: {
                        gte: activeSubscription.currentPeriodStart,
                        lte: activeSubscription.currentPeriodEnd,
                    },
                },
            });
        }

        const { subscriptions, ...businessData } = business;

        const businessWithUsage = {
            ...businessData,
            subscription: activeSubscription,
            usage: {
                transactionCount: currentPeriodTransactions,
                staffCount: business._count.users,
                isLimitReached:
                    activeSubscription?.plan === "STARTER" &&
                    currentPeriodTransactions >= 100,
                canExportData: activeSubscription?.plan === "PREMIUM",
                hasCustomBranding: activeSubscription?.plan === "PREMIUM",
            },
        };

        res.status(200).json(businessWithUsage);
    } catch (error) {
        console.error("Error fetching business details:", error);
        res.status(500).json({ error: "Failed to fetch Business" });
    }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case "GET":
            return getBusinessById(req, res);
        case "PUT":
            return updateBusiness(req, res);
        case "DELETE":
            return deleteBusiness(req, res);
        default:
            res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

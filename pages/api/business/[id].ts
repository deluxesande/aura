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
        // Fetch business with subscription and staff count
        const business = await prisma.business.findUnique({
            where: { id: id },
            include: {
                subscription: true,
                _count: {
                    select: { users: true },
                },
            },
        });

        if (!business) {
            return res.status(404).json({ error: "Business not found" });
        }

        // Count transactions for the current billing period
        let currentPeriodTransactions = 0;
        if (business.subscription) {
            currentPeriodTransactions = await prisma.invoice.count({
                where: {
                    businessId: id,
                    createdAt: {
                        gte: business.subscription.currentPeriodStart,
                        lte: business.subscription.currentPeriodEnd,
                    },
                },
            });
        }

        const businessWithUsage = {
            ...business,
            usage: {
                transactionCount: currentPeriodTransactions,
                staffCount: business._count.users,
                isLimitReached:
                    business.subscription?.plan === "STARTER" &&
                    currentPeriodTransactions >= 100,
                canExportData: business.subscription?.plan === "PREMIUM",
                hasCustomBranding: business.subscription?.plan === "PREMIUM",
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

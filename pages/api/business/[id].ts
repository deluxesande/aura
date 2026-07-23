import { NextApiRequest, NextApiResponse } from "next";
import { updateBusiness } from "./update";
import { deleteBusiness } from "./delete";
import { masterPrisma, getTenantPrisma } from "@/utils/lib/prisma";
import { checkAndRenewStarterPlan } from "@/utils/subscription/subscription";
import { requireBusinessAccess } from "@/utils/server/auth";

async function getBusinessById(req: NextApiRequest, res: NextApiResponse) {
    let id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
    id = id?.trim();

    if (!id) {
        return res
            .status(400)
            .json({ error: "Invalid or missing Business ID" });
    }

    // Any member of the business may view its details; non-members get 404.
    const access = await requireBusinessAccess(req, id, "member");
    if (!access.ok) {
        return res.status(access.status).json({ error: access.error });
    }

    try {
        const business = await masterPrisma.business.findUnique({
            where: { id: id },
            include: {
                subscriptions: {
                    where: {
                        status: { in: ["ACTIVE", "PAST_DUE", "TRIALING"] },
                    },
                    orderBy: { createdAt: "desc" },
                    take: 1,
                },
                users: {
                    select: { clerkId: true },
                },
                _count: {
                    select: { users: true },
                },
            },
        });

        if (!business) {
            return res.status(404).json({ error: "Business not found" });
        }

        let activeSubscription = business.subscriptions[0] || null;

        if (activeSubscription) {
            activeSubscription = await checkAndRenewStarterPlan(
                id,
                activeSubscription,
            );
        }

        let currentPeriodTransactions = 0;

        if (activeSubscription) {
            const tenantPrisma = await getTenantPrisma(id);
            const clerkIds = business.users.map((u) => u.clerkId);
            currentPeriodTransactions = await tenantPrisma.invoice.count({
                where: {
                    createdBy: { in: clerkIds },
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
            mpesaConsumerKey: business.mpesaConsumerKey ? "***********" : null,
            mpesaConsumerSecret: business.mpesaConsumerSecret
                ? "***********"
                : null,
            mpesaPassKey: business.mpesaPassKey ? "***********" : null,
            tenantDatabaseUrl: business.tenantDatabaseUrl ? "********" : null,
            subscription: activeSubscription,
            usage: {
                transactionCount: currentPeriodTransactions,
                staffCount: business._count.users,
                isLimitReached:
                    (activeSubscription?.plan === "STARTER" &&
                        currentPeriodTransactions >= 100) ||
                    activeSubscription?.status === "PAST_DUE",
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

import { NextApiRequest, NextApiResponse } from "next";
import { updateBusiness } from "./update";
import { deleteBusiness } from "./delete";
import { prisma } from "@/utils/lib/client";
import { checkAndRenewStarterPlan } from "@/utils/subscription/subscription";

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

        let activeSubscription = business.subscriptions[0] || null;

        if (activeSubscription) {
            activeSubscription = await checkAndRenewStarterPlan(
                id,
                activeSubscription
            );
        }

        let currentPeriodTransactions = 0;
        if (activeSubscription) {
            // 1. Check total invoices for this business (Is the ID working?)
            const step1 = await prisma.invoice.count({
                where: { businessId: business.id },
            });
            console.log(`[DEBUG] Step 1 - Total Invoices: ${step1}`);

            // 2. Check how many are marked PAID (Is the status updating?)
            const step2 = await prisma.invoice.count({
                where: {
                    businessId: business.id,
                    status: "PAID",
                },
            });
            console.log(`[DEBUG] Step 2 - PAID Invoices: ${step2}`);

            // 3. Check how many have the paymentType set (Is this field actually populated?)
            const step3 = await prisma.invoice.count({
                where: {
                    businessId: business.id,
                    paymentType: "MPESA",
                },
            });
            console.log(`[DEBUG] Step 3 - MPESA Invoices: ${step3}`);

            currentPeriodTransactions = await prisma.invoice.count({
                where: {
                    businessId: business.id,
                    status: "PAID",
                    paymentType: "MPESA",
                },
            });
        }

        // Destructure and mask sensitive M-Pesa fields
        const { subscriptions, ...businessData } = business;

        const businessWithUsage = {
            ...businessData,
            mpesaConsumerKey: business.mpesaConsumerKey ? "***********" : null,
            mpesaConsumerSecret: business.mpesaConsumerSecret
                ? "***********"
                : null,
            mpesaPassKey: business.mpesaPassKey ? "***********" : null,
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

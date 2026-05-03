import { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import { masterPrisma, getTenantPrisma } from "@/utils/lib/prisma";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { userId } = getAuth(req);

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // 1. Fetch User from Master DB
        const user = await masterPrisma.user.findUnique({
            where: { clerkId: userId },
            include: {
                Business: {
                    include: {
                        subscriptions: {
                            orderBy: { createdAt: "desc" },
                            take: 1,
                        },
                    },
                },
            },
        });

        if (!user) {
            return res.status(200).json({ user: { role: "admin" } });
        }

        let maskedBusiness = null;
        let storeId = null;

        // 2. If user is linked to a business, fetch tenant-specific info (like storeId)
        if (user.Business) {
            try {
                const tenantPrisma = await getTenantPrisma(user.Business.id);
                const tenantUser = await tenantPrisma.tenantUser.findUnique({
                    where: { clerkId: userId },
                    select: { storeId: true }
                });
                storeId = tenantUser?.storeId || null;
            } catch (tenantError) {
                console.warn(`Could not fetch tenant data for user ${userId}:`, tenantError);
            }

            let activeSubscription = user.Business.subscriptions[0] || null;
            // ... (rest of subscription logic)

            if (activeSubscription) {
                const now = new Date();
                const endDate = new Date(activeSubscription.currentPeriodEnd);

                if (
                    activeSubscription.status === "ACTIVE" &&
                    activeSubscription.plan !== "STARTER" &&
                    endDate < now
                ) {
                    activeSubscription = await masterPrisma.subscription.update({
                        where: { id: activeSubscription.id },
                        data: { status: "PAST_DUE" },
                    });
                }
            }

            maskedBusiness = {
                ...user.Business,
                subscription: activeSubscription,
                mpesaConsumerKey: user.Business.mpesaConsumerKey
                    ? "***********"
                    : null,
                mpesaConsumerSecret: user.Business.mpesaConsumerSecret
                    ? "***********"
                    : null,
                mpesaPassKey: user.Business.mpesaPassKey ? "***********" : null,
                mpesaShortCode: user.Business.mpesaShortCode,
                // Clean up the raw array
                subscriptions: undefined,
            };
        }

        return res.status(200).json({
            user: {
                id: user.id,
                clerkId: user.clerkId,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                businessId: user.businessId,
                storeId: storeId,
                status: user.status,
                Business: maskedBusiness,
            },
        });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

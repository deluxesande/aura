import { prisma } from "../lib/client";

export const checkSubscription = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { clerkId: userId },
        include: {
            Business: {
                include: {
                    subscriptions: {
                        orderBy: {
                            createdAt: "desc",
                        },
                        take: 1,
                    },
                },
            },
        },
    });

    if (!user || !user.Business) {
        return { authorized: false, error: "User or business not found" };
    }

    const activeSub = user.Business.subscriptions[0];

    // If no subscription exists, they are on a trial/starter or need to create one.
    // However, for strict security, we check if the status is ACTIVE or TRIALING.
    if (!activeSub) {
        return { authorized: false, error: "No active subscription found" };
    }

    if (activeSub.status !== "ACTIVE" && activeSub.status !== "TRIALING") {
        return {
            authorized: false,
            error: "Subscription is not active. Please upgrade or renew.",
        };
    }

    return { authorized: true, businessId: user.businessId };
};

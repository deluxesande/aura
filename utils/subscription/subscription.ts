import { prisma } from "@/utils/lib/client";

export async function checkAndRenewStarterPlan(
    businessId: string,
    subscription: any
) {
    if (!subscription || subscription.plan !== "STARTER") return subscription;

    const now = new Date();
    const expiry = new Date(subscription.currentPeriodEnd);

    // If the plan has expired
    if (expiry < now) {
        console.log(`Auto-renewing STARTER plan for business ${businessId}`);

        // Calculate new period (Start NOW, End +30 days)
        const newStart = new Date();
        const newEnd = new Date();
        newEnd.setMonth(newEnd.getMonth() + 1);

        // Update DB
        const updatedSub = await prisma.subscription.update({
            where: { id: subscription.id },
            data: {
                currentPeriodStart: newStart,
                currentPeriodEnd: newEnd,
                status: "ACTIVE",
            },
        });

        return updatedSub;
    }

    return subscription;
}

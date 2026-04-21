import { Novu } from "@novu/api";
import { prisma } from "@/utils/lib/client";

const novu = new Novu({
    secretKey: process.env.NOVU_SECRET_KEY!,
});

export const notifyBusinessStaff = async ({
    businessId,
    workflowId,
    payload,
    roles = ["admin", "manager"],
    includeCreatorId,
}: {
    businessId: string;
    workflowId: string;
    payload: any;
    roles?: string[];
    includeCreatorId?: string;
}) => {
    try {
        const staff = await prisma.user.findMany({
            where: {
                businessId: businessId,
                OR: [
                    { role: { in: roles } },
                    ...(includeCreatorId ? [{ clerkId: includeCreatorId }] : []),
                ],
            },
            select: { clerkId: true, email: true },
        });

        if (staff.length === 0) return;

        await Promise.allSettled(
            staff.map((member) =>
                novu.trigger({
                    to: { subscriberId: member.clerkId },
                    workflowId,
                    payload,
                }).catch(err => console.error(`Novu: Failed to notify ${member.email}:`, err))
            )
        );
    } catch (error) {
        console.error("Novu Helper Error:", error);
    }
};

export default novu;

import { Novu } from "@novu/api";
import { prisma } from "@/utils/lib/client";

const novu = new Novu({
    secretKey: process.env.NOVU_SECRET_KEY!,
});

export const notifyBusinessStaff = async ({
    businessId,
    workflowId,
    payload,
    roles = ["admin", "manager", "ADMIN", "MANAGER"],
    includeCreatorId,
}: {
    businessId: string;
    workflowId: string;
    payload: any;
    roles?: string[];
    includeCreatorId?: string;
}) => {
    try {
        if (!businessId) {
            console.error(`Novu: Cannot notify staff. businessId is missing for workflow ${workflowId}`);
            return;
        }

        // Find users who belong to this business AND (have a specific role OR are the creator)
        const staff = await prisma.user.findMany({
            where: {
                businessId: businessId,
                OR: [
                    { role: { in: roles } },
                    ...(includeCreatorId ? [{ clerkId: includeCreatorId }] : []),
                ],
            },
            select: { clerkId: true, email: true, role: true },
        });

        if (staff.length === 0) {
            console.warn(`Novu: No staff found to notify for business ${businessId} with roles ${roles.join(", ")}`);
            return;
        }

        console.log(`Novu: Triggering ${workflowId} for ${staff.length} staff members in business ${businessId}`);

        const results = await Promise.allSettled(
            staff.map((member) =>
                novu.trigger({
                    to: { subscriberId: member.clerkId },
                    workflowId,
                    payload,
                }).then(res => {
                    console.log(`Novu: Successfully triggered ${workflowId} for ${member.email} (${member.role})`);
                    return res;
                }).catch(err => {
                    console.error(`Novu: Failed to notify ${member.email}:`, err.response?.data || err.message);
                    throw err;
                })
            )
        );

        return results;
    } catch (error) {
        console.error("Novu Helper Error:", error);
    }
};

export default novu;

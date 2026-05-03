import { getAuth, clerkClient } from "@clerk/nextjs/server";
import { masterPrisma, getTenantPrisma } from "@/utils/lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

export const getUsers = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { userId } = getAuth(req);

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // 1. Fetch Requesting User context from Master DB
        const requestingUser = await masterPrisma.user.findUnique({
            where: { clerkId: userId },
            include: {
                Business: true,
            },
        });

        if (!requestingUser || !requestingUser.Business) {
            return res
                .status(404)
                .json({ error: "User or business not found" });
        }

        if (
            requestingUser.role !== "manager" &&
            requestingUser.role !== "admin"
        ) {
            return res.status(403).json({
                error: "Forbidden: Access restricted to Managers and Admins",
            });
        }

        const businessId = requestingUser.Business.id;

        // 2. Fetch all team members from Master DB
        const businessUsers = await masterPrisma.user.findMany({
            where: {
                businessId: businessId,
            },
            select: {
                id: true,
                clerkId: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
                status: true,
                lastLogin: true,
                createdAt: true,
                storeId: true, // Logical reference
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        const tenantPrisma = await getTenantPrisma(businessId);
        
        // 3. Fetch all stores from Tenant DB to map names
        const stores = await tenantPrisma.store.findMany({
            where: { businessId: businessId },
            select: { id: true, name: true }
        });
        const storeMap = new Map(stores.map(s => [s.id, s.name]));

        const clerk = await clerkClient();

        // 4. Enrich users with Clerk images, Tenant stats, and Store names
        const enrichedUsers = await Promise.all(
            businessUsers.map(async (member) => {
                let imageUrl = "/images/user.png";
                try {
                    const clerkUser = await clerk.users.getUser(member.clerkId);
                    imageUrl = clerkUser.imageUrl;
                } catch (error) {
                    console.warn(
                        `Failed to fetch Clerk user for ${member.clerkId}`
                    );
                }

                // Query stats from Tenant DB
                const invoicesSold = await tenantPrisma.invoice.count({
                    where: {
                        createdBy: member.clerkId,
                        status: "PAID",
                    },
                });

                let invitedByName = "Direct Join";

                const invitation = await masterPrisma.userInvitation.findFirst({
                    where: {
                        email: member.email,
                        businessId: businessId,
                    },
                });

                if (invitation && invitation.invitedBy) {
                    const inviter = await masterPrisma.user.findUnique({
                        where: { id: invitation.invitedBy },
                        select: { firstName: true, lastName: true },
                    });

                    if (inviter) {
                        invitedByName = `${inviter.firstName} ${inviter.lastName}`;
                    } else {
                        invitedByName = "Unknown User";
                    }
                }

                return {
                    ...member,
                    imageUrl,
                    invoicesSold,
                    invitedBy: invitedByName,
                    Store: member.storeId ? {
                        id: member.storeId,
                        name: storeMap.get(member.storeId) || "Unknown Branch"
                    } : null
                };
            })
        );

        return res.status(200).json(enrichedUsers);
    } catch (error) {
        console.error("[BUSINESS_USERS_GET_ERROR]", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

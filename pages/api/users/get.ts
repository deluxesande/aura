import { getAuth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/utils/lib/client";
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

        const requestingUser = await prisma.user.findUnique({
            where: { clerkId: userId },
            include: {
                Business: true,
            },
        });

        if (!requestingUser) {
            return res
                .status(404)
                .json({ error: "User not found in database" });
        }

        if (!requestingUser.Business) {
            return res
                .status(400)
                .json({ error: "User is not linked to a valid business" });
        }

        if (
            requestingUser.role !== "manager" &&
            requestingUser.role !== "admin"
        ) {
            return res.status(403).json({
                error: "Forbidden: Access restricted to Managers and Admins",
            });
        }

        const businessUsers = await prisma.user.findMany({
            where: {
                businessId: requestingUser.Business.id,
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
                Store: {
                    select: {
                        name: true,
                        id: true,
                    }
                }
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        const clerk = await clerkClient();

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

                const invoicesSold = await prisma.invoice.count({
                    where: {
                        createdBy: member.clerkId,
                        status: "PAID",
                    },
                });

                let invitedByName = "Direct Join";

                const invitation = await prisma.userInvitation.findFirst({
                    where: {
                        email: member.email,
                        businessId: requestingUser.Business!.id,
                    },
                });

                if (invitation && invitation.invitedBy) {
                    const inviter = await prisma.user.findUnique({
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
                };
            })
        );

        return res.status(200).json(enrichedUsers);
    } catch (error) {
        console.error("[BUSINESS_USERS_GET_ERROR]", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

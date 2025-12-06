// pages/api/auth/delete/[userId].ts
import { clerkClient } from "@clerk/nextjs/server";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/utils/lib/client";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { userId } = req.query; // This is the clerkId

    if (req.method !== "DELETE") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    if (!userId || typeof userId !== "string") {
        return res.status(400).json({ error: "Invalid userId" });
    }

    try {
        // Find the user in the database using clerkId
        const user = await prisma.user.findUnique({
            where: { clerkId: userId }, // Changed from id to clerkId
            include: {
                Business: true,
            },
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Delete from Clerk first
        const client = await clerkClient();
        try {
            await client.users.deleteUser(userId); // userId is already clerkId
        } catch (clerkError) {
            // console.error("Error deleting user from Clerk:", clerkError);
            // Continue with database deletion even if Clerk deletion fails
        }

        // Start cascading delete from database
        // Use a transaction to ensure all-or-nothing deletion
        await prisma.$transaction(async (tx) => {
            // Delete all invoice items created by the user
            await tx.invoiceItem.deleteMany({
                where: { createdBy: userId }, // userId is clerkId
            });

            // Delete all invoices created by the user
            await tx.invoice.deleteMany({
                where: { createdBy: userId },
            });

            // Delete all customers created by the user
            await tx.customer.deleteMany({
                where: { createdBy: userId },
            });

            // Delete all products created by the user
            await tx.product.deleteMany({
                where: { createdBy: userId },
            });

            // Delete all categories created by the user
            await tx.category.deleteMany({
                where: { createdBy: userId },
            });

            // If user has a business, delete all related data and the business
            if (user.businessId) {
                // Delete all user invitations for the business
                await tx.userInvitation.deleteMany({
                    where: { businessId: user.businessId },
                });

                // Delete all other users in the same business
                await tx.user.deleteMany({
                    where: {
                        businessId: user.businessId,
                        clerkId: { not: userId }, // Don't delete the current user yet
                    },
                });

                // Delete the business
                await tx.business.delete({
                    where: { id: user.businessId },
                });
            }

            // Finally, delete the user
            await tx.user.delete({
                where: { id: user.id }, // Use the database UUID here
            });
        });

        return res.status(200).json({
            message: "User and all associated data deleted successfully",
        });
    } catch (error) {
        // console.error("Error deleting user:", error);
        return res.status(500).json({
            error: "Error deleting user",
            details: error instanceof Error ? error.message : "Unknown error",
        });
    }
}

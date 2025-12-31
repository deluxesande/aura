import { getAuth } from "@clerk/nextjs/server";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/utils/lib/client";

export const updateCustomer = async (
    req: NextApiRequest,
    res: NextApiResponse
) => {
    try {
        const { userId: clerkUserId } = getAuth(req);
        if (!clerkUserId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const user = await prisma.user.findUnique({
            where: { clerkId: clerkUserId },
            select: { businessId: true },
        });

        if (!user || !user.businessId) {
            return res
                .status(403)
                .json({ error: "User is not linked to a business" });
        }

        const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
        const { firstName, lastName, email: rawEmail, phoneNumber } = req.body;

        if (!id) {
            return res
                .status(400)
                .json({ error: "Invalid or missing customer ID" });
        }

        const email = rawEmail && rawEmail.trim() !== "" ? rawEmail : null;

        const result = await prisma.customer.updateMany({
            where: {
                id: id,
                businessId: user.businessId,
            },
            data: {
                firstName,
                lastName,
                email,
                phoneNumber,
            },
        });

        if (result.count === 0) {
            return res
                .status(404)
                .json({ error: "Customer not found or access denied" });
        }

        const updatedCustomer = await prisma.customer.findUnique({
            where: { id: id },
        });

        res.status(200).json(updatedCustomer);
    } catch (error) {
        console.error("Update Error:", error);
        res.status(500).json({ error: "Failed to update customer" });
    }
};

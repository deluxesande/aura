import { getAuth } from "@clerk/nextjs/server";
import { NextApiRequest, NextApiResponse } from "next";
import { addCreatedBy } from "../middleware";
import { prisma } from "@/utils/lib/client";

const addCustomerHandler = async (
    req: NextApiRequest,
    res: NextApiResponse
) => {
    try {
        const { userId: clerkUserId } = getAuth(req);

        if (!clerkUserId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const dbUser = await prisma.user.findUnique({
            where: { clerkId: clerkUserId },
            select: { id: true, businessId: true },
        });

        if (!dbUser) {
            return res.status(404).json({ error: "User not found" });
        }

        if (!dbUser.businessId) {
            return res
                .status(400)
                .json({ error: "User is not linked to a business" });
        }

        const { firstName, lastName, phoneNumber, email: rawEmail } = req.body;
        const email = rawEmail && rawEmail.trim() !== "" ? rawEmail : null;

        const newCustomer = await prisma.customer.create({
            data: {
                firstName,
                lastName,
                email,
                phoneNumber,
                businessId: dbUser.businessId,
                createdById: dbUser.id,
            },
        });

        res.status(201).json(newCustomer);
    } catch (error: any) {
        if (error.code === "P2002") {
            const target = error.meta?.target;
            let field = "field";

            if (Array.isArray(target)) {
                field = target.includes("email") ? "email" : "phone number";
            } else {
                field = target;
            }

            return res.status(409).json({
                error: `A customer with this ${field} already exists in this business.`,
            });
        }

        res.status(500).json({ error: "Failed to add customer" });
    }
};

export const addCustomer = addCreatedBy(addCustomerHandler);

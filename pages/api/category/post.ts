import { NextApiRequest, NextApiResponse } from "next";
import { addCreatedBy } from "../middleware";
import { getTenantPrisma } from "@/utils/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { checkSubscription } from "@/utils/subscription/checkSubscription";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { userId } = getAuth(req);

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const { authorized, error, businessId } = await checkSubscription(userId);

        if (!authorized) {
            return res.status(403).json({ error });
        }

        const { name, description } = req.body;

        const tenantPrisma = await getTenantPrisma(businessId as string);

        const newCategory = await tenantPrisma.category.create({
            data: {
                name,
                description,
                createdBy: userId,
                businessId: businessId as string,
            },
        });

        res.status(201).json(newCategory);
    } catch (error) {
        console.error("Failed to add category:", error);
        res.status(500).json({ error: "Failed to add category" });
    }
};

export const addCategory = addCreatedBy(handler);

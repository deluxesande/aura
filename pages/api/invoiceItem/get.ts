import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/utils/lib/client";
import { getTenantPrisma } from "@/utils/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";

export const getInvoiceItem = async (
    req: NextApiRequest,
    res: NextApiResponse
) => {
    const { userId } = getAuth(req);

    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    try {
        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { businessId: true }
        });

        if (!user || !user.businessId) return res.status(404).json({ error: "User or business not found" });

        const tenantPrisma = await getTenantPrisma(user.businessId);

        const invoiceItem = await tenantPrisma.invoiceItem.findMany({
            where: { businessId: user.businessId },
            select: {
                quantity: true,
                Product: {
                    select: {
                        name: true,
                        price: true,
                    },
                },
            },
        });
        res.status(200).json(invoiceItem);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch invoice items" });
    }
};

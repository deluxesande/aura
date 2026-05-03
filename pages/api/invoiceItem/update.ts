import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/utils/lib/client";
import { getTenantPrisma } from "@/utils/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";

export const updateInvoiceItem = async (
    req: NextApiRequest,
    res: NextApiResponse
) => {
    const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
    const { invoiceId, productId, quantity, price } = req.body;
    const { userId } = getAuth(req);

    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    if (!id) {
        return res
            .status(400)
            .json({ error: "Invalid or missing invoice item ID" });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { businessId: true }
        });

        if (!user || !user.businessId) return res.status(404).json({ error: "User or business not found" });

        const tenantPrisma = await getTenantPrisma(user.businessId);

        const updatedInvoiceItem = await tenantPrisma.invoiceItem.update({
            where: {
                id: id,
            },
            data: {
                invoiceId,
                productId,
                quantity,
                price,
            },
        });

        res.status(200).json(updatedInvoiceItem);
    } catch (error) {
        res.status(500).json({ error: "Failed to update invoice item" });
    }
};

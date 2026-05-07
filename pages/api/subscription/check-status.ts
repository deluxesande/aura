import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/utils/lib/client";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { userId: loggedInClerkId } = getAuth(req);

    if (!loggedInClerkId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const { checkoutRequestId } = req.query;

    if (!checkoutRequestId || typeof checkoutRequestId !== "string") {
        return res.status(400).json({ error: "Missing checkoutRequestId" });
    }

    try {
        const payment = await prisma.subscriptionPayment.findUnique({
            where: { checkoutRequestId },
            select: {
                status: true,
                planId: true,
                userId: true,
            },
        });

        if (!payment) {
            return res.status(404).json({ error: "Payment not found" });
        }

        if (payment.userId !== loggedInClerkId) {
            return res.status(403).json({
                error: "Forbidden: You do not have permission to view this payment status",
            });
        }

        return res.status(200).json({
            status: payment.status,
            planId: payment.planId,
        });
    } catch (error) {
        console.error("Status Check Error:", error);
        return res.status(500).json({ error: "Database error" });
    }
}

import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/utils/lib/client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { userId: clerkId } = getAuth(req);
    const { id } = req.query;
    if (!clerkId || typeof id !== "string") return res.status(401).json({ error: "Unauthorized" });

    const user = await prisma.user.findUnique({
        where: { clerkId },
        select: { businessId: true },
    });

    if (!user || !user.businessId) return res.status(403).json({ error: "Forbidden" });

    switch (req.method) {
        case "PATCH":
            try {
                const updated = await prisma.supplier.update({
                    where: { id, businessId: user.businessId },
                    data: req.body,
                });
                return res.status(200).json(updated);
            } catch (error) {
                return res.status(500).json({ error: "Update failed" });
            }
        case "DELETE":
            try {
                await prisma.supplier.update({
                    where: { id, businessId: user.businessId },
                    data: { isDeleted: true },
                });
                return res.status(200).json({ message: "Soft deleted" });
            } catch (error) {
                return res.status(500).json({ error: "Delete failed" });
            }
        default:
            res.setHeader("Allow", ["PATCH", "DELETE"]);
            return res.status(405).end();
    }
}

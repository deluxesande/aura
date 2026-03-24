
import { prisma } from "@/utils/lib/client";
import { getAuth } from "@clerk/nextjs/server";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const storeId = req.query.id as string;

    if (req.method === "PUT") {
        try {
            const { name, address } = req.body;
            
            const user = await prisma.user.findUnique({
                where: { clerkId: userId },
                select: { role: true, businessId: true }
            });

            if (user?.role !== "admin") return res.status(403).json({ error: "Forbidden" });

            const store = await prisma.store.findUnique({ where: { id: storeId } });
            if (!store || store.businessId !== user.businessId) {
                return res.status(403).json({ error: "Forbidden" });
            }

            const updatedStore = await prisma.store.update({
                where: { id: storeId },
                data: { name, address }
            });

            return res.status(200).json(updatedStore);
        } catch (error: any) {
            console.error("Edit Store Error:", error);
            return res.status(500).json({ error: error.message || "Failed to update branch" });
        }
    }
    
    res.setHeader("Allow", ["PUT"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
}

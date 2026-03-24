
import { prisma } from "@/utils/lib/client";
import { getAuth } from "@clerk/nextjs/server";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { id } = req.query; // businessId

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { businessId: true, role: true }
    });

    if (!user || user.businessId !== id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const stores = await prisma.store.findMany({
      where: { businessId: id as string },
      orderBy: { createdAt: 'asc' }
    });

    return res.status(200).json(stores);
  } catch (error: any) {
    console.error("List Stores Error:", error);
    return res.status(500).json({ error: "Failed to fetch stores" });
  }
}

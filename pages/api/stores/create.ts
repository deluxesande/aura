
import { prisma } from "@/utils/lib/client";
import { getAuth } from "@clerk/nextjs/server";
import { NextApiRequest, NextApiResponse } from "next";

const PLAN_LIMITS = {
  STARTER: 1,
  STANDARD: 3,
  PREMIUM: 10,
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { name, address } = req.body;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch User, Business, Subscription, and Current Store Count
      const user = await tx.user.findUnique({
        where: { clerkId: userId },
        include: {
          Business: {
            include: {
              subscriptions: {
                where: { status: "ACTIVE" },
                orderBy: { createdAt: 'desc' },
                take: 1
              },
              _count: { select: { stores: true } }
            }
          }
        }
      });

      const business = user?.Business;
      if (!business || user.role !== "admin") {
        throw new Error("Only admins can create stores for their business.");
      }

      const activeSub = business.subscriptions[0];
      if (!activeSub) {
        throw new Error("Active subscription required to create stores.");
      }

      // 2. Perform the Gatekeeper Check
      const limit = PLAN_LIMITS[activeSub.plan as keyof typeof PLAN_LIMITS] || 1;
      if (business._count.stores >= limit) {
        throw new Error(`Your ${activeSub.plan} plan is limited to ${limit} store(s). Please upgrade.`);
      }

      // 3. Create Store
      return await tx.store.create({
        data: {
          name,
          address,
          businessId: business.id,
        },
      });
    });

    return res.status(201).json(result);
  } catch (error: any) {
    console.error("Store Creation Error:", error);
    return res.status(403).json({ error: error.message });
  }
}

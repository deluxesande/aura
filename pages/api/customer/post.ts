import { getAuth } from "@clerk/nextjs/server";
import { NextApiRequest, NextApiResponse } from "next";
import { addCreatedBy } from "../middleware";
import { masterPrisma, getTenantPrisma } from "@/utils/lib/prisma";
import { checkSubscription } from "@/utils/subscription/checkSubscription";
import { syncUserToTenant } from "@/utils/lib/syncUser";

const addCustomerHandler = async (
    req: NextApiRequest,
    res: NextApiResponse
) => {
    try {
        const { userId: clerkUserId } = getAuth(req);

        if (!clerkUserId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const { authorized, error: subError, businessId } = await checkSubscription(clerkUserId);

        if (!authorized) {
            return res.status(403).json({ error: subError });
        }

        const bId = businessId as string;
        const activeStoreHeader = req.headers["x-store-id"] as string;

        // 1. Fetch User context from Master DB
        const dbUser = await masterPrisma.user.findUnique({
            where: { clerkId: clerkUserId },
            select: { id: true, businessId: true, role: true },
        });

        if (!dbUser || !dbUser.businessId) {
            return res.status(404).json({ error: "User or business not found" });
        }

        // 2. Get Tenant Prisma client
        const tenantPrisma = await getTenantPrisma(bId);

        // Ensure user is synced to tenant DB (for createdById FK)
        await syncUserToTenant(clerkUserId);

        // Fetch user store access from Tenant DB if not admin
        let targetStoreId = activeStoreHeader;
        if (dbUser.role !== "admin") {
            const tenantUser = await tenantPrisma.tenantUser.findUnique({
                where: { clerkId: clerkUserId },
                select: { storeId: true }
            });
            if (tenantUser?.storeId) targetStoreId = tenantUser.storeId;
        }

        if (!targetStoreId) {
            return res.status(400).json({ error: "No active store selected." });
        }

        const { firstName, lastName, phoneNumber, email: rawEmail } = req.body;
        const email = rawEmail && rawEmail.trim() !== "" ? rawEmail : null;

        // 3. Create Customer in Tenant DB
        const newCustomer = await tenantPrisma.customer.create({
            data: {
                firstName,
                lastName,
                email,
                phoneNumber,
                businessId: bId, // Logical reference
                storeId: targetStoreId,
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

        console.error("Add Customer Error:", error);
        res.status(500).json({ error: "Failed to add customer" });
    }
};

export const addCustomer = addCreatedBy(addCustomerHandler);

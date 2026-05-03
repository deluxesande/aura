import { getAuth, clerkClient } from "@clerk/nextjs/server";
import { NextApiRequest, NextApiResponse } from "next";
import { addCreatedBy } from "../middleware";
import formidable from "formidable";
import { masterPrisma as prisma } from "@/utils/lib/prisma";
import { syncUserToTenant } from "@/utils/lib/syncUser";
import { readFileSync } from "fs";
import { encrypt } from "@/utils/crypto";
import { Novu } from "@novu/api";

const novu = new Novu({
    secretKey: process.env.NOVU_SECRET_KEY!,
});

const addBusinessHandler = async (
    req: NextApiRequest,
    res: NextApiResponse,
) => {
    try {
        const user = getAuth(req);
        if (!user.userId)
            return res.status(401).json({ error: "Unauthorized" });

        // 1. Check if user already owns a business
        const existingBusiness = await prisma.business.findUnique({
            where: { createdBy: user.userId },
            include: {
                subscriptions: {
                    where: { status: "ACTIVE" },
                    take: 1,
                },
            },
        });

        // --- PATH A: Business Exists ---
        if (existingBusiness) {
            // Check if they already have an active subscription
            const activeSub = existingBusiness.subscriptions.find(
                (s) => s.status === "ACTIVE",
            );

            if (activeSub) {
                // If it's already linked to this business, just return it (idempotent)
                const latestPayment =
                    await prisma.subscriptionPayment.findFirst({
                        where: {
                            userId: user.userId,
                            status: "COMPLETED",
                            subscriptionId: null,
                        },
                        orderBy: { createdAt: "desc" },
                    });

                if (latestPayment) {
                    await prisma.subscriptionPayment.update({
                        where: { id: latestPayment.id },
                        data: { subscriptionId: activeSub.id },
                    });
                }

                await syncUserToTenant(user.userId);
                return res.status(200).json({
                    business: existingBusiness,
                    subscription: activeSub,
                    message: "Active subscription found and verified.",
                });
            }

            const latestPayment = await prisma.subscriptionPayment.findFirst({
                where: {
                    userId: user.userId,
                    status: "COMPLETED",
                    subscriptionId: null,
                },
                orderBy: { createdAt: "desc" },
            });

            const planToSet = (latestPayment?.planId as any) || "STARTER";

            const result = await prisma.$transaction(async (tx) => {
                const newSubscription = await tx.subscription.create({
                    data: {
                        businessId: existingBusiness.id,
                        plan: planToSet,
                        status: "ACTIVE",
                        currentPeriodStart: new Date(),
                        currentPeriodEnd: new Date(
                            new Date().setMonth(new Date().getMonth() + 1),
                        ),
                    },
                });

                if (latestPayment) {
                    await tx.subscriptionPayment.update({
                        where: { id: latestPayment.id },
                        data: { subscriptionId: newSubscription.id },
                    });
                }

                return {
                    business: existingBusiness,
                    subscription: newSubscription,
                    message: "Subscription created for existing business",
                };
            });

            // Sync user to tenant DB
            await syncUserToTenant(user.userId);

            return res.status(200).json(result);
        }

        const form = formidable({ multiples: true });
        const { fields, files } = await new Promise<{
            fields: any;
            files: any;
        }>((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err) reject(new Error("Error parsing form"));
                else resolve({ fields, files });
            });
        });

        const name = fields.name?.[0];
        const tenantMode = fields.tenantMode?.[0] || "SHARED";
        const tenantDatabaseUrl = fields.tenantDatabaseUrl?.[0];

        if (!name)
            return res.status(400).json({ error: "Business name is required" });

        const latestPayment = await prisma.subscriptionPayment.findFirst({
            where: {
                userId: user.userId,
                status: "COMPLETED",
                subscriptionId: null,
            },
            orderBy: { createdAt: "desc" },
        });

        const planToSet = (latestPayment?.planId as any) || "STARTER";

        let logoBase64 = null;
        if (files.logo?.[0]) {
            const file = files.logo[0];
            logoBase64 = `data:${
                file.mimetype || "image/png"
            };base64,${readFileSync(file.filepath).toString("base64")}`;
        }

        const clerk = await clerkClient();
        const clerkUser = await clerk.users.getUser(user.userId);

        const result = await prisma.$transaction(async (tx) => {
            const newBusiness = await tx.business.create({
                data: {
                    name,
                    logo: logoBase64,
                    createdBy: user.userId,
                    tenantMode: tenantMode as any,
                    tenantDatabaseUrl: tenantDatabaseUrl
                        ? encrypt(tenantDatabaseUrl)
                        : null,
                },
            });

            const newUser = await tx.user.create({
                data: {
                    clerkId: user.userId,
                    email: clerkUser.emailAddresses[0]?.emailAddress || "",
                    firstName: clerkUser.firstName || "",
                    lastName: clerkUser.lastName || "",
                    role: "admin",
                    businessId: newBusiness.id,
                },
            });

            const newSubscription = await tx.subscription.create({
                data: {
                    businessId: newBusiness.id,
                    plan: planToSet,
                    status: "ACTIVE",
                    currentPeriodStart: new Date(),
                    currentPeriodEnd: new Date(
                        new Date().setMonth(new Date().getMonth() + 1),
                    ),
                },
            });

            if (latestPayment) {
                await tx.subscriptionPayment.update({
                    where: { id: latestPayment.id },
                    data: { subscriptionId: newSubscription.id },
                });
            }

            return {
                business: newBusiness,
                user: newUser,
                subscription: newSubscription,
            };
        });

        // Sync user to tenant DB (Shared by default)
        await syncUserToTenant(user.userId);

        try {
            await novu.trigger({
                workflowId: "welcome",
                to: { subscriberId: result.user.clerkId },
                payload: {
                    firstName: result.user.firstName || "User",
                    organizationName: result.business.name,
                    plan: result.subscription.plan,
                },
            });
        } catch (e) {
            console.error("Novu error:", e);
        }

        return res.status(201).json(result);
    } catch (error) {
        console.error("Add Business Error:", error);
        res.status(500).json({ error: "Failed to create business" });
    }
};

export const addBusiness = addCreatedBy(addBusinessHandler);

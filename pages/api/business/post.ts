import { getAuth, clerkClient } from "@clerk/nextjs/server";
import { NextApiRequest, NextApiResponse } from "next";
import { addCreatedBy } from "../middleware";
import formidable from "formidable";
import { prisma } from "@/utils/lib/client";
import { readFileSync } from "fs";
import { Novu } from "@novu/api";

const novu = new Novu({
    secretKey: process.env.NOVU_SECRET_KEY!,
});

const addBusinessHandler = async (
    req: NextApiRequest,
    res: NextApiResponse
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

        if (existingBusiness?.subscriptions[0]) {
            return res
                .status(400)
                .json({ error: "You already have an active subscription." });
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
        if (!name)
            return res.status(400).json({ error: "Business name is required" });

        // 2. Determine Plan Logic
        // Look for a successful payment. If none exists, this is a STARTER registration.
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
                        new Date().setMonth(new Date().getMonth() + 1)
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

        // Trigger Welcome Notification via Novu
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

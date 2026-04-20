import { getAuth } from "@clerk/nextjs/server";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/utils/lib/client";
import { encrypt } from "@/utils/crypto";
import { logAction } from "@/utils/server/audit";

export const updateBusiness = async (
    req: NextApiRequest,
    res: NextApiResponse,
) => {
    try {
        const user = getAuth(req);

        if (!user.userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;

        const {
            name,
            email,
            phone,
            address,
            logo,
            mpesaConsumerKey,
            mpesaConsumerSecret,
            mpesaPassKey,
            mpesaShortCode,
        } = req.body;

        if (!id) {
            return res
                .status(400)
                .json({ error: "Invalid or missing business ID" });
        }

        const existingBusiness = await prisma.business.findUnique({
            where: { id },
            select: { createdBy: true },
        });

        if (!existingBusiness) {
            return res.status(404).json({ error: "Business not found" });
        }

        if (existingBusiness.createdBy !== user.userId) {
            return res.status(403).json({
                error: "Forbidden: Only the business administrator can perform this action.",
            });
        }

        const currentUser = await prisma.user.findUnique({
            where: { clerkId: user.userId },
            select: { id: true }
        });

        const updateData: any = {
            name,
            logo,
            email: email || null,
            address: address || null,
        };

        const changedFields: string[] = [];
        if (name) changedFields.push("name");
        if (email) changedFields.push("email");
        if (address) changedFields.push("address");
        if (logo) changedFields.push("logo");

        if (mpesaConsumerKey !== undefined) {
            updateData.mpesaConsumerKey = mpesaConsumerKey
                ? encrypt(mpesaConsumerKey)
                : null;
            changedFields.push("mpesaConsumerKey");
        }
        if (mpesaConsumerSecret !== undefined) {
            updateData.mpesaConsumerSecret = mpesaConsumerSecret
                ? encrypt(mpesaConsumerSecret)
                : null;
            changedFields.push("mpesaConsumerSecret");
        }
        if (mpesaPassKey !== undefined) {
            updateData.mpesaPassKey = mpesaPassKey ? encrypt(mpesaPassKey) : null;
            changedFields.push("mpesaPassKey");
        }
        if (mpesaShortCode !== undefined) {
            updateData.mpesaShortCode = mpesaShortCode || null;
            changedFields.push("mpesaShortCode");
        }

        const updatedBusiness = await prisma.business.update({
            where: { id: id },
            data: updateData,
        });

        // Log Audit Action
        if (currentUser) {
            await logAction({
                action: "UPDATE_BUSINESS_SETTINGS",
                entityType: "BUSINESS",
                entityId: id,
                details: { changedFields },
                userId: currentUser.id,
                businessId: id,
                ipAddress: req.headers["x-forwarded-for"] as string || req.socket.remoteAddress,
                userAgent: req.headers["user-agent"],
            });
        }

        const safeResponse = {
            ...updatedBusiness,
            mpesaConsumerKey: updatedBusiness.mpesaConsumerKey
                ? "********"
                : null,
            mpesaConsumerSecret: updatedBusiness.mpesaConsumerSecret
                ? "********"
                : null,
            mpesaPassKey: updatedBusiness.mpesaPassKey ? "********" : null,
        };

        res.status(200).json(safeResponse);
    } catch (error: any) {
        console.log(error);
        if (error.code === "P2002" && error.meta?.target?.includes("email")) {
            return res.status(409).json({
                error: "This email is already in use by another business.",
            });
        }

        res.status(500).json({ error: "Failed to update business" });
    }
};


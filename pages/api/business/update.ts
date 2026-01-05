import { getAuth } from "@clerk/nextjs/server";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/utils/lib/client";
import { encrypt } from "@/utils/crypto";
export const updateBusiness = async (
    req: NextApiRequest,
    res: NextApiResponse
) => {
    try {
        const user = getAuth(req);

        if (!user.userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;

        const {
            name,
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

        const updatedBusiness = await prisma.business.update({
            where: { id: id },
            data: {
                name,
                logo,
                // If mpesaConsumerKey has a value, encrypt it.
                // If it's null or empty string, set it to null in the DB.
                mpesaConsumerKey: mpesaConsumerKey
                    ? encrypt(mpesaConsumerKey)
                    : null,
                mpesaConsumerSecret: mpesaConsumerSecret
                    ? encrypt(mpesaConsumerSecret)
                    : null,
                mpesaPassKey: mpesaPassKey ? encrypt(mpesaPassKey) : null,
                mpesaShortCode: mpesaShortCode || null,
            },
        });

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
    } catch (error) {
        console.error("Error updating business:", error);
        res.status(500).json({ error: "Failed to update business" });
    }
};

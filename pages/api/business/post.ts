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

        if (!user.userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // Check if user already owns a business
        const existingBusiness = await prisma.business.findUnique({
            where: {
                createdBy: user.userId,
            },
        });

        if (existingBusiness) {
            return res.status(409).json({
                error: "User already has a business associated with their account",
                existingBusiness: {
                    id: existingBusiness.id,
                    name: existingBusiness.name,
                },
            });
        }

        // Get full user details from Clerk
        const clerk = await clerkClient();
        const clerkUser = await clerk.users.getUser(user.userId);

        // Check if user already exists in database
        const existingUser = await prisma.user.findUnique({
            where: { clerkId: user.userId },
        });

        if (existingUser) {
            return res.status(409).json({
                error: "User already exists in the system",
                user: {
                    id: existingUser.id,
                    email: existingUser.email,
                },
            });
        }

        const form = formidable({ multiples: true });

        const { fields, files } = await new Promise<{
            fields: any;
            files: any;
        }>((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err) {
                    reject(new Error("Error parsing form"));
                } else {
                    resolve({ fields, files });
                }
            });
        });

        // Extract business name from form fields
        const name = fields.name[0];

        if (!name) {
            return res.status(400).json({ error: "Business name is required" });
        }

        let logoBase64 = null;

        // Handle logo upload if file is provided
        if (files.logo && files.logo[0]) {
            const file = files.logo[0];
            const filePath = file.filepath;

            try {
                // Read file and convert to base64
                const fileBuffer = readFileSync(filePath);
                logoBase64 = `data:${
                    file.mimetype || "image/png"
                };base64,${fileBuffer.toString("base64")}`;
            } catch (error) {
                // Continue without logo rather than failing the entire request
                logoBase64 = null;
            }
        }

        // Use database transaction to create both business and user
        const result = await prisma.$transaction(async (tx) => {
            // Create business with Clerk user ID as owner
            const newBusiness = await tx.business.create({
                data: {
                    name,
                    logo: logoBase64,
                    createdBy: user.userId,
                },
            });

            // Create user record for the business creator
            const newUser = await tx.user.create({
                data: {
                    clerkId: user.userId,
                    email: clerkUser.emailAddresses[0]?.emailAddress || "",
                    firstName: clerkUser.firstName || "",
                    lastName: clerkUser.lastName || "",
                    role: "admin", // Business creators are admins
                    businessId: newBusiness.id,
                },
            });

            return { business: newBusiness, user: newUser };
        });

        try {
            console.log(result.user.clerkId);
            await novu.trigger({
                workflowId: "welcome",
                to: {
                    subscriberId: result.user.clerkId,
                },
                payload: {
                    firstName: result.user.firstName || "User",
                    organizationName: result.business.name,
                },
            });
        } catch (notificationError) {
            // Log the error but DO NOT crash the request. The business was created successfully.
            console.error(
                "Failed to trigger welcome notification:",
                notificationError
            );
        }

        res.status(201).json({
            business: result.business,
            user: result.user,
            message: "Business and user created successfully",
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to create business" });
    }
};

export const addBusiness = addCreatedBy(addBusinessHandler);

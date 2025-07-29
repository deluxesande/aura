import { getAuth, clerkClient } from "@clerk/nextjs/server";
import { NextApiRequest, NextApiResponse } from "next";
import { addCreatedBy } from "../middleware";
import * as Minio from "minio";
import formidable from "formidable";
import { v4 as uuidv4 } from "uuid";
import { generatePresignedUrl } from "@/utils/minio/generatePresignedUrl";
import { prisma } from "@/utils/lib/client";

const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_PUBLIC_IP || "",
    port: 9000,
    useSSL: false,
    accessKey: process.env.MINIO_ROOT_USER || "",
    secretKey: process.env.MINIO_ROOT_PASSWORD || "",
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

        let logoUrl = null;

        // Handle logo upload if file is provided
        if (files.logo && files.logo[0]) {
            console.log("Logo file found:", files.logo[0].originalFilename);

            const file = files.logo[0];
            const filePath = file.filepath;
            const objectName = `${uuidv4()}-business-logo.png`;

            const metaData = {
                "Content-Type": file.mimetype || "image/png",
            };

            const bucketName = "salesense-bucket";

            try {
                // Upload logo to MinIO and get presigned URL
                logoUrl = await generatePresignedUrl(
                    minioClient,
                    bucketName,
                    objectName,
                    filePath,
                    metaData
                );
            } catch (uploadError) {
                // Continue without logo rather than failing the entire request
                logoUrl = null;
            }
        } else {
            // console.log("No logo file provided in request");
        }

        // Use database transaction to create both business and user
        const result = await prisma.$transaction(async (tx) => {
            // Create business with Clerk user ID as owner
            const newBusiness = await tx.business.create({
                data: {
                    name,
                    logo: logoUrl,
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

import { getAuth } from "@clerk/nextjs/server";
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
            const file = files.logo[0];
            const filePath = file.filepath;
            const objectName = `${uuidv4()}-business-logo.png`;

            const metaData = {
                "Content-Type": file.mimetype || "image/png",
            };

            const bucketName = "salesense-bucket";

            // Upload logo to MinIO and get presigned URL
            logoUrl = await generatePresignedUrl(
                minioClient,
                bucketName,
                objectName,
                filePath,
                metaData
            );
        }

        // Create business with Clerk user ID as owner
        const newBusiness = await prisma.business.create({
            data: {
                name,
                logo: logoUrl,
                createdBy: req.body.createdBy,
            },
        });

        res.status(201).json(newBusiness);
    } catch (error) {
        console.error("Error creating business:", error);
        res.status(500).json({ error: "Failed to create business" });
    }
};

export const addBusiness = addCreatedBy(addBusinessHandler);

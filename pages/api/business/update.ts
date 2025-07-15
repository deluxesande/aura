import { getAuth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import * as Minio from "minio";
import formidable from "formidable";
import { v4 as uuidv4 } from "uuid";
import { generatePresignedUrl } from "@/utils/minio/generatePresignedUrl";

const prisma = new PrismaClient();

const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_PUBLIC_IP || "",
    port: 9000,
    useSSL: false,
    accessKey: process.env.MINIO_ROOT_USER || "",
    secretKey: process.env.MINIO_ROOT_PASSWORD || "",
});

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

        if (!id) {
            return res
                .status(400)
                .json({ error: "Invalid or missing business ID" });
        }

        // Check if request has file upload (multipart/form-data)
        const contentType = req.headers["content-type"] || "";
        const hasFile = contentType.includes("multipart/form-data");

        let updateData: any = {};

        if (hasFile) {
            // Use formidable only when files are present
            const form = formidable({
                multiples: true,
                maxFileSize: 10 * 1024 * 1024, // Increased to 10MB
                keepExtensions: true,
                uploadDir: "/tmp", // Specify upload directory
            });

            const { fields, files } = await new Promise<{
                fields: formidable.Fields;
                files: formidable.Files;
            }>((resolve, reject) => {
                // Increased timeout to 2 minutes for file uploads
                const timeout = setTimeout(() => {
                    reject(new Error("Form parsing timeout"));
                }, 120000); // 2 minutes

                form.parse(req, (err, fields, files) => {
                    clearTimeout(timeout);
                    if (err) {
                        console.error("Formidable parse error:", err);
                        reject(err);
                    } else {
                        console.log("Form parsed successfully");
                        resolve({ fields, files });
                    }
                });
            });

            // Handle name update from form data (both name and logo case)
            if (fields.name) {
                const name = Array.isArray(fields.name)
                    ? fields.name[0]
                    : fields.name;
                updateData.name = name as string;
                console.log("Name to update:", updateData.name);
            }

            // Handle logo upload if file is provided
            if (files.logo) {
                const file = Array.isArray(files.logo)
                    ? files.logo[0]
                    : files.logo;

                if (file && file.filepath) {
                    console.log("Processing logo upload...");
                    const filePath = file.filepath;
                    const fileExtension =
                        file.originalFilename?.split(".").pop() || "png";
                    const objectName = `${uuidv4()}-business-logo.${fileExtension}`;

                    const metaData = {
                        "Content-Type": file.mimetype || "image/png",
                    };

                    const bucketName = "salesense-bucket";

                    try {
                        // Upload logo to MinIO and get presigned URL
                        const logoUrl = await generatePresignedUrl(
                            minioClient,
                            bucketName,
                            objectName,
                            filePath,
                            metaData
                        );
                        updateData.logo = logoUrl;
                        console.log("Logo uploaded successfully");
                    } catch (uploadError) {
                        console.error("MinIO upload error:", uploadError);
                        return res
                            .status(500)
                            .json({ error: "Failed to upload logo" });
                    }
                }
            }
        } else {
            // Handle regular JSON body for name-only updates
            const { name } = req.body;

            if (name) {
                updateData.name = name;
                console.log("Name-only update:", updateData.name);
            }
        }

        // Only update if there's something to update
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: "No data to update" });
        }

        console.log("Updating business with data:", updateData);

        // Update business with new data
        const updatedBusiness = await prisma.business.update({
            where: {
                id: id,
                createdBy: user.userId,
            },
            data: updateData,
        });

        console.log("Business updated successfully");
        res.status(200).json(updatedBusiness);
    } catch (error) {
        console.error("Error updating business:", error);
        if (
            typeof error === "object" &&
            error !== null &&
            "message" in error &&
            (error as any).message === "Form parsing timeout"
        ) {
            return res
                .status(408)
                .json({ error: "Request timeout - please try again" });
        }
        res.status(500).json({ error: "Failed to update business" });
    }
};

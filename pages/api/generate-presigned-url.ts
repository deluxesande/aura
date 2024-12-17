import { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import * as Minio from "minio";
import { v4 as uuidv4 } from "uuid";

const minioClient = new Minio.Client({
    endPoint: "localhost",
    port: 9000,
    useSSL: false,
    accessKey: process.env.MINIO_ROOT_USER || "",
    secretKey: process.env.MINIO_ROOT_PASSWORD || "",
});

export const config = {
    api: {
        bodyParser: false,
    },
};

// Function to check if bucket exists and create it if not
async function ensureBucketExists(bucketName: string) {
    const bucketExists = await minioClient.bucketExists(bucketName);
    if (!bucketExists) {
        await minioClient.makeBucket(bucketName, "us-east-1");
    }
}

// Handle file upload and MinIO integration
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const form = formidable({});
        const { fields, files } = await new Promise<{
            fields: any;
            files: any;
        }>((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err) {
                    reject(err);
                } else {
                    resolve({ fields, files });
                }
            });
        });

        if (!files.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const file = files.file[0];
        const filePath = file.filepath;
        const objectName = `${uuidv4()}-salesense-product.png`;

        const metaData = {
            "Content-Type": "image/png",
        };

        const bucketName = "salesense-bucket";

        // Ensure bucket exists
        await ensureBucketExists(bucketName);

        // Upload file to MinIO
        await minioClient.fPutObject(
            bucketName,
            objectName,
            filePath,
            metaData
        );

        // Generate a presigned URL for accessing the uploaded file
        const presignedUrl = await minioClient.presignedUrl(
            "GET",
            bucketName,
            objectName
        );

        return res.status(201).json({ presignedUrl });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ error: error || "Error uploading file" });
    }
}

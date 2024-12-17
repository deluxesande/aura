import { NextApiRequest, NextApiResponse } from "next";
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

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const chunks: Buffer[] = [];
    req.on("data", (chunk) => {
        chunks.push(chunk);
    });

    req.on("end", async () => {
        const buffer = Buffer.concat(
            chunks.map((chunk) => new Uint8Array(chunk.buffer))
        );
        const objectName = `${uuidv4()}-salesense-product-file`;

        try {
            // Check if the bucket exists, if not, create it
            const bucketName = "salesense-bucket";
            const bucketExists = await minioClient.bucketExists(bucketName);
            if (!bucketExists) {
                await minioClient.makeBucket(bucketName, "us-east-1");
            }

            // Upload the file to MinIO
            await minioClient.putObject(
                bucketName,
                objectName,
                buffer,
                buffer.length,
                {
                    "Content-Type":
                        req.headers["content-type"] ||
                        "application/octet-stream",
                }
            );

            const presignedUrl = await minioClient.presignedUrl(
                "GET",
                bucketName,
                objectName
            );

            return res.status(201).json({ presignedUrl });
        } catch (error) {
            console.error("Error uploading file:", error);
            return res.status(500).json({ error: "Error uploading file" });
        }
    });

    req.on("error", (err) => {
        console.error("Error receiving file:", err);
        res.status(500).json({ error: "Error receiving file" });
    });
}

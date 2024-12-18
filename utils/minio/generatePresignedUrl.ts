import * as Minio from "minio";

export async function generatePresignedUrl(
    minioClient: Minio.Client,
    bucketName: string,
    objectName: string,
    filePath: string,
    metaData: Minio.ItemBucketMetadata
): Promise<string> {
    // Bucket policy to allow public read access
    const publicBucketPolicy = (bucketName: string) => ({
        Version: "2012-10-17",
        Statement: [
            {
                Effect: "Allow",
                Principal: "*",
                Action: "s3:GetObject",
                Resource: `arn:aws:s3:::${bucketName}/*`,
            },
        ],
    });

    // Function to check if bucket exists and create it if not
    async function ensureBucketExists(bucketName: string) {
        const bucketExists = await minioClient.bucketExists(bucketName);
        if (!bucketExists) {
            await minioClient.makeBucket(bucketName, "us-east-1");
            // Set the bucket policy
            await minioClient.setBucketPolicy(
                bucketName,
                JSON.stringify(publicBucketPolicy(bucketName))
            );
        }
    }

    // Function to trim the presigned URL to remove query parameters
    function trimPresignedUrl(presignedUrl: string): string {
        const [baseUrl] = presignedUrl.split("?");
        return baseUrl;
    }

    await ensureBucketExists(bucketName);

    // Upload file to MinIO
    await minioClient.fPutObject(bucketName, objectName, filePath, metaData);

    // Generate a presigned URL for accessing the uploaded file
    const presignedUrl = await minioClient.presignedUrl(
        "GET",
        bucketName,
        objectName
    );

    // Removing the auth part of presigned url
    return trimPresignedUrl(presignedUrl);
}

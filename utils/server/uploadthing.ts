import { createUploadthing, type FileRouter } from "uploadthing/next-legacy";
import { getAuth } from "@clerk/nextjs/server";

const f = createUploadthing();

export const ourFileRouter = {
    productImage: f(
        { image: { maxFileSize: "4MB", maxFileCount: 1 } },
        { awaitServerData: false },
    )
        .middleware(async ({ req }) => {
            const { userId } = getAuth(req);
            if (!userId) throw new Error("Unauthorized");
            return { userId };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            const fileUrl = `https://utfs.io/f/${file.key}`;

            return { uploadedBy: metadata.userId, url: fileUrl };
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

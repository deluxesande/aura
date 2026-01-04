"use server";

import { utapi } from "@/utils/server/uploadthingServer";

export async function deleteImage(fileKey: string) {
    try {
        // fileKey is the unique identifier UploadThing returns after upload
        await utapi.deleteFiles(fileKey);
        return { success: true };
    } catch (error) {
        console.error("UT deletion failed:", error);
        return { success: false, error: "Failed to delete image" };
    }
}

import { UTApi } from "uploadthing/server";

export const utapi = new UTApi();

export const extractFileKey = (url: string) => {
    // Standard UploadThing URL format: https://utfs.io/f/FILE_KEY
    return url.split("/f/")[1];
};

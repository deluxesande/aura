import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "@/utils/server/uploadthing";

export const { useUploadThing, uploadFiles } =
    generateReactHelpers<OurFileRouter>();

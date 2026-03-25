import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/utils/lib/client";
// import { utapi, extractFileKey } from "@/utils/server/uploadthingServer";

export const deleteProduct = async (
    req: NextApiRequest,
    res: NextApiResponse,
) => {
    const id = req.query.id as string;

    if (!id) {
        return res.status(400).json({ error: "Product ID is required" });
    }

    try {
        const product = await prisma.product.findUnique({
            where: { id },
            select: { image: true },
        });

        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        // UploadThing deletion commented out to preserve images for historical invoices
        /*
        if (product.image) {
            const isUploadThing = product.image.includes("utfs.io");

            if (isUploadThing) {
                const fileKey = extractFileKey(product.image);
                if (fileKey) {
                    try {
                        await utapi.deleteFiles(fileKey);
                    } catch (utError) {
                        console.error("Failed to delete from UploadThing:", utError);
                    }
                }
            }
        }
        */

        await prisma.product.update({
            where: { id },
            data: { isArchived: true },
        });

        return res
            .status(200)
            .json({ message: "Product archived successfully" });
    } catch (error) {
        console.error("Archive Product Error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    if (req.method === "DELETE") {
        return deleteProduct(req, res);
    }
    return res.status(405).json({ error: "Method not allowed" });
}

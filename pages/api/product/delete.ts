import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/utils/lib/client";
import { utapi, extractFileKey } from "@/utils/server/uploadthingServer";

export const deleteProduct = async (
    req: NextApiRequest,
    res: NextApiResponse
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

        if (product.image) {
            const isUploadThing = product.image.includes("utfs.io");

            if (isUploadThing) {
                const fileKey = extractFileKey(product.image);
                if (fileKey) {
                    try {
                        await utapi.deleteFiles(fileKey);
                    } catch (utError) {
                        // We proceed with DB delete even if cloud delete fails to avoid orphaned DB records
                    }
                }
            }
        }

        await prisma.product.delete({
            where: { id },
        });

        return res
            .status(200)
            .json({ message: "Product deleted successfully" });
    } catch (error) {
        console.error("Delete Product Error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

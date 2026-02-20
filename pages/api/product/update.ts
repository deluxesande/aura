import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/utils/lib/client";
import { utapi, extractFileKey } from "@/utils/server/uploadthingServer";

export const updateProduct = async (
    req: NextApiRequest,
    res: NextApiResponse,
) => {
    const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
    const { name, description, price, quantity, categoryId, image, sku } =
        req.body;

    if (!id) {
        return res.status(400).json({ error: "Invalid or missing product ID" });
    }

    try {
        if (sku) {
            const existingSku = await prisma.product.findFirst({
                where: {
                    sku: sku,
                    id: { not: id },
                },
            });

            if (existingSku) {
                return res.status(409).json({
                    error: "A product with this SKU/Barcode already exists.",
                });
            }
        }

        const existingProduct = await prisma.product.findUnique({
            where: { id: id },
            select: { image: true },
        });

        const updatedProduct = await prisma.product.update({
            where: {
                id: id,
            },
            data: {
                name,
                description,
                price,
                quantity,
                categoryId,
                image,
                sku,
                inStock: quantity > 0 ? true : false,
            },
        });

        if (
            existingProduct?.image &&
            existingProduct.image !== image &&
            existingProduct.image.includes("utfs.io")
        ) {
            const oldFileKey = extractFileKey(existingProduct.image);

            if (oldFileKey) {
                // Fire and forget: Do not await it so it doesn't slow down the response to the user
                utapi
                    .deleteFiles(oldFileKey)
                    // .then((result) => {
                    //     console.log(
                    //         `Successfully deleted old image from UploadThing: ${oldFileKey}`,
                    //         result,
                    //     );
                    // })
                    .catch((err) => {
                        console.error(
                            "Failed to delete old image from UploadThing:",
                            err,
                        );
                    });
            }
        }

        res.status(200).json(updatedProduct);
    } catch (error: any) {
        if (error.code === "P2002") {
            return res
                .status(409)
                .json({ error: "A product with this SKU already exists." });
        }

        console.error("Update Error:", error);
        res.status(500).json({ error: "Failed to update product" });
    }
};

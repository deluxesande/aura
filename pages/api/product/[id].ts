import type { NextApiRequest, NextApiResponse } from "next";
import { deleteProduct } from "./delete";
import { updateProduct } from "./update";
import { masterPrisma, getTenantPrisma } from "@/utils/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";

async function getProductById(req: NextApiRequest, res: NextApiResponse) {
    const id = req.query.id as string;
    const { userId } = getAuth(req);

    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    try {
        const user = await masterPrisma.user.findUnique({
            where: { clerkId: userId },
            select: { businessId: true }
        });

        if (!user?.businessId) return res.status(404).json({ error: "Business not found" });

        const tenantPrisma = await getTenantPrisma(user.businessId);

        // Scope by businessId: in SHARED tenant mode the DB holds every
        // business's rows, so an id-only lookup would leak across tenants.
        const product = await tenantPrisma.product.findFirst({
            where: {
                id: id,
                businessId: user.businessId,
            },
            include: {
                Category: true,
                variants: {
                    where: { isArchived: false },
                    include: {
                        attributeValues: {
                            include: {
                                attributeOption: {
                                    include: {
                                        attribute: true
                                    }
                                }
                            }
                        }
                    }
                },
                attributeValues: {
                    include: {
                        attributeOption: {
                            include: {
                                attribute: true
                            }
                        }
                    }
                }
            }
        });

        if (product) {
            res.status(200).json(product);
        } else {
            res.status(404).json({ message: "Product not found" });
        }
    } catch (error) {
        console.error("Fetch Product Error:", error);
        res.status(500).json({ error: "Failed to fetch product" });
    }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case "GET":
            return getProductById(req, res);
        case "PUT":
            return updateProduct(req, res);
        case "DELETE":
            return deleteProduct(req, res);
        default:
            res.setHeader("Allow", ["PUT", "DELETE"]);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

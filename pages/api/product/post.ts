import { NextApiRequest, NextApiResponse } from "next";
import { generateSKU } from "@/utils/generateSKU";
import { addCreatedBy } from "../middleware";
import { prisma } from "@/utils/lib/client";
import { getAuth } from "@clerk/nextjs/server";
import { checkSubscription } from "@/utils/subscription/checkSubscription";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { userId } = getAuth(req);

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const { authorized, error, businessId } =
            await checkSubscription(userId);

        if (!authorized) {
            return res.status(403).json({ error });
        }

        const {
            name,
            description,
            price,
            quantity,
            inStock,
            categoryId,
            sku,
            image,
            type = "SIMPLE",
            parentId,
            attributes = [], // Expected format: [{name: "Color", value: "Red"}, {name: "Size", value: "XL"}]
        } = req.body;

        const parsedQuantity = parseInt(quantity, 10) || 0;
        const parsedPrice = parseFloat(price) || 0;

        // 1. Handle TEMPLATE creation/update
        if (type === "TEMPLATE") {
            const existingTemplate = await prisma.product.findFirst({
                where: {
                    name,
                    categoryId,
                    businessId: businessId as string,
                    type: "TEMPLATE",
                },
            });

            if (existingTemplate) {
                return res.status(200).json(existingTemplate);
            }

            const newTemplate = await prisma.product.create({
                data: {
                    name,
                    description,
                    price: 0, // Templates don't have a price usually
                    sku: sku || `TMP-${generateSKU(name)}`,
                    quantity: 0, // Templates don't hold stock
                    image: image ?? "/images/default-product.png",
                    inStock: false,
                    type: "TEMPLATE",
                    Category: { connect: { id: categoryId } },
                    Business: { connect: { id: businessId as string } },
                    createdBy: userId,
                },
            });
            return res.status(201).json(newTemplate);
        }

        // 2. Handle VARIANT creation/update
        if (type === "VARIANT") {
            if (!parentId) {
                return res.status(400).json({ error: "Parent ID is required for variants" });
            }

            // Find if this variant already exists by attributes under this parent
            // This is the "Duplicate Check" for ERP variants
            if (attributes.length > 0) {
                const variants = await prisma.product.findMany({
                    where: { parentId, type: "VARIANT" },
                    include: { attributeValues: { include: { attributeOption: { include: { attribute: true } } } } }
                });

                const existingVariant = variants.find(v => {
                    if (v.attributeValues.length !== attributes.length) return false;
                    return attributes.every((attr: any) => 
                        v.attributeValues.some(av => 
                            av.attributeOption.attribute.name.toLowerCase() === attr.name.toLowerCase() &&
                            av.attributeOption.value.toLowerCase() === attr.value.toLowerCase()
                        )
                    );
                });

                if (existingVariant) {
                    const updated = await prisma.product.update({
                        where: { id: existingVariant.id },
                        data: { quantity: existingVariant.quantity + parsedQuantity }
                    });
                    return res.status(200).json(updated);
                }
            }

            // Check for duplicate SKU if provided
            if (sku) {
                const skuCheck = await prisma.product.findUnique({ where: { sku } });
                if (skuCheck) return res.status(409).json({ error: "SKU already exists" });
            }

            const finalSku = sku || generateSKU(`${name}-${attributes.map((a: any) => a.value).join("-")}`);

            // Create Variant
            const newVariant = await prisma.product.create({
                data: {
                    name,
                    description,
                    price: parsedPrice,
                    sku: finalSku,
                    quantity: parsedQuantity,
                    image: image ?? "/images/default-product.png",
                    inStock,
                    type: "VARIANT",
                    parent: { connect: { id: parentId } },
                    Category: { connect: { id: categoryId } },
                    Business: { connect: { id: businessId as string } },
                    createdBy: userId,
                }
            });

            // Link Attributes
            if (attributes.length > 0) {
                for (const attr of attributes) {
                    // Find or create Attribute (e.g., "Color")
                    const attribute = await prisma.attribute.upsert({
                        where: { name_businessId: { name: attr.name, businessId: businessId as string } },
                        update: {},
                        create: { name: attr.name, businessId: businessId as string }
                    });

                    // Find or create Option (e.g., "Red")
                    const option = await prisma.attributeOption.upsert({
                        where: { value_attributeId: { value: attr.value, attributeId: attribute.id } },
                        update: {},
                        create: { value: attr.value, attributeId: attribute.id }
                    });

                    // Link to Product
                    await prisma.productAttributeValue.create({
                        data: {
                            productId: newVariant.id,
                            attributeOptionId: option.id
                        }
                    });
                }
            }

            return res.status(201).json(newVariant);
        }

        // 3. Handle SIMPLE product (Original Logic)
        const finalSku = sku && sku.trim() !== "" ? sku : generateSKU(name);

        const existingProduct = await prisma.product.findFirst({
            where: {
                name,
                categoryId,
                businessId: businessId as string,
                type: "SIMPLE"
            },
        });

        if (existingProduct) {
            const updatedProduct = await prisma.product.update({
                where: { id: existingProduct.id },
                data: {
                    quantity: existingProduct.quantity + parsedQuantity,
                },
            });
            return res.status(200).json(updatedProduct);
        }

        const skuCheck = await prisma.product.findUnique({
            where: { sku: finalSku },
        });

        if (skuCheck) {
            return res.status(409).json({
                error: "A product with this SKU/Barcode already exists.",
            });
        }

        const newProduct = await prisma.product.create({
            data: {
                name,
                description,
                price: parsedPrice,
                sku: finalSku,
                quantity: parsedQuantity,
                image: image ?? "/images/default-product.png",
                inStock,
                type: "SIMPLE",
                Category: { connect: { id: categoryId } },
                Business: { connect: { id: businessId as string } },
                createdBy: userId,
            },
        });

        return res.status(201).json(newProduct);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to add or update product" });
    }
};

export const addProduct = addCreatedBy(handler);

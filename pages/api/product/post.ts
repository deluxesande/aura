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
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const { authorized, error, businessId } =
            await checkSubscription(userId);
        if (!authorized) return res.status(403).json({ error });

        const bId = businessId as string;
        const body = req.body;
        const isBatch = Array.isArray(body);
        const items = isBatch ? body : [body];

        const processItem = async (item: any) => {
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
                attributes = [],
                createdBy,
            } = item;

            const parsedQuantity = parseInt(quantity, 10) || 0;
            const parsedPrice = parseFloat(price) || 0;
            const imageUrl = image ?? "/images/default-product.png";
            const itemCreatedBy = createdBy || userId;

            if (type === "TEMPLATE") {
                return await prisma.product.upsert({
                    where: {
                        sku: sku || `TMP-${generateSKU(name)}`,
                    },
                    update: {},
                    create: {
                        name,
                        description,
                        price: 0,
                        sku: sku || `TMP-${generateSKU(name)}`,
                        quantity: 0,
                        image: imageUrl,
                        inStock: false,
                        type: "TEMPLATE",
                        Category: { connect: { id: categoryId } },
                        Business: { connect: { id: bId } },
                        createdBy: itemCreatedBy,
                    },
                });
            }

            if (type === "VARIANT") {
                if (!parentId) {
                    throw new Error("Parent ID is required for variants");
                }

                // 1. Upsert all attributes and options in parallel
                const attrResults = await Promise.all(
                    attributes.map(
                        async (attr: { name: string; value: string }) => {
                            const attribute = await prisma.attribute.upsert({
                                where: {
                                    name_businessId: {
                                        name: attr.name,
                                        businessId: bId,
                                    },
                                },
                                update: {},
                                create: { name: attr.name, businessId: bId },
                                select: { id: true, name: true },
                            });

                            const option = await prisma.attributeOption.upsert({
                                where: {
                                    value_attributeId: {
                                        value: attr.value,
                                        attributeId: attribute.id,
                                    },
                                },
                                update: {},
                                create: {
                                    value: attr.value,
                                    attributeId: attribute.id,
                                },
                                select: { id: true, value: true },
                            });

                            return { attribute, option, original: attr };
                        },
                    ),
                );

                // 2. Check for existing variant with same attributes in one query
                if (attributes.length > 0) {
                    const optionIds = attrResults.map((r) => r.option.id);

                    const existingVariant = await prisma.product.findFirst({
                        where: {
                            parentId,
                            type: "VARIANT",
                            attributeValues: {
                                every: {
                                    attributeOptionId: { in: optionIds },
                                },
                            },
                        },
                        select: { id: true, quantity: true },
                    });

                    if (existingVariant) {
                        return await prisma.product.update({
                            where: { id: existingVariant.id },
                            data: {
                                quantity:
                                    existingVariant.quantity + parsedQuantity,
                            },
                        });
                    }
                }

                // 3. SKU check
                const finalSku =
                    sku ||
                    generateSKU(
                        `${name}-${attributes.map((a: { value: string }) => a.value).join("-")}`,
                    );

                if (sku) {
                    const skuCheck = await prisma.product.findUnique({
                        where: { sku },
                        select: { id: true },
                    });
                    if (skuCheck) throw new Error(`SKU ${sku} already exists`);
                }

                // 4. Create variant + attribute values in a single transaction
                return await prisma.$transaction(async (tx) => {
                    const variant = await tx.product.create({
                        data: {
                            name,
                            description,
                            price: parsedPrice,
                            sku: finalSku,
                            quantity: parsedQuantity,
                            image: imageUrl,
                            inStock,
                            type: "VARIANT",
                            parent: { connect: { id: parentId } },
                            Category: { connect: { id: categoryId } },
                            Business: { connect: { id: bId } },
                            createdBy: itemCreatedBy,
                        },
                    });

                    // Bulk insert all attribute values at once
                    if (attrResults.length > 0) {
                        await tx.productAttributeValue.createMany({
                            data: attrResults.map((r) => ({
                                productId: variant.id,
                                attributeOptionId: r.option.id,
                            })),
                        });
                    }

                    return variant;
                });
            }

            const finalSku = sku && sku.trim() !== "" ? sku : generateSKU(name);

            // Combine existing product check + SKU check into one parallel call
            const [existingProduct, skuCheck] = await Promise.all([
                prisma.product.findFirst({
                    where: { name, categoryId, businessId: bId, type: "SIMPLE" },
                    select: { id: true, quantity: true },
                }),
                prisma.product.findUnique({
                    where: { sku: finalSku },
                    select: { id: true },
                }),
            ]);

            if (existingProduct) {
                return await prisma.product.update({
                    where: { id: existingProduct.id },
                    data: {
                        quantity: existingProduct.quantity + parsedQuantity,
                    },
                });
            }

            if (skuCheck) {
                throw new Error(
                    `A product with SKU ${finalSku} already exists.`,
                );
            }

            return await prisma.product.create({
                data: {
                    name,
                    description,
                    price: parsedPrice,
                    sku: finalSku,
                    quantity: parsedQuantity,
                    image: imageUrl,
                    inStock,
                    type: "SIMPLE",
                    Category: { connect: { id: categoryId } },
                    Business: { connect: { id: bId } },
                    createdBy: itemCreatedBy,
                },
            });
        };

        // Use Promise.all for fast, concurrent processing on the server
        const results = await Promise.all(items.map((item) => processItem(item)));

        return res.status(201).json(isBatch ? results : results[0]);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({
            error: error.message || "Failed to add or update product",
        });
    }
};

export const addProduct = addCreatedBy(handler);

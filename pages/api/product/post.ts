import { NextApiRequest, NextApiResponse } from "next";
import { generateSKU } from "@/utils/generateSKU";
import { addCreatedBy } from "../middleware";
import { prisma } from "@/utils/lib/client";
import { getAuth } from "@clerk/nextjs/server";
import { checkSubscription } from "@/utils/subscription/checkSubscription";

export const config = {
    api: {
        bodyParser: {
            sizeLimit: "10mb",
        },
    },
};

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

        const results = await prisma.$transaction(
            async (tx) => {
                const processedItems = [];
                const attributeCache = new Map();
                const optionCache = new Map();

                // Pre-fetch all SKUs in the batch to check for existence
                const batchSkus = items
                    .map((i) => i.sku)
                    .filter((s) => s && s.trim() !== "");
                const existingSkus =
                    batchSkus.length > 0
                        ? await tx.product.findMany({
                              where: { sku: { in: batchSkus } },
                              select: { sku: true, id: true },
                          })
                        : [];
                const skuMap = new Map(existingSkus.map((s) => [s.sku, s.id]));

                // Pre-fetch existing simple products for faster lookup
                const simpleItemNames = items
                    .filter((i) => (i.type || "SIMPLE") === "SIMPLE")
                    .map((i) => i.name);
                const existingSimpleProducts =
                    simpleItemNames.length > 0
                        ? await tx.product.findMany({
                              where: {
                                  businessId: bId,
                                  type: "SIMPLE",
                                  name: { in: simpleItemNames },
                              },
                              select: {
                                  id: true,
                                  name: true,
                                  categoryId: true,
                                  quantity: true,
                              },
                          })
                        : [];

                for (const item of items) {
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
                        const templateSku = sku || `TMP-${generateSKU(name)}`;
                        const template = await tx.product.upsert({
                            where: { sku: templateSku },
                            update: {},
                            create: {
                                name,
                                description,
                                price: 0,
                                sku: templateSku,
                                quantity: 0,
                                image: imageUrl,
                                inStock: false,
                                type: "TEMPLATE",
                                Category: { connect: { id: categoryId } },
                                Business: { connect: { id: bId } },
                                createdBy: itemCreatedBy,
                            },
                        });
                        processedItems.push(template);
                        continue;
                    }

                    if (type === "VARIANT") {
                        if (!parentId)
                            throw new Error(
                                "Parent ID is required for variants",
                            );

                        const attrResults = [];
                        for (const attr of attributes) {
                            const attrCacheKey = `${attr.name}-${bId}`;
                            let attribute = attributeCache.get(attrCacheKey);
                            if (!attribute) {
                                attribute = await tx.attribute.upsert({
                                    where: {
                                        name_businessId: {
                                            name: attr.name,
                                            businessId: bId,
                                        },
                                    },
                                    update: {},
                                    create: {
                                        name: attr.name,
                                        businessId: bId,
                                    },
                                    select: { id: true, name: true },
                                });
                                attributeCache.set(attrCacheKey, attribute);
                            }

                            const optCacheKey = `${attr.value}-${attribute.id}`;
                            let option = optionCache.get(optCacheKey);
                            if (!option) {
                                option = await tx.attributeOption.upsert({
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
                                optionCache.set(optCacheKey, option);
                            }

                            attrResults.push({ attribute, option });
                        }

                        if (attributes.length > 0) {
                            const optionIds = attrResults.map(
                                (r) => r.option.id,
                            );
                            const existingVariant = await tx.product.findFirst({
                                where: {
                                    parentId,
                                    type: "VARIANT",
                                    attributeValues: {
                                        every: {
                                            attributeOptionId: {
                                                in: optionIds,
                                            },
                                        },
                                    },
                                },
                                select: { id: true, quantity: true },
                            });

                            if (existingVariant) {
                                const updated = await tx.product.update({
                                    where: { id: existingVariant.id },
                                    data: {
                                        quantity:
                                            existingVariant.quantity +
                                            parsedQuantity,
                                    },
                                });
                                processedItems.push(updated);
                                continue;
                            }
                        }

                        const finalSku =
                            sku ||
                            generateSKU(
                                `${name}-${attributes.map((a: { value: string }) => a.value).join("-")}`,
                            );

                        if (sku && skuMap.has(sku)) {
                            throw new Error(`SKU ${sku} already exists`);
                        }

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
                                attributeValues:
                                    attrResults.length > 0
                                        ? {
                                              create: attrResults.map((r) => ({
                                                  attributeOptionId:
                                                      r.option.id,
                                              })),
                                          }
                                        : undefined,
                            },
                        });
                        processedItems.push(variant);
                        continue;
                    }

                    const finalSku =
                        sku && sku.trim() !== "" ? sku : generateSKU(name);

                    const existingProduct = existingSimpleProducts.find(
                        (p) => p.name === name && p.categoryId === categoryId,
                    );

                    if (existingProduct) {
                        const updated = await tx.product.update({
                            where: { id: existingProduct.id },
                            data: {
                                quantity:
                                    existingProduct.quantity + parsedQuantity,
                            },
                        });
                        processedItems.push(updated);
                        continue;
                    }

                    if (sku && skuMap.has(sku)) {
                        throw new Error(
                            `A product with SKU ${sku} already exists.`,
                        );
                    }

                    if (!sku || sku.trim() === "") {
                        const skuCheck = await tx.product.findUnique({
                            where: { sku: finalSku },
                            select: { id: true },
                        });
                        if (skuCheck)
                            throw new Error(
                                `A product with SKU ${finalSku} already exists.`,
                            );
                    }

                    const simple = await tx.product.create({
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
                    processedItems.push(simple);
                }

                return processedItems;
            },
            {
                timeout: 9000, // 9s timeout for Prisma to stay under Vercel's 10s limit
            },
        );


        return res.status(201).json(isBatch ? results : results[0]);
    } catch (error: any) {
        console.error("Product Creation Error:", error);
        res.status(500).json({
            error: error.message || "Failed to add or update product",
        });
    }
};

export const addProduct = addCreatedBy(handler);

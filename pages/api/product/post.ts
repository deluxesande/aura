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
                // --- STAGE 1: Pre-fetch all necessary metadata in bulk ---
                const allAttrNames = new Set<string>();
                const allOptValues = new Set<string>(); // "attrName:value"
                const parentIds = new Set<string>();
                const providedSkus = new Set<string>();
                const simpleProductNames = new Set<string>();

                items.forEach((item) => {
                    if (item.sku) providedSkus.add(item.sku);
                    if (item.type === "VARIANT" && item.parentId) {
                        parentIds.add(item.parentId);
                        item.attributes?.forEach((a: any) => {
                            allAttrNames.add(a.name);
                            allOptValues.add(`${a.name}:${a.value}`);
                        });
                    } else if (item.type === "SIMPLE" || !item.type) {
                        simpleProductNames.add(item.name);
                    }
                });

                // Parallel pre-fetching
                const [
                    existingAttrs,
                    existingSkus,
                    existingSimples,
                    existingVariantsForParents,
                ] = await Promise.all([
                    tx.attribute.findMany({
                        where: { businessId: bId, name: { in: Array.from(allAttrNames) } },
                        include: { options: true },
                    }),
                    providedSkus.size > 0
                        ? tx.product.findMany({
                              where: { sku: { in: Array.from(providedSkus) } },
                              select: { sku: true, id: true },
                          })
                        : Promise.resolve([]),
                    simpleProductNames.size > 0
                        ? tx.product.findMany({
                              where: { businessId: bId, type: "SIMPLE", name: { in: Array.from(simpleProductNames) } },
                              select: { id: true, name: true, categoryId: true, quantity: true },
                          })
                        : Promise.resolve([]),
                    parentIds.size > 0
                        ? tx.product.findMany({
                              where: { parentId: { in: Array.from(parentIds) }, type: "VARIANT" },
                              include: { attributeValues: { include: { attributeOption: true } } },
                          })
                        : Promise.resolve([]),
                ]);

                // --- STAGE 2: Ensure all Attributes and Options exist ---
                const attrMap = new Map();
                const optMap = new Map(); // key: "attrId:value"

                existingAttrs.forEach((a) => {
                    attrMap.set(a.name, a);
                    a.options.forEach((o) => optMap.set(`${a.id}:${o.value}`, o));
                });

                // Create missing attributes
                for (const name of allAttrNames) {
                    if (!attrMap.has(name)) {
                        const newAttr = await tx.attribute.create({
                            data: { name, businessId: bId },
                        });
                        attrMap.set(name, newAttr);
                    }
                }

                // Create missing options
                for (const optKey of allOptValues) {
                    const [aName, val] = optKey.split(":");
                    const attr = attrMap.get(aName);
                    if (attr && !optMap.has(`${attr.id}:${val}`)) {
                        const newOpt = await tx.attributeOption.create({
                            data: { value: val, attributeId: attr.id },
                        });
                        optMap.set(`${attr.id}:${val}`, newOpt);
                    }
                }

                // SKU existence check maps
                const skuMap = new Map(existingSkus.map((s) => [s.sku, s.id]));
                
                // Helper to match variants in memory
                const findVariantInMemory = (pId: string, itemAttrs: any[]) => {
                    const parentVariants = existingVariantsForParents.filter(v => v.parentId === pId);
                    return parentVariants.find(v => {
                        if (v.attributeValues.length !== itemAttrs.length) return false;
                        return itemAttrs.every(ia => 
                            v.attributeValues.some(av => 
                                av.attributeOption.value === ia.value && 
                                av.attributeOption.attributeId === attrMap.get(ia.name)?.id
                            )
                        );
                    });
                };

                const processedItems = [];

                // --- STAGE 3: Process items ---
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
                        if (!parentId) throw new Error("Parent ID required for variants");

                        const existingV = findVariantInMemory(parentId, attributes);
                        if (existingV) {
                            const updated = await tx.product.update({
                                where: { id: existingV.id },
                                data: { quantity: existingV.quantity + parsedQuantity },
                            });
                            processedItems.push(updated);
                            continue;
                        }

                        const finalSku = sku || generateSKU(`${name}-${attributes.map((a: any) => a.value).join("-")}`);
                        if (sku && skuMap.has(sku)) throw new Error(`SKU ${sku} already exists`);

                        const variant = await tx.product.create({
                            data: {
                                name, description, price: parsedPrice, sku: finalSku,
                                quantity: parsedQuantity, image: imageUrl, inStock, type: "VARIANT",
                                parent: { connect: { id: parentId } },
                                Category: { connect: { id: categoryId } },
                                Business: { connect: { id: bId } },
                                createdBy: itemCreatedBy,
                                attributeValues: {
                                    create: attributes.map((a: any) => ({
                                        attributeOptionId: optMap.get(`${attrMap.get(a.name).id}:${a.value}`).id,
                                    })),
                                },
                            },
                        });
                        processedItems.push(variant);
                        continue;
                    }

                    // SIMPLE Product handling
                    const existingP = existingSimples.find(p => p.name === name && p.categoryId === categoryId);
                    if (existingP) {
                        const updated = await tx.product.update({
                            where: { id: existingP.id },
                            data: { quantity: existingP.quantity + parsedQuantity },
                        });
                        processedItems.push(updated);
                        continue;
                    }

                    const finalSku = sku && sku.trim() !== "" ? sku : generateSKU(name);
                    if (sku && skuMap.has(sku)) throw new Error(`SKU ${sku} already exists.`);

                    const simple = await tx.product.create({
                        data: {
                            name, description, price: parsedPrice, sku: finalSku,
                            quantity: parsedQuantity, image: imageUrl, inStock, type: "SIMPLE",
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
                timeout: 9500, // Stay within Vercel's 10s limit
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

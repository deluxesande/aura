import { NextApiRequest, NextApiResponse } from "next";
import { generateSKU } from "@/utils/generateSKU";
import { addCreatedBy } from "../middleware";
import { masterPrisma, getTenantPrisma } from "@/utils/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { checkSubscription } from "@/utils/subscription/checkSubscription";
import { logAction } from "@/utils/server/audit";

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

        const activeStoreHeader = req.headers["x-store-id"] as string;

        const { authorized, error, businessId } =
            await checkSubscription(userId);
        if (!authorized) return res.status(403).json({ error });

        const bId = businessId as string;
        
        // 1. Fetch current user from Master DB
        const currentUser = await masterPrisma.user.findUnique({
            where: { clerkId: userId },
            select: { id: true, role: true }
        });

        if (!currentUser) return res.status(404).json({ error: "User not found" });

        // 2. Get Tenant Prisma client
        const tenantPrisma = await getTenantPrisma(bId);

        // Fetch user store access from Tenant DB if not admin
        let targetStoreId = activeStoreHeader;
        if (currentUser.role !== "admin") {
            const tenantUser = await tenantPrisma.tenantUser.findUnique({
                where: { clerkId: userId },
                select: { storeId: true }
            });
            if (tenantUser?.storeId) targetStoreId = tenantUser.storeId;
        }

        if (!targetStoreId) {
            return res.status(400).json({ error: "No active store selected. Please select a branch first." });
        }

        const body = req.body;
        const isBatch = Array.isArray(body);
        const items = isBatch ? body : [body];

        const results = await tenantPrisma.$transaction(
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

                // Parallel pre-fetching in Tenant DB
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
                              select: { id: true, name: true, categoryId: true, sku: true },
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

                const skuMap = new Map(existingSkus.map((s) => [s.sku, s.id]));
                
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

                    let product;

                    if (type === "TEMPLATE") {
                        const templateSku = sku || `TMP-${generateSKU(name)}`;
                        product = await tx.product.upsert({
                            where: { sku: templateSku },
                            update: {},
                            create: {
                                name, description, price: 0, sku: templateSku,
                                quantity: 0, image: imageUrl, inStock: false, type: "TEMPLATE",
                                categoryId: categoryId,
                                businessId: bId,
                                createdBy: itemCreatedBy,
                            },
                        });
                    } else if (type === "VARIANT") {
                        if (!parentId) throw new Error("Parent ID required for variants");
                        const existingV = findVariantInMemory(parentId, attributes);
                        
                        if (existingV) {
                            product = existingV;
                        } else {
                            const finalSku = sku || generateSKU(`${name}-${attributes.map((a: any) => a.value).join("-")}`);
                            if (sku && skuMap.has(sku)) throw new Error(`SKU ${sku} already exists`);

                            product = await tx.product.create({
                                data: {
                                    name, description, price: parsedPrice, sku: finalSku,
                                    quantity: 0, image: imageUrl, inStock, type: "VARIANT",
                                    parentId: parentId,
                                    categoryId: categoryId,
                                    businessId: bId,
                                    createdBy: itemCreatedBy,
                                    attributeValues: {
                                        create: attributes.map((a: any) => ({
                                            attributeOptionId: optMap.get(`${attrMap.get(a.name).id}:${a.value}`).id,
                                        })),
                                    },
                                },
                            });
                        }
                    } else {
                        const existingP = existingSimples.find(p => p.name === name && p.categoryId === categoryId);
                        if (existingP) {
                            product = existingP;
                        } else {
                            const finalSku = sku && sku.trim() !== "" ? sku : generateSKU(name);
                            if (sku && skuMap.has(sku)) throw new Error(`SKU ${sku} already exists.`);

                            product = await tx.product.create({
                                data: {
                                    name, description, price: parsedPrice, sku: finalSku,
                                    quantity: 0, image: imageUrl, inStock, type: "SIMPLE",
                                    categoryId: categoryId,
                                    businessId: bId,
                                    createdBy: itemCreatedBy,
                                },
                            });
                        }
                    }

                    // Update StoreInventory in Tenant DB
                    if (type !== "TEMPLATE") {
                        const inventory = await tx.storeInventory.upsert({
                            where: {
                                storeId_productId: {
                                    storeId: targetStoreId,
                                    productId: product.id,
                                },
                            },
                            update: {
                                quantity: { increment: parsedQuantity },
                            },
                            create: {
                                storeId: targetStoreId,
                                productId: product.id,
                                quantity: parsedQuantity,
                            },
                        });
                        processedItems.push({ ...product, quantity: inventory.quantity });
                    } else {
                        processedItems.push(product);
                    }
                }

                return processedItems;
            },
            { timeout: 9500 },
        );

        // Log Audit Action (performs its own tenantPrisma lookup)
        await logAction({
            action: isBatch ? "CREATE_PRODUCTS_BATCH" : "CREATE_PRODUCT",
            entityType: "PRODUCT",
            entityId: isBatch ? undefined : results[0].id,
            details: isBatch ? { count: results.length } : { sku: results[0].sku, name: results[0].name },
            userId: currentUser.id,
            businessId: bId,
            ipAddress: req.headers["x-forwarded-for"] as string || req.socket.remoteAddress,
            userAgent: req.headers["user-agent"],
        });

        return res.status(201).json(isBatch ? results : results[0]);
    } catch (error: any) {
        console.error("Product Creation Error:", error);
        res.status(500).json({
            error: error.message || "Failed to add or update product",
        });
    }
};

export const addProduct = addCreatedBy(handler);


import { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/utils/lib/client";
import * as XLSX from "xlsx";
import formidable from "formidable";
import fs from "fs";

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { userId } = getAuth(req);
        if (!userId) {
            // console.log("❌ Import Failed: Unauthorized user");
            return res.status(401).json({ error: "Unauthorized" });
        }

        // console.log(`🚀 Starting Import for User: ${userId}`);

        // Get User Context
        const currentUser = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { businessId: true },
        });

        if (!currentUser || !currentUser.businessId) {
            // console.log("❌ Import Failed: Business not found");
            return res.status(404).json({ error: "Business not found" });
        }

        // Parse Upload
        const form = formidable({});
        const [fields, files] = await form.parse(req);
        const uploadedFile = files.file?.[0];

        if (!uploadedFile) {
            // console.log("❌ Import Failed: No file uploaded");
            return res.status(400).json({ error: "No file uploaded" });
        }

        // Read Excel
        // console.log(`📂 Reading file: ${uploadedFile.originalFilename}`);
        const fileBuffer = fs.readFileSync(uploadedFile.filepath);
        const workbook = XLSX.read(fileBuffer, { type: "buffer" });

        const getSheetData = (sheetName: string) => {
            const sheet = workbook.Sheets[sheetName];
            return sheet ? XLSX.utils.sheet_to_json<any>(sheet) : [];
        };

        const categoriesData = getSheetData("Categories");
        const customersData = getSheetData("Customers");
        const productsData = getSheetData("Products");
        const invoicesData = getSheetData("Invoices");
        const invoiceItemsData = getSheetData("Invoice Items");

        //     console.log(`📊 Data Found:
        //   - Categories: ${categoriesData.length}
        //   - Customers: ${customersData.length}
        //   - Products: ${productsData.length}
        //   - Invoices: ${invoicesData.length}
        //   - Invoice Items: ${invoiceItemsData.length}
        // `);

        // START TRANSACTION
        await prisma.$transaction(
            async (tx) => {
                // --- Helper: Bulletproof Find or Create Category ---
                const findOrCreateCategory = async (rawName: string) => {
                    const name = rawName
                        ? rawName.toString().trim()
                        : "Uncategorized";

                    // 1. Try finding it normally
                    const existing = await tx.category.findFirst({
                        where: { name: name, createdBy: userId },
                    });
                    if (existing) {
                        // console.log(`   > Found Category: "${name}"`);
                        return existing.id;
                    }

                    // 2. Try creating it
                    try {
                        // console.log(`   > Creating Category: "${name}"`);
                        const newCat = await tx.category.create({
                            data: {
                                name: name,
                                description: "Imported via Product",
                                createdBy: userId,
                            },
                        });
                        return newCat.id;
                    } catch (error: any) {
                        if (error.code === "P2002") {
                            // console.log(
                            //     `   > Race Condition: Category "${name}" existed after all. Fetching...`
                            // );
                            const retry = await tx.category.findFirst({
                                where: { name: name, createdBy: userId },
                            });
                            if (retry) return retry.id;
                        }
                        throw error;
                    }
                };

                // --- A. Categories ---
                // console.log("--- Processing Categories ---");
                const categoryMap = new Map<string, string>();
                for (const row of categoriesData) {
                    const name = row["Category Name"];
                    if (!name) continue;
                    const catId = await findOrCreateCategory(name);
                    categoryMap.set(name.toString().trim(), catId);
                }

                // --- B. Customers ---
                // console.log("--- Processing Customers ---");
                const customerMap = new Map<string, string>();
                for (const row of customersData) {
                    const email = row["Email"]
                        ? row["Email"].toString().trim()
                        : null;
                    const phone = row["Phone Number"]
                        ? row["Phone Number"].toString().trim()
                        : null;
                    const key = email || phone;

                    if (!key) continue;

                    let customer = await tx.customer.findFirst({
                        where: {
                            OR: [
                                { email: email || undefined },
                                { phoneNumber: phone || undefined },
                            ],
                            createdBy: userId,
                        },
                    });

                    if (!customer) {
                        try {
                            // console.log(`   > Creating Customer: ${row["First Name"]} ${row["Last Name"]}`);
                            customer = await tx.customer.create({
                                data: {
                                    firstName: row["First Name"],
                                    lastName: row["Last Name"],
                                    email: email,
                                    phoneNumber: phone || "",
                                    createdBy: userId,
                                },
                            });
                        } catch (e: any) {
                            if (e.code === "P2002") {
                                // console.log(`   > Duplicate Customer found during creation: ${email || phone}`);
                                customer = await tx.customer.findFirst({
                                    where: {
                                        OR: [
                                            { email: email || undefined },
                                            { phoneNumber: phone || undefined },
                                        ],
                                        createdBy: userId,
                                    },
                                });
                            }
                        }
                    } else {
                        // console.log(`   > Found Existing Customer: ${email || phone}`);
                    }

                    if (customer) {
                        if (email) customerMap.set(email, customer.id);
                        if (phone) customerMap.set(phone, customer.id);
                    }
                }

                // --- C. Products ---
                // console.log("--- Processing Products ---");
                const productMap = new Map<string, string>();
                let newProductsCount = 0;
                let existingProductsCount = 0;

                for (const row of productsData) {
                    const rawSku = row["SKU"];
                    const categoryName = row["Category"];

                    if (!rawSku) continue;
                    const sku = rawSku.toString().trim();

                    let categoryId = categoryMap.get(
                        categoryName?.toString().trim()
                    );

                    if (!categoryId) {
                        // console.log(`   > Category "${categoryName}" missing for product ${sku}. Auto-creating...`);
                        categoryId = await findOrCreateCategory(categoryName);
                        if (categoryName)
                            categoryMap.set(
                                categoryName.toString().trim(),
                                categoryId
                            );
                    }

                    let product = await tx.product.findUnique({
                        where: { sku },
                    });

                    if (product) {
                        existingProductsCount++;
                        productMap.set(sku, product.id);
                    } else {
                        try {
                            product = await tx.product.create({
                                data: {
                                    name: row["Product Name"],
                                    description: row["Description"] || "",
                                    price: parseFloat(row["Price"]) || 0,
                                    sku: sku,
                                    quantity: parseInt(row["Quantity"]) || 0,
                                    inStock: row["In Stock"] === "Yes",
                                    categoryId: categoryId,
                                    createdBy: userId,
                                },
                            });
                            newProductsCount++;
                            productMap.set(sku, product.id);
                        } catch (e: any) {
                            if (e.code === "P2002") {
                                // console.log(
                                //     `   > Skipping duplicate SKU create: ${sku}`
                                // );
                                const existingP = await tx.product.findUnique({
                                    where: { sku },
                                });
                                if (existingP)
                                    productMap.set(sku, existingP.id);
                            }
                        }
                    }
                }
                // console.log(
                //     `   > Products Summary: ${newProductsCount} New, ${existingProductsCount} Existing`
                // );

                // --- D. Invoices ---
                // console.log("--- Processing Invoices ---");
                const invoiceIdMap = new Map<string, string>();
                let invoicesCreated = 0;

                for (const row of invoicesData) {
                    const oldExcelId = row["Invoice ID"];
                    if (!oldExcelId) continue;

                    const customerEmail = row["Customer Email"]
                        ? row["Customer Email"].toString().trim()
                        : null;
                    const customerId = customerMap.get(customerEmail);

                    const newInvoice = await tx.invoice.create({
                        data: {
                            invoiceName:
                                row["Invoice Name"] || `Imported Invoice`,
                            totalAmount: parseFloat(row["Total Amount"]) || 0,
                            status: row["Status"] || "PENDING",
                            paymentType: row["Payment Type"] || "CASH",
                            customerId: customerId || null,
                            createdBy: userId,
                        },
                    });

                    invoiceIdMap.set(oldExcelId, newInvoice.id);
                    invoicesCreated++;
                }
                // console.log(`   > Created ${invoicesCreated} Invoices`);

                // --- E. Invoice Items ---
                // console.log("--- Processing Invoice Items ---");
                const itemsToCreate: any[] = [];

                for (const row of invoiceItemsData) {
                    const oldExcelInvoiceId = row["Invoice ID"];
                    const rawProductSku = row["Product SKU"];

                    if (!oldExcelInvoiceId || !rawProductSku) continue;

                    const productSku = rawProductSku.toString().trim();
                    const newInvoiceId = invoiceIdMap.get(oldExcelInvoiceId);
                    const resolvedProductId = productMap.get(productSku);

                    if (newInvoiceId && resolvedProductId) {
                        itemsToCreate.push({
                            invoiceId: newInvoiceId,
                            productId: resolvedProductId,
                            quantity: parseInt(row["Quantity"]) || 1,
                            price: parseFloat(row["Unit Price"]) || 0,
                            createdBy: userId,
                        });
                    } else {
                        // console.log(`   ⚠️ Skipping Item: Inv ${oldExcelInvoiceId} or SKU ${productSku} not resolved.`);
                    }
                }

                if (itemsToCreate.length > 0) {
                    // console.log(
                    //     `   > Batch Inserting ${itemsToCreate.length} Invoice Items...`
                    // );
                    await tx.invoiceItem.createMany({
                        data: itemsToCreate,
                    });
                } else {
                    // console.log("   > No invoice items matched to create.");
                }
            },
            {
                maxWait: 5000,
                timeout: 50000,
            }
        );

        // console.log("✅ Import Completed Successfully");
        return res.status(200).json({ message: "Data imported successfully" });
    } catch (error) {
        // console.error("❌ IMPORT ERROR:", error);
        return res.status(500).json({
            error: "Failed to import data",
            details: error instanceof Error ? error.message : "Unknown error",
        });
    }
}

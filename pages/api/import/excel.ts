import { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/utils/lib/client";
import * as XLSX from "xlsx";
import formidable from "formidable";
import fs from "fs";
import { randomUUID } from "crypto";

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
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        // 1. Get Context
        const currentUser = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { businessId: true },
        });

        if (!currentUser || !currentUser.businessId) {
            return res.status(404).json({ error: "Business not found" });
        }

        // 2. Parse File
        const form = formidable({});
        const [fields, files] = await form.parse(req);
        const uploadedFile = files.file?.[0];

        if (!uploadedFile) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        // 3. Read Excel Data
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

        // 4. DATABASE TRANSACTION (Pure Bulk Operations)
        await prisma.$transaction(
            async (tx) => {
                // --- A. BULK CATEGORIES ---
                const uniqueCatNames = Array.from(
                    new Set(
                        categoriesData
                            .map((c: any) =>
                                c["Category Name"]?.toString().trim()
                            )
                            .filter(Boolean)
                    )
                );

                if (uniqueCatNames.length > 0) {
                    await tx.category.createMany({
                        data: uniqueCatNames.map((name) => ({
                            name,
                            description: "Imported",
                            createdBy: userId,
                        })),
                        skipDuplicates: true,
                    });
                }

                // Fetch IDs for linking
                const allCategories = await tx.category.findMany({
                    where: {
                        name: { in: uniqueCatNames as string[] },
                        createdBy: userId,
                    },
                    select: { id: true, name: true },
                });
                const categoryMap = new Map<string, string>();
                allCategories.forEach((c) => categoryMap.set(c.name, c.id));

                // --- B. BULK CUSTOMERS ---

                const customersToInsert = customersData
                    .filter((c: any) => c["Email"] || c["Phone Number"])
                    .map((c: any) => ({
                        // Use || "" to ensure these are never undefined, which Prisma hates
                        firstName: c["First Name"]?.toString().trim() || "",
                        lastName: c["Last Name"]?.toString().trim() || "",
                        email: c["Email"]?.toString().trim() || null,
                        phoneNumber: c["Phone Number"]?.toString().trim() || "",
                        // Ensure these are passed as strings (assuming checks passed earlier)
                        businessId: currentUser.businessId!,
                        createdById: userId!,
                    }));

                if (customersToInsert.length > 0) {
                    await tx.customer.createMany({
                        data: customersToInsert,
                        skipDuplicates: true,
                    });
                }

                // Fetch IDs for linking
                const contactKeys = customersToInsert
                    .map((c) => c.email)
                    .filter(Boolean) as string[];
                const phoneKeys = customersToInsert
                    .map((c) => c.phoneNumber)
                    .filter(Boolean) as string[];

                const allCustomers = await tx.customer.findMany({
                    where: {
                        OR: [
                            { email: { in: contactKeys } },
                            { phoneNumber: { in: phoneKeys } },
                        ],
                        createdBy: userId,
                    },
                    select: { id: true, email: true, phoneNumber: true },
                });
                const customerMap = new Map<string, string>();
                allCustomers.forEach((c) => {
                    if (c.email) customerMap.set(c.email, c.id);
                    if (c.phoneNumber) customerMap.set(c.phoneNumber, c.id);
                });

                // --- C. BULK PRODUCTS ---
                const productsToInsert = productsData
                    .filter((p: any) => p["SKU"])
                    .map((p: any) => {
                        const catId =
                            categoryMap.get(p["Category"]?.toString().trim()) ||
                            categoryMap.get("Uncategorized");
                        if (!catId) return null;

                        return {
                            name: p["Product Name"],
                            description: p["Description"] || "",
                            price: parseFloat(p["Price"]) || 0,
                            sku: p["SKU"].toString().trim(),
                            quantity: parseInt(p["Quantity"]) || 0,
                            inStock: p["In Stock"] === "Yes",
                            categoryId: catId,
                            createdBy: userId,
                        };
                    })
                    .filter(
                        (item): item is NonNullable<typeof item> =>
                            item !== null
                    );

                if (productsToInsert.length > 0) {
                    await tx.product.createMany({
                        data: productsToInsert,
                        skipDuplicates: true,
                    });
                }

                // Fetch IDs for linking
                const skuKeys = productsToInsert.map((p) => p.sku);
                const allProducts = await tx.product.findMany({
                    where: { sku: { in: skuKeys } },
                    select: { id: true, sku: true },
                });
                const productMap = new Map<string, string>();
                allProducts.forEach((p) => productMap.set(p.sku, p.id));

                // --- D. BULK INVOICES (OPTIMIZED: PRE-GENERATE UUIDs) ---
                // Instead of loop + create, we generate IDs here and bulk insert.
                const invoiceIdMap = new Map<string, string>();
                const invoicesToCreate: any[] = [];

                for (const row of invoicesData) {
                    const oldExcelId = row["Invoice ID"];
                    if (!oldExcelId) continue;

                    // 1. Generate ID in memory
                    const newInvoiceId = randomUUID();
                    invoiceIdMap.set(oldExcelId, newInvoiceId);

                    const customerEmail = row["Customer Email"]
                        ?.toString()
                        .trim();
                    const customerId = customerMap.get(customerEmail);

                    // 2. Prepare object with explicit ID
                    invoicesToCreate.push({
                        id: newInvoiceId, // Explicitly set ID
                        invoiceName: row["Invoice Name"] || "Imported Invoice",
                        totalAmount: parseFloat(row["Total Amount"]) || 0,
                        status: row["Status"] || "PENDING",
                        paymentType: row["Payment Type"] || "CASH",
                        customerId: customerId || null,
                        createdBy: userId,
                        createdAt: row["Date Issued"]
                            ? new Date(row["Date Issued"])
                            : new Date(),
                        updatedAt: new Date(),
                    });
                }

                // 3. Single DB Call for ALL Invoices
                if (invoicesToCreate.length > 0) {
                    await tx.invoice.createMany({
                        data: invoicesToCreate,
                        skipDuplicates: true,
                    });
                }

                // --- E. BULK INVOICE ITEMS ---
                // Now we can link items because we already decided the Invoice IDs above.
                const itemsToCreate: any[] = [];

                for (const row of invoiceItemsData) {
                    const newInvoiceId = invoiceIdMap.get(row["Invoice ID"]);
                    const productId = productMap.get(
                        row["Product SKU"]?.toString().trim()
                    );

                    if (newInvoiceId && productId) {
                        itemsToCreate.push({
                            invoiceId: newInvoiceId,
                            productId: productId,
                            quantity: parseInt(row["Quantity"]) || 1,
                            price: parseFloat(row["Unit Price"]) || 0,
                            createdBy: userId,
                        });
                    }
                }

                // 4. Single DB Call for ALL Items
                if (itemsToCreate.length > 0) {
                    await tx.invoiceItem.createMany({
                        data: itemsToCreate,
                    });
                }
            },
            {
                maxWait: 10000,
                timeout: 20000,
            }
        );

        return res.status(200).json({ message: "Data imported successfully" });
    } catch (error) {
        console.error("Import error:", error);
        return res.status(500).json({
            error: "Failed to import data",
            details: error instanceof Error ? error.message : "Unknown error",
        });
    }
}

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

const normalize = (val: any) => {
    if (val === null || val === undefined) return "";
    return String(val).trim().toLowerCase();
};

const cleanString = (val: any) => (val ? String(val).trim() : "");

const parseAmount = (val: any) => {
    if (!val) return 0;
    const str = String(val).replace(/,/g, "").trim();
    return parseFloat(str) || 0;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { userId: clerkUserId } = getAuth(req);
        if (!clerkUserId)
            return res.status(401).json({ error: "Unauthorized" });

        const currentUser = await prisma.user.findUnique({
            where: { clerkId: clerkUserId },
            select: { id: true, businessId: true },
        });

        if (!currentUser || !currentUser.businessId) {
            return res.status(404).json({ error: "Business/User not found" });
        }

        const internalUserId = currentUser.id;
        const businessId = currentUser.businessId;

        const form = formidable({});
        const [fields, files] = await form.parse(req);
        const uploadedFile = files.file?.[0];

        if (!uploadedFile) {
            return res.status(400).json({ error: "No file uploaded" });
        }

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
        const mpesaPaymentsData = getSheetData("Mpesa Payments");
        const successCallbacksData = getSheetData("Success Callbacks");
        const failedCallbacksData = getSheetData("Failed Callbacks");

        await prisma.$transaction(
            async (tx) => {
                const categoryNames = new Set<string>();
                categoryNames.add("Uncategorized");

                categoriesData.forEach((c: any) => {
                    const n = c["Category Name"] || c["Name"];
                    if (n) categoryNames.add(cleanString(n));
                });

                productsData.forEach((p: any) => {
                    const n = p["Category"] || p["Category Name"];
                    if (n) categoryNames.add(cleanString(n));
                });

                if (categoryNames.size > 0) {
                    await tx.category.createMany({
                        data: Array.from(categoryNames).map((name) => ({
                            name,
                            description: "Imported",
                            createdBy: clerkUserId,
                        })),
                        skipDuplicates: true,
                    });
                }

                const allCategories = await tx.category.findMany({
                    where: { createdBy: clerkUserId },
                    select: { id: true, name: true },
                });
                const categoryMap = new Map<string, string>();
                allCategories.forEach((c) =>
                    categoryMap.set(normalize(c.name), c.id)
                );
                const defaultCatId = categoryMap.get("uncategorized")!;

                const customersToInsert = customersData.map((c: any) => {
                    let firstName = cleanString(c["First Name"]);
                    let lastName = cleanString(c["Last Name"]);

                    if (!firstName && c["Name"]) {
                        const parts = cleanString(c["Name"]).split(" ");
                        firstName = parts[0];
                        lastName = parts.slice(1).join(" ");
                    }

                    let phone = cleanString(c["Phone Number"] || c["Phone"]);
                    if (!phone) {
                        phone = `no-phone-${randomUUID()}`;
                    }

                    return {
                        firstName,
                        lastName,
                        email: cleanString(c["Email"]) || null,
                        phoneNumber: phone,
                        businessId,
                        createdById: internalUserId,
                    };
                });

                if (customersToInsert.length > 0) {
                    await tx.customer.createMany({
                        data: customersToInsert,
                        skipDuplicates: true,
                    });
                }

                const contactKeys = customersToInsert
                    .map((c) => c.email)
                    .filter(Boolean) as string[];
                const phoneKeys = customersToInsert
                    .map((c) => c.phoneNumber)
                    .filter(Boolean) as string[];

                const allCustomers = await tx.customer.findMany({
                    where: {
                        businessId,
                        OR: [
                            { email: { in: contactKeys } },
                            { phoneNumber: { in: phoneKeys } },
                        ],
                    },
                    select: { id: true, email: true, phoneNumber: true },
                });
                const customerMap = new Map<string, string>();
                allCustomers.forEach((c) => {
                    if (c.email) customerMap.set(normalize(c.email), c.id);
                    if (c.phoneNumber)
                        customerMap.set(normalize(c.phoneNumber), c.id);
                });

                const productsToInsert = productsData
                    .filter((p: any) => p["SKU"])
                    .map((p: any) => {
                        const catName = p["Category"] || p["Category Name"];
                        const catId =
                            categoryMap.get(normalize(catName)) || defaultCatId;

                        return {
                            name: cleanString(
                                p["Product Name"] || p["Name"] || "Unknown"
                            ),
                            description: cleanString(
                                p["Description"] || p["Desc"]
                            ),
                            price: parseAmount(p["Price"]),
                            sku: cleanString(p["SKU"]),
                            quantity: parseInt(p["Quantity"] || p["Qty"]) || 0,
                            inStock:
                                p["In Stock"] === "Yes" ||
                                p["In Stock"] === true,
                            categoryId: catId,
                            createdBy: clerkUserId,
                        };
                    });

                if (productsToInsert.length > 0) {
                    await tx.product.createMany({
                        data: productsToInsert,
                        skipDuplicates: true,
                    });
                }

                const skuList = productsToInsert.map((p) => p.sku);
                const allProducts = await tx.product.findMany({
                    where: { sku: { in: skuList } },
                    select: { id: true, sku: true },
                });
                const productMap = new Map<string, string>();
                allProducts.forEach((p) =>
                    productMap.set(normalize(p.sku), p.id)
                );

                const invoiceIdMap = new Map<string, string>();
                const invoiceNameMap = new Map<string, string>();
                const invoicesToCreate: any[] = [];

                invoicesData.forEach((row: any) => {
                    const newId = randomUUID();
                    const oldId = cleanString(row["Invoice ID"]);
                    const name = cleanString(row["Invoice Name"]);

                    if (oldId) invoiceIdMap.set(normalize(oldId), newId);
                    if (name) invoiceNameMap.set(normalize(name), newId);

                    const email = cleanString(
                        row["Customer Email"] || row["Email"]
                    );
                    const customerId = customerMap.get(normalize(email));

                    invoicesToCreate.push({
                        id: newId,
                        invoiceName: name || "Imported Invoice",
                        totalAmount: parseAmount(
                            row["Total Amount"] || row["Amount"]
                        ),
                        status: row["Status"] || "PENDING",
                        paymentType:
                            row["Payment Type"] || row["Type"] || "CASH",
                        stockRestored: row["Stock Restored"] === "Yes",
                        customerId: customerId || null,
                        createdBy: clerkUserId,
                        createdAt: row["Date Issued"]
                            ? new Date(row["Date Issued"])
                            : new Date(),
                        updatedAt: new Date(),
                    });
                });

                if (invoicesToCreate.length > 0) {
                    await tx.invoice.createMany({
                        data: invoicesToCreate,
                        skipDuplicates: true,
                    });
                }

                const itemsToCreate = invoiceItemsData
                    .map((row: any) => {
                        const invKeyId = cleanString(row["Invoice ID"]);
                        const invKeyName = cleanString(
                            row["Invoice Name"] || row["Invoice"]
                        );

                        const invoiceId =
                            invoiceIdMap.get(normalize(invKeyId)) ||
                            invoiceNameMap.get(normalize(invKeyName));

                        const skuKey = cleanString(
                            row["Product SKU"] || row["SKU"]
                        );
                        const productId = productMap.get(normalize(skuKey));

                        if (!invoiceId || !productId) return null;

                        return {
                            invoiceId,
                            productId,
                            quantity:
                                parseInt(row["Quantity"] || row["Qty"]) || 1,
                            price: parseAmount(
                                row["Unit Price"] || row["Price"]
                            ),
                            createdBy: clerkUserId,
                        };
                    })
                    .filter((i): i is NonNullable<typeof i> => i !== null);

                if (itemsToCreate.length > 0) {
                    await tx.invoiceItem.createMany({ data: itemsToCreate });
                }

                const paymentsToCreate = mpesaPaymentsData
                    .map((row: any) => {
                        const invKey = cleanString(
                            row["Invoice Name"] || row["Invoice"]
                        );
                        const invoiceId = invoiceNameMap.get(normalize(invKey));

                        if (!invoiceId) return null;

                        return {
                            amount: parseAmount(row["Amount"]),
                            phoneNumber: cleanString(
                                row["Phone Number"] || row["Phone"]
                            ),
                            accountReference: row["Reference"] || "Salesense",
                            transactionDesc: cleanString(
                                row["Transaction Desc"] || row["Code"]
                            ),
                            merchantRequestId:
                                row["Merchant Request ID"] || randomUUID(),
                            checkoutRequestId:
                                row["Checkout Request ID"] || randomUUID(),
                            status: row["Status"] || "PENDING",
                            invoiceId,
                            businessId,
                            userId: internalUserId,
                            createdAt: row["Date Initiated"]
                                ? new Date(row["Date Initiated"])
                                : new Date(),
                        };
                    })
                    .filter((p): p is NonNullable<typeof p> => p !== null);

                if (paymentsToCreate.length > 0) {
                    await tx.mpesaPayment.createMany({
                        data: paymentsToCreate,
                        skipDuplicates: true,
                    });
                }

                const successCallbacksToCreate = successCallbacksData
                    .map((row: any) => {
                        const invKey = cleanString(
                            row["Invoice Name"] || row["Invoice"]
                        );
                        const invoiceId = invoiceNameMap.get(normalize(invKey));
                        if (!invoiceId) return null;

                        return {
                            merchantRequestId: row["Merchant Request ID"] || "",
                            checkoutRequestId: row["Checkout Request ID"] || "",
                            resultCode: parseInt(row["Result Code"]) || 0,
                            resultDesc: row["Result Desc"] || "",
                            amount: parseAmount(row["Amount"]),
                            mpesaReceiptNumber: cleanString(
                                row["Receipt Number"] || row["Receipt"]
                            ),
                            transactionDate: BigInt(
                                row["Transaction Date"]?.toString() || "0"
                            ),
                            phoneNumber: BigInt(
                                row["Phone Number"]?.toString() ||
                                    row["Phone"]?.toString() ||
                                    "0"
                            ),
                            invoiceId,
                            createdAt: row["Callback Received At"]
                                ? new Date(row["Callback Received At"])
                                : new Date(),
                        };
                    })
                    .filter((c): c is NonNullable<typeof c> => c !== null);

                if (successCallbacksToCreate.length > 0) {
                    await tx.successfulCallback.createMany({
                        data: successCallbacksToCreate,
                    });
                }

                const failedCallbacksToCreate = failedCallbacksData
                    .map((row: any) => {
                        const invKey = cleanString(
                            row["Invoice Name"] || row["Invoice"]
                        );
                        const invoiceId = invoiceNameMap.get(normalize(invKey));
                        if (!invoiceId) return null;

                        return {
                            merchantRequestId: row["Merchant Request ID"] || "",
                            checkoutRequestId: row["Checkout Request ID"] || "",
                            resultCode:
                                parseInt(row["Result Code"] || row["Code"]) ||
                                1,
                            resultDesc: cleanString(
                                row["Result Desc"] || row["Reason"] || "Failed"
                            ),
                            invoiceId,
                            createdAt: row["Callback Received At"]
                                ? new Date(row["Callback Received At"])
                                : new Date(),
                        };
                    })
                    .filter((c): c is NonNullable<typeof c> => c !== null);

                if (failedCallbacksToCreate.length > 0) {
                    await tx.failedCallback.createMany({
                        data: failedCallbacksToCreate,
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

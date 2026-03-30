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
            select: { id: true, businessId: true, storeId: true },
        });

        if (!currentUser || !currentUser.businessId) {
            return res.status(404).json({ error: "Business/User not found" });
        }

        const internalUserId = currentUser.id;
        const businessId = currentUser.businessId;
        const userStoreId = currentUser.storeId;

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
        const expensesData = getSheetData("Expenses");

        await prisma.$transaction(
            async (tx) => {
                // 1. Categories
                for (const row of categoriesData) {
                    const name = cleanString(row["Name"] || row["Category Name"]);
                    if (!name) continue;
                    await tx.category.upsert({
                        where: { name_createdBy: { name, createdBy: clerkUserId } },
                        update: { description: cleanString(row["Description"]) },
                        create: {
                            name,
                            description: cleanString(row["Description"]),
                            createdBy: clerkUserId,
                            businessId: businessId,
                        },
                    });
                }

                const allCategories = await tx.category.findMany({
                    where: { businessId },
                    select: { id: true, name: true },
                });
                const categoryMap = new Map(allCategories.map(c => [normalize(c.name), c.id]));

                // 2. Customers
                for (const row of customersData) {
                    const phone = cleanString(row["Phone Number"] || row["Phone"]);
                    if (!phone) continue;

                    await tx.customer.upsert({
                        where: { businessId_phoneNumber: { businessId, phoneNumber: phone } },
                        update: {
                            firstName: cleanString(row["First Name"] || row["Name"]?.split(" ")[0]),
                            lastName: cleanString(row["Last Name"] || row["Name"]?.split(" ").slice(1).join(" ")),
                            email: cleanString(row["Email"]),
                        },
                        create: {
                            firstName: cleanString(row["First Name"] || row["Name"]?.split(" ")[0]),
                            lastName: cleanString(row["Last Name"] || row["Name"]?.split(" ").slice(1).join(" ")),
                            email: cleanString(row["Email"]),
                            phoneNumber: phone,
                            businessId,
                            storeId: userStoreId,
                            createdById: internalUserId,
                        },
                    });
                }

                // 3. Products & Store Inventory
                for (const row of productsData) {
                    const sku = cleanString(row["SKU"]);
                    if (!sku) continue;

                    const catName = cleanString(row["Category"]);
                    const categoryId = categoryMap.get(normalize(catName)) || allCategories[0]?.id;

                    if (!categoryId) continue;

                    const product = await tx.product.upsert({
                        where: { sku },
                        update: {
                            name: cleanString(row["Name"] || row["Product Name"]),
                            price: parseAmount(row["Price"]),
                            description: cleanString(row["Description"]),
                            categoryId,
                        },
                        create: {
                            name: cleanString(row["Name"] || row["Product Name"]),
                            sku,
                            price: parseAmount(row["Price"]),
                            description: cleanString(row["Description"]),
                            categoryId,
                            businessId,
                            createdBy: clerkUserId,
                            inStock: true,
                        },
                    });

                    // Update Inventory for the current store
                    if (userStoreId) {
                        const qty = parseInt(row["Quantity"] || row["Qty"]) || 0;
                        await tx.storeInventory.upsert({
                            where: { storeId_productId: { storeId: userStoreId, productId: product.id } },
                            update: { quantity: { increment: qty > 0 ? qty : 0 } },
                            create: {
                                storeId: userStoreId,
                                productId: product.id,
                                quantity: qty > 0 ? qty : 0,
                            },
                        });
                    }
                }

                // 4. Expenses
                for (const row of expensesData) {
                    const title = cleanString(row["Title"]);
                    if (!title) continue;

                    await tx.expense.create({
                        data: {
                            title,
                            category: cleanString(row["Category"] || "General"),
                            amount: parseAmount(row["Amount"]),
                            date: row["Date"] ? new Date(row["Date"]) : new Date(),
                            notes: cleanString(row["Notes"]),
                            businessId,
                            storeId: userStoreId,
                            createdById: internalUserId,
                        },
                    });
                }
            },
            { timeout: 30000 }
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

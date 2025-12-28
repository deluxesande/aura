import { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/utils/lib/client";
import * as XLSX from "xlsx";

// Helper to format date for import compatibility: "YYYY-MM-DD HH:mm:ss"
const formatDate = (date: Date) => {
    return date.toISOString().replace("T", " ").split(".")[0];
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        // 1. Authentication
        const { userId } = getAuth(req);

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // 2. Get User's Business ID
        const currentUser = await prisma.user.findUnique({
            where: { clerkId: userId },
            select: { businessId: true },
        });

        if (!currentUser || !currentUser.businessId) {
            return res
                .status(404)
                .json({ error: "User or business not found" });
        }

        // 3. Get All User IDs in the Business
        const businessUsers = await prisma.user.findMany({
            where: { businessId: currentUser.businessId },
            select: { clerkId: true },
        });

        const userIds = businessUsers.map((u) => u.clerkId);

        // 4. Fetch Data (Added Business and Invoice Items)
        const [
            business,
            products,
            invoices,
            invoiceItems,
            categories,
            customers,
        ] = await Promise.all([
            // Business Info
            prisma.business.findUnique({
                where: { id: currentUser.businessId },
            }),
            // Products
            prisma.product.findMany({
                where: { createdBy: { in: userIds } },
                include: { Category: { select: { name: true } } },
                orderBy: { createdAt: "desc" },
            }),
            // Invoices
            prisma.invoice.findMany({
                where: { createdBy: { in: userIds } },
                include: {
                    Customer: {
                        select: {
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                    invoiceItems: true, // Just count here
                },
                orderBy: { createdAt: "desc" },
            }),
            // Invoice Items (Detailed Breakdown)
            prisma.invoiceItem.findMany({
                where: { createdBy: { in: userIds } },
                include: {
                    Product: { select: { name: true, sku: true } },
                    Invoice: { select: { invoiceName: true, createdAt: true } },
                },
                orderBy: { Invoice: { createdAt: "desc" } },
            }),
            // Categories
            prisma.category.findMany({
                where: { createdBy: { in: userIds } },
                orderBy: { name: "asc" },
            }),
            // Customers
            prisma.customer.findMany({
                where: { createdBy: { in: userIds } },
                orderBy: { createdAt: "desc" },
            }),
        ]);

        // 5. Format Data

        // --- Business Sheet ---
        const businessRows = business
            ? [
                  {
                      "Business Name": business.name,
                      "Business ID": business.id,
                      "Created By (User ID)": business.createdBy || "N/A",
                      "Date Created": formatDate(business.createdAt),
                      "Last Updated": formatDate(business.updatedAt),
                  },
              ]
            : [];

        // --- Products Sheet ---
        const productRows = products.map((p) => ({
            "Product Name": p.name,
            Description: p.description,
            SKU: p.sku,
            Price: p.price,
            Quantity: p.quantity,
            "In Stock": p.inStock ? "Yes" : "No",
            Category: p.Category?.name || "Uncategorized",
            "Created At": formatDate(p.createdAt),
            "Last Updated": formatDate(p.updatedAt),
        }));

        // --- Invoices Sheet ---
        const invoiceRows = invoices.map((inv) => ({
            "Invoice ID": inv.id,
            "Invoice Name": inv.invoiceName || "N/A",
            Customer: inv.Customer
                ? `${inv.Customer.firstName || ""} ${
                      inv.Customer.lastName || ""
                  }`.trim()
                : "Guest/Unknown",
            "Customer Email": inv.Customer?.email || "N/A",
            Status: inv.status,
            "Payment Type": inv.paymentType,
            "Total Amount": inv.totalAmount,
            "Items Count": inv.invoiceItems.length,
            "Date Issued": formatDate(inv.createdAt),
        }));

        // --- Invoice Items Sheet (Linked) ---
        const invoiceItemRows = invoiceItems.map((item) => ({
            "Invoice ID": item.invoiceId, // Key for linking
            "Invoice Name": item.Invoice?.invoiceName || "N/A",
            "Product Name": item.Product.name,
            "Product SKU": item.Product.sku,
            Quantity: item.quantity,
            "Unit Price": item.price,
            "Line Total": item.price * item.quantity,
            "Date Added": item.Invoice?.createdAt
                ? formatDate(item.Invoice.createdAt)
                : "N/A",
        }));

        // --- Customers Sheet ---
        const customerRows = customers.map((c) => ({
            "First Name": c.firstName || "",
            "Last Name": c.lastName || "",
            Email: c.email || "",
            "Phone Number": c.phoneNumber || "",
            "Date Added": formatDate(c.createdAt),
        }));

        // --- Categories Sheet ---
        const categoryRows = categories.map((c) => ({
            "Category Name": c.name,
            Description: c.description || "",
        }));

        // 6. Create Workbook
        const workbook = XLSX.utils.book_new();

        const addToWorkbook = (data: any[], sheetName: string) => {
            if (data.length > 0) {
                const sheet = XLSX.utils.json_to_sheet(data);
                // Auto-width columns slightly
                const wscols = Object.keys(data[0]).map(() => ({ wch: 25 }));
                sheet["!cols"] = wscols;
                XLSX.utils.book_append_sheet(workbook, sheet, sheetName);
            } else {
                const sheet = XLSX.utils.json_to_sheet([
                    { Info: `No ${sheetName} found` },
                ]);
                XLSX.utils.book_append_sheet(workbook, sheet, sheetName);
            }
        };

        // Order of sheets in the Excel file
        addToWorkbook(businessRows, "Business Info");
        addToWorkbook(invoiceRows, "Invoices");
        addToWorkbook(invoiceItemRows, "Invoice Items"); // New Sheet
        addToWorkbook(productRows, "Products");
        addToWorkbook(customerRows, "Customers");
        addToWorkbook(categoryRows, "Categories");

        // 7. Generate & Send
        const buffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "buffer",
        });
        const fileName = `business_data_${formatDate(new Date()).replace(
            /[: ]/g,
            "-"
        )}.xlsx`;

        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${fileName}"`
        );
        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        return res.send(buffer);
    } catch (error) {
        console.error("Excel download error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

import { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/utils/lib/client";
import * as XLSX from "xlsx";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { userId: clerkUserId } = getAuth(req);
        if (!clerkUserId)
            return res.status(401).json({ error: "Unauthorized" });

        const currentUser = await prisma.user.findUnique({
            where: { clerkId: clerkUserId },
            select: { id: true, businessId: true, storeId: true, role: true },
        });

        if (!currentUser || !currentUser.businessId) {
            return res.status(404).json({ error: "Business/User not found" });
        }

        const businessId = currentUser.businessId;
        const storeId = currentUser.storeId;
        const isAdmin = currentUser.role.toLowerCase() === "admin";

        // Filter based on role: Admins get all business data, others get store-specific data
        const filter = isAdmin ? { businessId } : { businessId, storeId };
        const businessFilter = { businessId };

        // Fetch data in parallel
        const [
            categories,
            customers,
            products,
            invoices,
            expenses,
            mpesaPayments,
        ] = await Promise.all([
            prisma.category.findMany({ where: businessFilter }),
            prisma.customer.findMany({ where: filter }),
            prisma.product.findMany({ 
                where: { businessId },
                include: { 
                    Category: true, 
                    storeInventories: true,
                    purchaseOrderItems: {
                        where: {
                            PurchaseOrder: {
                                status: { in: ["PENDING", "IN_TRANSIT"] },
                                isDeleted: false,
                            }
                        },
                        include: { PurchaseOrder: { select: { storeId: true } } }
                    }
                }
            }),
            prisma.invoice.findMany({ 
                where: filter,
                include: { Customer: true, invoiceItems: { include: { Product: true } } }
            }),
            prisma.expense.findMany({ where: filter }),
            prisma.mpesaPayment.findMany({ where: businessFilter }),
        ]);

        const workbook = XLSX.utils.book_new();

        // 1. Categories
        const categoriesSheet = XLSX.utils.json_to_sheet(
            categories.map((c) => ({
                "Category ID": c.id,
                "Name": c.name,
                "Description": c.description,
            }))
        );
        XLSX.utils.book_append_sheet(workbook, categoriesSheet, "Categories");

        // 2. Customers
        const customersSheet = XLSX.utils.json_to_sheet(
            customers.map((c) => ({
                "Customer ID": c.id,
                "First Name": c.firstName,
                "Last Name": c.lastName,
                "Email": c.email,
                "Phone Number": c.phoneNumber,
                "Created At": c.createdAt,
            }))
        );
        XLSX.utils.book_append_sheet(workbook, customersSheet, "Customers");

        // 3. Products & Stock
        const productsSheet = XLSX.utils.json_to_sheet(
            products.map((p) => {
                // For stock, if it's store specific, show that store's stock, otherwise total
                const inventoryStock = storeId 
                    ? p.storeInventories.find(si => si.storeId === storeId)?.quantity || 0
                    : p.storeInventories.reduce((acc, curr) => acc + curr.quantity, 0);

                const pendingStock = storeId
                    ? p.purchaseOrderItems
                        .filter(poi => poi.PurchaseOrder.storeId === storeId)
                        .reduce((acc, curr) => acc + curr.quantity, 0)
                    : p.purchaseOrderItems.reduce((acc, curr) => acc + curr.quantity, 0);

                const stock = inventoryStock + pendingStock;

                return {
                    "Product ID": p.id,
                    "Name": p.name,
                    "SKU": p.sku,
                    "Price": p.price,
                    "Category": p.Category?.name,
                    "Quantity": stock,
                    "Description": p.description,
                    "In Stock": p.inStock ? "Yes" : "No",
                };
            })
        );
        XLSX.utils.book_append_sheet(workbook, productsSheet, "Products");

        // 4. Invoices
        const invoicesSheet = XLSX.utils.json_to_sheet(
            invoices.map((inv) => ({
                "Invoice ID": inv.id,
                "Invoice Name": inv.invoiceName,
                "Customer": inv.Customer ? `${inv.Customer.firstName} ${inv.Customer.lastName}` : "Guest",
                "Customer Phone": inv.Customer?.phoneNumber,
                "Total Amount": inv.totalAmount,
                "Status": inv.status,
                "Payment Type": inv.paymentType,
                "Date Issued": inv.createdAt,
            }))
        );
        XLSX.utils.book_append_sheet(workbook, invoicesSheet, "Invoices");

        // 5. Invoice Items
        const invoiceItemsFlat = invoices.flatMap((inv) => 
            inv.invoiceItems.map((item) => ({
                "Invoice ID": inv.id,
                "Invoice Name": inv.invoiceName,
                "Product Name": item.Product.name,
                "SKU": item.Product.sku,
                "Quantity": item.quantity,
                "Unit Price": item.price,
                "Subtotal": item.quantity * item.price,
            }))
        );
        const invoiceItemsSheet = XLSX.utils.json_to_sheet(invoiceItemsFlat);
        XLSX.utils.book_append_sheet(workbook, invoiceItemsSheet, "Invoice Items");

        // 6. Expenses
        const expensesSheet = XLSX.utils.json_to_sheet(
            expenses.map((e) => ({
                "Expense ID": e.id,
                "Title": e.title,
                "Category": e.category,
                "Amount": e.amount,
                "Date": e.date,
                "Status": e.status,
                "Notes": e.notes,
            }))
        );
        XLSX.utils.book_append_sheet(workbook, expensesSheet, "Expenses");

        // 7. Mpesa Payments
        const mpesaSheet = XLSX.utils.json_to_sheet(
            mpesaPayments.map((p) => ({
                "Payment ID": p.id,
                "Amount": p.amount,
                "Phone": p.phoneNumber,
                "Reference": p.accountReference,
                "Status": p.status,
                "Merchant Request ID": p.merchantRequestId,
                "Checkout Request ID": p.checkoutRequestId,
                "Date": p.createdAt,
            }))
        );
        XLSX.utils.book_append_sheet(workbook, mpesaSheet, "Mpesa Payments");

        const excelBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "buffer",
        });

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=salesense_data_${new Date().toISOString().split('T')[0]}.xlsx`
        );

        return res.status(200).send(excelBuffer);
    } catch (error) {
        console.error("Export error:", error);
        return res.status(500).json({ error: "Failed to export data" });
    }
}

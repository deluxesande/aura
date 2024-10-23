import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getInvoices = async (
    req: NextApiRequest,
    res: NextApiResponse
) => {
    const invoices = await prisma.invoice.findMany({
        include: {
            invoiceItems: {
                select: {
                    quantity: true,
                    Product: {
                        select: {
                            name: true,
                            price: true,
                        },
                    },
                },
            },
        },
    });

    const updatedInvoices = invoices.map((invoice) => {
        let mostExpensiveItem: any = null;
        let totalQuantity = 0;

        invoice.invoiceItems.forEach((item) => {
            // Calculate total quantity
            totalQuantity += item.quantity;

            // Check for most expensive item
            if (
                !mostExpensiveItem ||
                item.Product.price > mostExpensiveItem.Product.price
            ) {
                mostExpensiveItem = item;
            }
        });

        // Attach the most expensive item name and total quantity to the invoice object
        return {
            ...invoice,
            itemName: mostExpensiveItem?.Product.name,
            totalQuantity,
        };
    });

    res.status(200).json(updatedInvoices);
};

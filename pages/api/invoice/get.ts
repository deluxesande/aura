import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/utils/lib/client";

export const getInvoices = async (
    req: NextApiRequest,
    res: NextApiResponse
) => {
    const { userId } = getAuth(req);

    const invoices = await prisma.invoice.findMany({
        where: {
            createdBy: userId,
        },
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
            Customer: {
                select: {
                    firstName: true,
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

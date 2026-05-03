import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import { masterPrisma, getTenantPrisma } from "@/utils/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { userId: clerkId } = getAuth(req);
    const { id: expenseId } = req.query;

    if (!clerkId || typeof expenseId !== "string") {
        return res.status(401).json({ error: "Unauthorized" });
    }

    // 1. Fetch User details from Master DB for RBAC
    const user = await masterPrisma.user.findUnique({
        where: { clerkId },
        select: { businessId: true, role: true },
    });

    if (!user || !user.businessId) {
        return res.status(403).json({ error: "Forbidden" });
    }

    const { businessId, role } = user;

    // RBAC: Only Admins and Managers can edit/void
    if (role === "user") {
        return res.status(403).json({ error: "Access denied. Only admins and managers can manage financials." });
    }

    // 2. Get Tenant Prisma client
    const tenantPrisma = await getTenantPrisma(businessId);

    // Fetch user store info from Tenant DB if manager
    let userStoreId: string | null = null;
    if (role === "manager") {
        const tenantUser = await tenantPrisma.tenantUser.findUnique({
            where: { clerkId },
            select: { storeId: true }
        });
        userStoreId = tenantUser?.storeId || null;
    }

    // 3. Verify expense existence in Tenant DB
    const existingExpense = await tenantPrisma.expense.findFirst({
        where: { id: expenseId, businessId },
    });

    if (!existingExpense) {
        return res.status(404).json({ error: "Expense not found" });
    }

    // RBAC: Managers can only modify expenses belonging to their store
    if (role === "manager" && existingExpense.storeId !== userStoreId) {
        return res.status(403).json({ error: "Access denied. You can only manage expenses for your assigned store." });
    }

    switch (req.method) {
        case "PUT":
        case "PATCH":
            try {
                const { title, category, amount, storeId: payloadStoreId, notes, date } = req.body;

                const updateData: any = {
                    title,
                    category,
                    amount: amount !== undefined ? parseFloat(amount) : undefined,
                    notes,
                    date: date ? new Date(date) : undefined,
                };

                // RBAC: Only Admins can reassign stores for expenses
                if (role === "admin" && payloadStoreId !== undefined) {
                    updateData.storeId = payloadStoreId;
                }

                const updatedExpense = await tenantPrisma.expense.update({
                    where: { id: expenseId },
                    data: updateData,
                });

                return res.status(200).json(updatedExpense);
            } catch (error) {
                console.error("UPDATE_EXPENSE_ERROR", error);
                return res.status(500).json({ error: "Internal Server Error" });
            }

        case "DELETE":
            try {
                // SOFT DELETE: Void the expense record in Tenant DB
                const voidedExpense = await tenantPrisma.expense.update({
                    where: { id: expenseId },
                    data: { status: "VOIDED" },
                });

                return res.status(200).json({ message: "Expense voided successfully", voidedExpense });
            } catch (error) {
                console.error("DELETE_EXPENSE_ERROR", error);
                return res.status(500).json({ error: "Internal Server Error" });
            }

        default:
            res.setHeader("Allow", ["PUT", "PATCH", "DELETE"]);
            return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

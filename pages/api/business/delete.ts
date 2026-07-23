import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/utils/lib/client";
import { requireBusinessAccess } from "@/utils/server/auth";

export const deleteBusiness = async (
    req: NextApiRequest,
    res: NextApiResponse
) => {
    // Prefer the route param; fall back to the body for backward compatibility.
    const queryId = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
    const id = queryId || req.body?.id;

    if (!id) {
        return res.status(400).json({ error: "Invalid or missing business ID" });
    }

    // Only the business owner/admin may delete the business (cascade-deletes all tenant data).
    const access = await requireBusinessAccess(req, id, "owner");
    if (!access.ok) {
        return res.status(access.status).json({ error: access.error });
    }

    try {
        await prisma.business.delete({
            where: {
                id: id,
            },
        });
        res.status(204).end();
    } catch (error) {
        res.status(404).json({ error: "Failed to delete Business" });
    }
};

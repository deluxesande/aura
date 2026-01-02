import { clerkClient, getAuth } from "@clerk/nextjs/server";
import { NextApiRequest, NextApiResponse } from "next";
import { updateCustomer } from "./update";
import { deleteCustomer } from "./delete";
import { prisma } from "@/utils/lib/client";

async function getCustomerById(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { userId: clerkUserId } = getAuth(req);
        if (!clerkUserId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const user = await prisma.user.findUnique({
            where: { clerkId: clerkUserId },
            select: { businessId: true },
        });

        if (!user || !user.businessId) {
            return res
                .status(403)
                .json({ error: "User is not linked to a business" });
        }

        const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;

        if (!id) {
            return res
                .status(400)
                .json({ error: "Invalid or missing customer ID" });
        }

        const customer = await prisma.customer.findFirst({
            where: {
                id: id,
                businessId: user.businessId,
            },
            include: {
                CreatedBy: {
                    select: {
                        firstName: true,
                        lastName: true,
                        role: true,
                        clerkId: true,
                    },
                },
            },
        });

        if (!customer) {
            return res.status(404).json({ error: "Customer not found" });
        }

        let imageUrl = "/images/user.png";

        if (customer.CreatedBy?.clerkId) {
            try {
                const client = await clerkClient();
                const clerkUser = await client.users.getUser(
                    customer.CreatedBy.clerkId
                );
                if (clerkUser.imageUrl) {
                    imageUrl = clerkUser.imageUrl;
                }
            } catch (error) {
                console.warn(
                    `Could not fetch image for user ${customer.CreatedBy.clerkId}`
                );
            }
        }

        const customerWithImage = {
            ...customer,
            CreatedBy: customer.CreatedBy
                ? {
                      ...customer.CreatedBy,
                      imageUrl: imageUrl,
                  }
                : null,
        };

        res.status(200).json(customerWithImage);
    } catch (error) {
        console.error("Get Customer Error:", error);
        res.status(500).json({ error: "Failed to fetch customer" });
    }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case "GET":
            return getCustomerById(req, res);
        case "PUT":
            return updateCustomer(req, res);
        case "DELETE":
            return deleteCustomer(req, res);
        default:
            res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

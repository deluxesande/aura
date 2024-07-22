import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export const updateProduct = async (req: NextApiRequest, res: NextApiResponse) => {
    const { id, name, description, price } = req.body;

    try {
        const updatedProduct = await prisma.product.update({
            where: {
                id: id,
            },
            data: {
                name,
                description,
                price,
            },
        });

        res.status(200).json(updatedProduct);
    } catch (error) {
        res.status(500).json({ error: "Failed to update product" });
    }
};

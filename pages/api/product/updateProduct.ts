import type { NextApiRequest, NextApiResponse } from "next";
import { products } from "@/pages/utils/products";

export const updateProduct = (req: NextApiRequest, res: NextApiResponse) => {
    const { id, name, description, price } = req.body;
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) {
        return res.status(404).json({ message: "Product not found" });
    }
    products[index] = { ...products[index], name, description, price };
    res.status(200).json(products[index]);
};

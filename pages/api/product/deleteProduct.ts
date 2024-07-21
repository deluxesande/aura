import type { NextApiRequest, NextApiResponse } from "next";
import { products } from "@/pages/utils/products";

export const deleteProduct = (req: NextApiRequest, res: NextApiResponse) => {
    const id = req.body.id;
    const productIndex = products.findIndex((p) => p.id === id);
    if (productIndex > -1) {
        products.splice(productIndex, 1);
        res.status(204).end();
    } else {
        res.status(404).json({ message: "Product not found" });
    }
};

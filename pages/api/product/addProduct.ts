import type { NextApiRequest, NextApiResponse } from "next";
import { products } from "@/pages/utils/products";

export const addProduct = (req: NextApiRequest, res: NextApiResponse) => {
    const { name, description, price } = req.body;
    const newProduct = { id: products.length + 1, name, description, price };
    products.push(newProduct);
    res.status(201).json(newProduct);
};

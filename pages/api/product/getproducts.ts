import type { NextApiRequest, NextApiResponse } from "next";
import { products } from "@/pages/utils/products";

export const getProducts = (req: NextApiRequest, res: NextApiResponse) => {
    res.status(200).json(products);
};

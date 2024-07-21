import type { NextApiRequest, NextApiResponse } from "next";
import checkMethodMiddleware from "@/pages/utils/checkMethodMiddleware";

// Example product data
const products = [
    {
        id: 1,
        name: "Product 1",
        description: "Description of Product 1",
        price: 100,
    },
    {
        id: 2,
        name: "Product 2",
        description: "Description of Product 2",
        price: 150,
    },
];

const handler = (req: NextApiRequest, res: NextApiResponse) => {
    res.status(200).json(products);
};

export default checkMethodMiddleware(handler, ["GET"]);

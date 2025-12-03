import { NextApiRequest, NextApiResponse } from "next";
import { generateSKU } from "@/utils/generateSKU";
import formidable from "formidable";
import { addCreatedBy } from "../middleware";
import { prisma } from "@/utils/lib/client";
import fs from "fs";

const convertToBoolean = (value: string): boolean => {
    return value.toLowerCase() === "true";
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const form = formidable({ multiples: true });

    try {
        const { fields, files } = await new Promise<{
            fields: any;
            files: any;
        }>((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err) {
                    reject(new Error("Error parsing form"));
                } else {
                    resolve({ fields, files });
                }
            });
        });

        if (!files.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const file = files.file[0];
        const filePath = file.filepath;

        // Read file and convert to base64
        const fileBuffer = fs.readFileSync(filePath);
        const base64Image = `data:${file.mimetype};base64,${fileBuffer.toString(
            "base64"
        )}`;

        // Extract strings from lists and convert to appropriate types
        const { name, description, price, quantity, inStock, categoryId } = {
            name: fields.name[0],
            description: fields.description[0],
            price: parseFloat(fields.price[0]),
            quantity: parseInt(fields.quantity[0], 10),
            inStock: convertToBoolean(fields.inStock[0]),
            categoryId: fields.categoryId[0],
        };

        // Generate SKU for the new product
        const sku = generateSKU(name);

        // Check if a product with the same name exists in the specified category
        const existingProduct = await prisma.product.findFirst({
            where: {
                name,
                categoryId,
            },
        });

        if (existingProduct) {
            // If the product exists, update the quantity
            const updatedProduct = await prisma.product.update({
                where: { id: existingProduct.id },
                data: {
                    quantity: existingProduct.quantity + quantity,
                },
            });

            res.status(200).json(updatedProduct);
        } else {
            // If the product does not exist, create a new product
            const newProduct = await prisma.product.create({
                data: {
                    name,
                    description,
                    price,
                    sku,
                    quantity,
                    image: base64Image,
                    inStock: inStock,
                    Category: {
                        connect: { id: categoryId },
                    },
                    createdBy: req.body.createdBy,
                },
            });

            res.status(201).json(newProduct);
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to add or update product" });
    }
};

export const addProduct = addCreatedBy(handler);

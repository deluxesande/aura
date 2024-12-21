import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { generateSKU } from "@/utils/generateSKU";
import formidable from "formidable";
import * as Minio from "minio";
import { v4 as uuidv4 } from "uuid";
import { generatePresignedUrl } from "@/utils/minio/generatePresignedUrl";
import { addCreatedBy } from "../middleware";

const prisma = new PrismaClient();

const minioClient = new Minio.Client({
    endPoint: "https://rt50xtkl-9000.uks1.devtunnels.ms/",
    port: 9000,
    useSSL: false,
    accessKey: process.env.MINIO_ROOT_USER || "",
    secretKey: process.env.MINIO_ROOT_PASSWORD || "",
});

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
        const objectName = `${uuidv4()}-salesense-product.png`;

        const metaData = {
            "Content-Type": "image/png",
        };

        const bucketName = "salesense-bucket";

        // Defined in utils and handles the MinIO integration
        const presignedImageUrl = await generatePresignedUrl(
            minioClient,
            bucketName,
            objectName,
            filePath,
            metaData
        );

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
                    sku, // Use the generated SKU
                    quantity,
                    image: presignedImageUrl,
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

"use client";
import Navbar from "@/components/Navbar";
import { Category, Product } from "@/utils/typesDefinitions";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

export default function EditProductPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;
    const [categories, setCategories] = useState<Category[]>([]);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [formData, setFormData] = useState<Product>({
        id: "",
        name: "",
        description: "",
        price: 0,
        quantity: 0,
        categoryId: "",
        image: "",
        inStock: false,
        sku: "",
        createdAt: new Date(),
        updatedAt: new Date(),
        Category: {
            id: "",
            name: "",
            products: [],
        },
        invoiceItems: [],
    });
    const [isLoading, setIsLoading] = useState(false);

    // Handle input changes
    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { id, value } = e.target;
        const fieldName = id.replace("product", "").toLowerCase();

        setFormData((prev) => ({
            ...prev,
            [fieldName]:
                fieldName === "price" || fieldName === "quantity"
                    ? parseInt(value, 10)
                    : value,
        }));
    };

    // Handle checkbox change
    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({
            ...prev,
            inStock: e.target.checked,
        }));
    };

    const handleImageChange = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
                setFormData((prev) => ({
                    ...prev,
                    image: reader.result as string,
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const promise = async () => {
            try {
                await axios.put(`/api/product/${id}`, formData);
                router.push("/products/list");
            } catch (error) {
                // Do nothing error is thrown in toast
            } finally {
                setIsLoading(false);
            }
        };

        toast.promise(promise(), {
            loading: "Updating product...",
            success: "Product updated successfully!",
            error: "Failed to update product",
        });
    };

    // Fetch product data once
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const [productRes, categoriesRes] = await Promise.all([
                    axios.get(`/api/product/${id}`),
                    axios.get("/api/category"),
                ]);

                setFormData(productRes.data);
                setImagePreview(productRes.data.image);
                setCategories(categoriesRes.data);
            } catch (error) {
                toast.error("Error fetching product data");
            }
        };

        fetchProduct();
    }, [id]);

    return (
        <Navbar>
            <div className="p-4 card bg-white shadow-lg rounded-lg mt-4">
                <h1 className="text-2xl font-bold text-gray-400 mb-6">
                    Edit Product
                </h1>
                <form onSubmit={handleSubmit}>
                    <div className="flex flex-wrap flex-col-reverse lg:flex-row lg:flex-nowrap justify-between gap-4">
                        <div className="w-full lg:w-1/2 space-y-4">
                            {/* Product Name */}
                            <div className="flex flex-col gap-2">
                                <label htmlFor="productName">Name:</label>
                                <input
                                    id="productName"
                                    type="text"
                                    className="px-4 py-2 rounded-lg outline-none bg-slate-50 focus:border-gray-400 border-2"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* Product Description */}
                            <div className="flex flex-col gap-2">
                                <label htmlFor="productDescription">
                                    Description:
                                </label>
                                <textarea
                                    id="productDescription"
                                    className="px-4 py-2 rounded-lg outline-none bg-slate-50 focus:border-gray-400 border-2"
                                    value={formData.description}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* Product Price */}
                            <div className="flex flex-col gap-2">
                                <label htmlFor="productPrice">Price:</label>
                                <input
                                    id="productPrice"
                                    type="number"
                                    className="no-spinner px-4 py-2 rounded-lg outline-none bg-slate-50 focus:border-gray-400 border-2"
                                    value={formData.price}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* Product Quantity */}
                            <div className="flex flex-col gap-2">
                                <label htmlFor="productQuantity">
                                    Quantity:
                                </label>
                                <input
                                    id="productQuantity"
                                    type="number"
                                    className="no-spinner px-4 py-2 rounded-lg outline-none bg-slate-50 focus:border-gray-400 border-2"
                                    value={formData.quantity}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* Product Category */}
                            <div className="flex flex-col gap-2">
                                <label htmlFor="productCategory">
                                    Category:
                                </label>
                                <select
                                    id="productCategory"
                                    className="px-4 py-2 rounded-lg outline-none bg-slate-50 focus:border-gray-400 border-2"
                                    value={formData.categoryId}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="" disabled>
                                        Select Category
                                    </option>
                                    {categories.map((category) => (
                                        <option
                                            key={category.id}
                                            value={category.id}
                                        >
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="w-full lg:w-1/2">
                            {/* Product Image */}
                            <div className="flex flex-col gap-2">
                                <label
                                    htmlFor="productImage"
                                    className="flex items-center gap-2"
                                >
                                    Image:
                                </label>
                                <div className="relative w-full lg:w-72 h-72 border-2 border-dashed border-gray-400 rounded-lg flex text-center items-center justify-center bg-slate-50">
                                    {imagePreview ? (
                                        <Image
                                            src={imagePreview}
                                            alt="Preview"
                                            className="object-cover w-full h-full rounded-lg"
                                            layout="fill"
                                        />
                                    ) : (
                                        <span className="text-gray-500">
                                            No image selected
                                        </span>
                                    )}
                                    <input
                                        id="productImage"
                                        type="file"
                                        accept="image/png"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={handleImageChange}
                                    />
                                </div>
                            </div>

                            {/* Product InStock */}
                            <div className="flex flex-row items-center gap-4 my-4">
                                <label
                                    htmlFor="productInStock"
                                    className="flex items-center gap-2 cursor-pointer"
                                >
                                    <input
                                        id="productInStock"
                                        type="checkbox"
                                        className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        checked={formData.inStock}
                                        onChange={handleCheckboxChange}
                                    />
                                    <span className="text-gray-700">
                                        Instock
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-md btn-ghost text-black flex items-center bg-green-400 w-full mt-8"
                        disabled={isLoading}
                    >
                        <span className="ml-2">
                            {isLoading ? "Updating..." : "Update Product"}
                        </span>
                    </button>
                </form>
            </div>
        </Navbar>
    );
}

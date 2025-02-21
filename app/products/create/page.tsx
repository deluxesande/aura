"use client";
import CreateCategoryModal from "@/components/CreateCategoryModal";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { Category } from "@/utils/typesDefinitions";
import axios from "axios";
import { PlusCircle } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Page() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleCreateNewCategory = async (categoryName: string) => {
        const promise = async () => {
            try {
                const response = await axios.post("/api/category", {
                    name: categoryName,
                });
                setCategories([...categories, response.data]);
            } catch (error) {
                console.error("Error creating category:", error);
            }
        };

        toast.promise(promise(), {
            loading: "Loading...",
            success: "Category created.",
            error: "Error creating category.",
        });
    };

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsLoading(true);

        const productName = (
            document.getElementById("productName") as HTMLInputElement
        ).value;
        const productDescription = (
            document.getElementById("productDescription") as HTMLInputElement
        ).value;
        const productPrice = (
            document.getElementById("productPrice") as HTMLInputElement
        ).value;
        const productQuantity = (
            document.getElementById("productQuantity") as HTMLInputElement
        ).value;
        const productCategory = (
            document.getElementById("productCategory") as HTMLSelectElement
        ).value;
        const productInStock = (
            document.getElementById("productInStock") as HTMLInputElement
        ).checked;
        const productImage = (
            document.getElementById("productImage") as HTMLInputElement
        ).files?.[0];

        if (productCategory === "") {
            toast.error("Please select a category.");
            setIsLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append("name", productName);
        formData.append("description", productDescription);
        formData.append("price", productPrice);
        formData.append("quantity", productQuantity);
        formData.append("categoryId", productCategory);
        formData.append("inStock", productInStock.toString());
        if (productImage) {
            formData.append("file", productImage);
        }

        const promise = async () => {
            try {
                const response = await axios.post("/api/product", formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });
                return response.data;
            } catch (error) {
                throw error;
            } finally {
                setIsLoading(false);
            }
        };

        toast.promise(promise(), {
            loading: "Loading...",
            success: "Product added to inventory.",
            error: "Error adding product.",
        });
    };

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get("/api/category");
                setCategories(response.data);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };

        fetchCategories();
    }, []);

    return (
        <Navbar>
            <div className="flex w-auto justify-between">
                <div className="px-6 py-4 rounded-lg gap-4 bg-white flex-1">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold mb-6 text-gray-400">
                            Create Product
                        </h1>
                        <button
                            className="btn btn-sm btn-ghost text-black flex items-center bg-green-400"
                            onClick={() => setIsModalOpen(true)}
                        >
                            <PlusCircle className="w-4 h-4" />
                            Create Category
                        </button>
                    </div>

                    <form>
                        <div className="flex justify-between gap-4">
                            <div className="w-1/2">
                                {/* Product Name */}
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="productName">Name:</label>
                                    <input
                                        id="productName"
                                        type="text"
                                        className="px-4 py-2 rounded-lg outline-none bg-slate-50 focus:border-gray-400 border-2"
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
                                        required
                                        defaultValue=""
                                    >
                                        <option value="" disabled>
                                            Select Category
                                        </option>
                                        {categories.map((category, index) => (
                                            <option
                                                key={index}
                                                value={category.id}
                                            >
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="w-1/2">
                                {/* Product Image */}
                                <div className="flex flex-col gap-2">
                                    <label
                                        htmlFor="productImage"
                                        className="flex items-center gap-2"
                                    >
                                        Image:
                                    </label>
                                    <div className="relative w-72 h-72 border-2 border-dashed border-gray-400 rounded-lg flex text-center items-center justify-center bg-slate-50">
                                        {imagePreview ? (
                                            <Image
                                                src={imagePreview}
                                                alt="Preview"
                                                width={288}
                                                height={288}
                                                className="object-cover w-full h-full rounded-lg"
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
                                            required
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
                                            required
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
                            onClick={handleSubmit}
                            disabled={isLoading}
                        >
                            <span className="ml-2">
                                {isLoading ? "Creating..." : "Add Product"}
                            </span>
                        </button>
                    </form>
                </div>
            </div>
            <CreateCategoryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreateNewCategory}
            />
        </Navbar>
    );
}

"use client";
import Navbar from "@/components/Navbar";
import { Category, Product } from "@/utils/typesDefinitions";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";

export default function EditProductPage() {
    const searchParams = useSearchParams();
    const id = searchParams ? searchParams.get("id") : null;
    const [categories, setCategories] = useState<Category[]>([]);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [product, setProduct] = useState<Product | null>(null);

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

    const handleSubmit = () => {
        console.log("Form submitted");
    };

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await axios.get(`/api/product/${id}`);
                setProduct(response.data);
                setImagePreview(response.data.image);
            } catch (error) {
                console.error("Error fetching product:", error);
            }
        };
        fetchProduct();
    }, [id]);

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

    console.log("Product:", product);

    return (
        <Navbar>
            <div className="p-4 card bg-white shadow-lg rounded-lg mt-4">
                <h1 className="text-2xl font-bold text-gray-400 mb-6">
                    Edit Product
                </h1>
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
                                    value={product?.name}
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
                                    value={product?.description}
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
                                    value={product?.price}
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
                                    value={product?.quantity}
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
                                    value={product?.categoryId}
                                >
                                    <option value="" disabled>
                                        Select Category
                                    </option>
                                    {categories.map((category, index) => (
                                        <option key={index} value={category.id}>
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
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
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
                    >
                        <span className="ml-2">Add Product</span>
                    </button>
                </form>
            </div>
        </Navbar>
    );
}

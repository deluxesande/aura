"use client";
import Navbar from "@/components/Navbar";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import TopProducts from "@/components/TopProducts";
import { Product } from "@/utils/typesDefinitions";
import axios from "axios";

const InvoicePage: React.FC = () => {
    const searchParams = useSearchParams();
    const id = searchParams ? searchParams.get("id") : null;
    const [products, setProducts] = useState<Product[]>([]);

    // Example status, you can replace this with actual status from your data
    const status = "pending"; // This can be "pending", "active", etc.

    // Function to get the color based on status
    const getStatusColor = (status: string) => {
        switch (status) {
            case "pending":
                return "bg-yellow-500 text-white";
            case "active":
                return "bg-green-500 text-white";
            case "completed":
                return "bg-blue-500 text-white";
            case "cancelled":
                return "bg-red-500 text-white";
            default:
                return "bg-gray-500 text-white";
        }
    };

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get("/api/product");
                const limitedProducts = response.data.slice(0, 5);
                setProducts(limitedProducts);
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };

        fetchProducts();
    }, []);

    return (
        <Navbar>
            <div className="flex flex-row gap-10 justify-between p-4 card bg-white shadow-lg rounded-lg">
                <div className="w-1/2">
                    <div className="flex justify-between">
                        <p className="text-gray-600">OOOP-1</p>
                        <span
                            className={`px-2 py-1 rounded-lg ${getStatusColor(
                                status
                            )}`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                    </div>

                    <div className="flex flex-col w-full gap-2">
                        <div className="flex justify-between mt-10">
                            <p className="text-black font-semibold">
                                Invoice No:
                            </p>
                            <p className="text-black font-semibold">INV-1</p>
                        </div>
                        <div className="flex justify-between">
                            <p className="text-black font-semibold">Created:</p>
                            <p className="text-black font-semibold">20241012</p>
                        </div>

                        <div className="flex justify-between mt-10">
                            <p className="text-gray-600 font-light">
                                Payment Type
                            </p>
                            <p className="text-gray-600 font-light">
                                Client Name
                            </p>
                        </div>
                        <div className="flex justify-between">
                            <p className="text-black font-semibold">MPESA</p>
                            <p className="text-black font-semibold">John Doe</p>
                        </div>

                        <div className="bg-green-600 h-28 w-full rounded-lg mt-8 flex flex-col items-center justify-center gap-2">
                            <p className="text-white text-xl font-semibold">
                                Amount
                            </p>
                            <p className="text-white text-xl font-light">
                                Ksh. 2000
                            </p>
                        </div>
                    </div>
                </div>
                <div className="w-1/2">
                    <div className="flex justify-between">
                        <p className="text-gray-600 font-light">Items</p>
                    </div>
                    {products.map((product, index) => (
                        <TopProducts key={index} product={product} />
                    ))}
                </div>
            </div>
        </Navbar>
    );
};

export default InvoicePage;

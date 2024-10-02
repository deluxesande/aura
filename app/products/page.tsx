"use client";

import CategoryBox from "@/components/CategoryBox";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import CreateOrder from "@/components/CreateOrder"; // Import the CreateOrder component
import {
    Store,
    LibraryBig,
    PencilRuler,
    Paperclip,
    Popcorn,
    Ellipsis,
} from "lucide-react";
import React from "react";
import { X } from "lucide-react";
import Image from "next/image";
import OrderCard from "@/components/OrderCard";

const categories = [
    { category: "All", itemCount: 200, icon: Store, active: true },
    { category: "Books", itemCount: 200, icon: LibraryBig },
    { category: "Pens", itemCount: 200, icon: PencilRuler },
    { category: "Paper", itemCount: 200, icon: Paperclip },
    { category: "Snacks", itemCount: 200, icon: Popcorn },
    { category: "Other", itemCount: 2000, icon: Ellipsis },
];

const products = [
    {
        image: "https://via.placeholder.com/150",
        name: "Product",
        quantity: 10,
        price: "$20.00",
        inStock: true,
    },
    {
        image: "https://via.placeholder.com/150",
        name: "Product",
        quantity: 5,
        price: "$15.00",
        inStock: false,
    },
    {
        image: "https://via.placeholder.com/150",
        name: "Product",
        quantity: 10,
        price: "$20.00",
        inStock: true,
    },
    {
        image: "https://via.placeholder.com/150",
        name: "Product",
        quantity: 5,
        price: "$15.00",
        inStock: false,
    },
    {
        image: "https://via.placeholder.com/150",
        name: "Product",
        quantity: 10,
        price: "$20.00",
        inStock: true,
    },
    {
        image: "https://via.placeholder.com/150",
        name: "Product",
        quantity: 5,
        price: "$15.00",
        inStock: false,
    },

    {
        image: "https://via.placeholder.com/150",
        name: "Product",
        quantity: 10,
        price: "$20.00",
        inStock: true,
    },
    {
        image: "https://via.placeholder.com/150",
        name: "Product",
        quantity: 5,
        price: "$15.00",
        inStock: false,
    },
    {
        image: "https://via.placeholder.com/150",
        name: "Product",
        quantity: 5,
        price: "$15.00",
        inStock: false,
    },
    // Add more products as needed
];

export default function Page() {
    const image = "https://via.placeholder.com/150";

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Main Content */}
            <div
                className="flex-grow flex flex-col"
                style={{ width: "calc(100% - 10rem)" }}
            >
                <Navbar>
                    {/* Category buttons */}
                    <div className="flex overflow-hidden gap-6 mt-4">
                        {categories.map((category) => (
                            <CategoryBox
                                key={category.category}
                                category={category.category}
                                itemCount={category.itemCount}
                                icon={category.icon}
                                active={category.active}
                            />
                        ))}
                    </div>

                    {/* Products */}
                    <div className="flex flex-wrap gap-4 mt-10">
                        {products.map((product) => (
                            <ProductCard
                                key={product.name}
                                image={product.image}
                                name={product.name}
                                quantity={product.quantity}
                                price={product.price}
                                inStock={product.inStock}
                            />
                        ))}
                    </div>
                </Navbar>
            </div>
            {/* Right Sidebar */}
            <CreateOrder>
                <div className="p-2 bg-white rounded-lg flex items-center gap-4 shadow-sm cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-red-500"></div>
                    <div className="w-28">
                        <p className="font-bold text-sm">John Doe</p>
                        <p className="font-light text-xs">Admin</p>
                    </div>
                </div>

                <div className="mt-14 px-4 flex flex-col justify-between h-[85%]">
                    <div>
                        <p className="font-bold text-2xl">Create Order</p>

                        {/* Order Items */}
                        <div className="mt-10 flex flex-col gap-4">
                            <OrderCard />
                        </div>
                    </div>

                    {/* Total */}
                    <div>
                        {/* Dotted line */}
                        <div className="border-b-2 border-dotted border-gray-400 my-4"></div>

                        {/* Values */}
                        <div className="flex items-center justify-between">
                            <p className="font-bold text-xl">Total: </p>
                            <p className="font-bold text-xl">$100.00</p>
                        </div>
                        <button className="px-4 py-2 mt-4 bg-[#159A9C] w-full text-white rounded-md">
                            Place Order
                        </button>
                    </div>
                </div>
            </CreateOrder>
        </div>
    );
}

import CategoryBox from "@/components/CategoryBox";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import {
    Store,
    LibraryBig,
    PencilRuler,
    Paperclip,
    Popcorn,
} from "lucide-react";
import React from "react";

const categories = [
    { category: "All", itemCount: 200, icon: Store, active: true },
    { category: "Books", itemCount: 200, icon: LibraryBig },
    { category: "Pens", itemCount: 200, icon: PencilRuler },
    { category: "Paper", itemCount: 200, icon: Paperclip },
    { category: "Snacks", itemCount: 200, icon: Popcorn },
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
    // Add more products as needed
];

export default function Page() {
    return (
        <Navbar>
            {/* Category buttons */}
            <div className="flex overflow-hidden justify-between gap-4 mt-4">
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
    );
}

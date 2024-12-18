"use client";

import React, { useEffect, useState } from "react";
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
import OrderCard from "@/components/OrderCard";
import { useDispatch, useSelector } from "react-redux";
import { AppState } from "@/store";
import { addItem } from "@/store/slices/cartSlice";
import { Product } from "@/utils/typesDefinitions";
import { show } from "@/store/slices/visibilitySlice";
import axios from "axios";
import { toast } from "sonner";

const categories = [
    { category: "All", itemCount: 200, icon: Store, active: true },
    { category: "Books", itemCount: 200, icon: LibraryBig },
    { category: "Pens", itemCount: 200, icon: PencilRuler },
    { category: "Paper", itemCount: 200, icon: Paperclip },
    { category: "Snacks", itemCount: 200, icon: Popcorn },
    { category: "Other", itemCount: 2000, icon: Ellipsis },
];

export default function Page() {
    const dispatch = useDispatch();
    const cartItems = useSelector((state: AppState) => state.cart.items);
    const [products, setProducts] = useState<Product[]>([]);

    const handleAddToCart = (product: Product) => {
        dispatch(addItem(product));
        dispatch(show());
    };

    const handleOrder = async () => {
        /**
         * Create invoice items for each cart item
         *
         * This will create an invoice item for each cart item
         * and store the invoice item ID in an array.
         *
         * If all invoice items are created successfully, an invoice
         * will be created with the total amount based on the cart items.
         *
         * This approach reduces the number of API calls to create an invoice.
         */

        // Check if cartItems are empty
        if (cartItems.length === 0) {
            toast.warning("Cart is empty. No order to process.");
            return;
        }

        const promise = async () => {
            const invoiceItemPromises = cartItems.map(async (item) => {
                const data = {
                    quantity: item.cartQuantity,
                    price: item.price * item.cartQuantity,
                    productId: item.id,
                };

                try {
                    const response = await axios.post(
                        "/api/invoiceItem/",
                        data
                    );
                    return response.data;
                } catch (error) {
                    console.error("Error creating invoice item:", error);
                    return null;
                }
            });

            const results = await Promise.all(invoiceItemPromises);

            const invoiceItems = results
                .filter((result) => result !== null) // Filter out any null results
                .map((result) => ({
                    id: result.id, // Use the invoice item ID returned from the API response
                }));

            if (invoiceItems.length === cartItems.length) {
                try {
                    // Calculate total amount based on cart items and quantities
                    // to reduce amount of API calls
                    const totalAmount = cartItems.reduce(
                        (total, item) => total + item.price * item.cartQuantity,
                        0
                    );
                    const invoiceData = {
                        invoiceItems: invoiceItems,
                        totalAmount: totalAmount,
                    };

                    const response = await axios.post(
                        "/api/invoice/",
                        invoiceData
                    );
                    return response.data;
                } catch (error) {
                    toast.error("Error creating invoice:" + error);
                    throw error;
                }
            } else {
                throw new Error(
                    "Mismatch between cart items and invoice items"
                );
            }
        };

        toast.promise(promise(), {
            loading: "Processing order...",
            success: "Order has been successfully processed",
            error: "Error processing order",
        });
    };

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get("/api/product");
                // Ensure productsData is an array
                if (!Array.isArray(response.data)) {
                    setProducts([]);
                } else {
                    setProducts(response.data);
                }
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };

        fetchProducts();
    }, []);

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
                        {products?.map((product) => (
                            <ProductCard
                                key={product.name}
                                image={product.image}
                                name={product.name}
                                quantity={product.quantity}
                                price={product.price}
                                inStock={product.inStock}
                                onAddToCart={() => handleAddToCart(product)}
                            />
                        ))}
                    </div>
                </Navbar>
            </div>
            {/* Right Sidebar */}
            <CreateOrder>
                <div className="p-2 mt-2 bg-white rounded-lg flex items-center gap-4 shadow-sm cursor-pointer">
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
                            {cartItems.map((item) => (
                                <OrderCard key={item.id} product={item} />
                            ))}
                        </div>
                    </div>

                    {/* Total */}
                    <div>
                        {/* Dotted line */}
                        <div className="border-b-2 border-dotted border-gray-400 my-4"></div>

                        {/* Values */}
                        <div className="flex items-center justify-between">
                            <p className="font-bold text-xl">Total: </p>
                            <p className="font-bold text-xl">
                                $
                                {cartItems
                                    .reduce(
                                        (total, item) =>
                                            total +
                                            item.price * item.cartQuantity,
                                        0
                                    )
                                    .toFixed(2)}
                            </p>
                        </div>
                        <button
                            className="px-4 py-2 mt-4 bg-[#159A9C] w-full text-white rounded-md"
                            onClick={handleOrder}
                        >
                            Place Order
                        </button>
                    </div>
                </div>
            </CreateOrder>
        </div>
    );
}

"use client";

import React from "react";
import { X } from "lucide-react";
import Image from "next/image";
import { Product } from "@/utils/typesDefinitions";
import { useSelector, useDispatch } from "react-redux";
import { AppState } from "@/store";
import { addItem, removeItem, decrementItem } from "@/store/slices/cartSlice";

export default function OrderCard({ product }: { product: Product }) {
    const dispatch = useDispatch();
    const cartItem = useSelector((state: AppState) =>
        state.cart.items.find((item) => item.id === product.id)
    );

    const handleIncrement = () => {
        dispatch(addItem(product));
    };

    const handleDecrement = () => {
        if (cartItem && cartItem.cartQuantity > 1) {
            dispatch(decrementItem(product.id));
        } else {
            dispatch(removeItem(product.id));
        }
    };

    const handleRemove = () => {
        dispatch(removeItem(product.id));
    };

    return (
        <div className="w-full h-20 p-2 bg-slate-50 shadow-sm rounded-md flex items-center justify-between">
            <div className="flex items-center">
                <div className="relative h-10 w-10 rounded-md">
                    <Image
                        src={product.image || "https://via.placeholder.com/150"}
                        alt="Image"
                        layout="fill"
                        objectFit="cover"
                        className="rounded-md"
                    />
                </div>
                <div className="ml-4">
                    <p className="font-bold text-sm max-w-24 whitespace-nowrap truncate">
                        {product.name}
                    </p>
                    <p className="mt-2 text-xs">$ {product.price}</p>
                </div>
            </div>
            <div className="relative flex items-center h-full">
                <button
                    onClick={handleRemove}
                    className="absolute top-2 right-1 text-gray-600 hover:text-gray-800"
                >
                    <X size={16} />
                </button>
                <div className="flex flex-col items-center ml-4 mr-2 mt-5">
                    <div className="flex items-center space-x-1 gap-1">
                        <button
                            onClick={handleDecrement}
                            className="bg-red-200 text-xs text-red-600 hover:bg-red-300 hover:text-red-800 px-1 py-0.5 rounded"
                        >
                            -
                        </button>
                        <span className="text-gray-600 text-xs">
                            {cartItem ? cartItem.cartQuantity : 0}
                        </span>
                        <button
                            onClick={handleIncrement}
                            className="bg-green-200 text-xs text-green-600 hover:bg-green-300 hover:text-green-800 px-1 py-0.5 rounded"
                        >
                            +
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

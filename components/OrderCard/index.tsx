"use client";

import React from "react";
import { X } from "lucide-react";
import Image from "next/image";
import { Product } from "@/utils/typesDefinitions";
import { useSelector, useDispatch } from "react-redux";
import { AppState } from "@/store";
import { addItem, removeItem, decrementItem } from "@/store/slices/cartSlice";
import { toast } from "sonner";

export default function OrderCard({ product }: { product: Product }) {
    const dispatch = useDispatch();
    const cartItem = useSelector((state: AppState) =>
        state.cart.items.find((item) => item.id === product.id),
    );

    const handleIncrement = () => {
        if (
            product.quantity &&
            product.quantity > (cartItem?.cartQuantity || 0)
        ) {
            dispatch(addItem(product));
        } else {
            toast.warning(
                "We're sorry, but there isn't enough stock to add more of this item.",
            );
        }
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

    const isVariant = product.type === "VARIANT";
    const variantAttributes =
        isVariant && product.attributeValues
            ? product.attributeValues
                  .map((av) => av.attributeOption.value)
                  .join(" / ")
            : null;

    return (
        <div className="w-full h-auto min-h-[5rem] p-2 bg-slate-50 shadow-sm rounded-lg flex items-center justify-between">
            <div className="flex items-center">
                <div className="relative h-10 w-10 rounded-lg shrink-0">
                    <Image
                        src={product.image || "https://via.placeholder.com/150"}
                        alt="Image"
                        layout="fill"
                        objectFit="cover"
                        className="rounded-lg"
                    />
                </div>
                <div className="ml-4">
                    <p className="font-bold text-sm max-w-28 whitespace-normal break-words line-clamp-2">
                        {product.name}
                    </p>
                    {variantAttributes && (
                        <p className="text-[10px] font-semibold text-green-500 mt-0.5 uppercase tracking-wide">
                            {variantAttributes}
                        </p>
                    )}
                    <p
                        className={`text-xs ${variantAttributes ? "mt-0.5" : "mt-2"}`}
                    >
                        Ksh {product.price}
                    </p>
                </div>
            </div>
            <div className="relative flex items-center h-full shrink-0">
                <button
                    onClick={handleRemove}
                    className="absolute top-0 right-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                    <X size={14} />
                </button>
                <div className="flex flex-col items-center ml-2 mr-1 mt-5">
                    <div className="flex items-center space-x-1 gap-1">
                        <button
                            onClick={handleDecrement}
                            className="bg-red-200 text-xs text-red-600 hover:bg-red-300 hover:text-red-800 px-1.5 py-0.5 rounded transition-colors"
                        >
                            -
                        </button>
                        <span className="text-gray-600 text-xs font-medium min-w-[12px] text-center">
                            {cartItem ? cartItem.cartQuantity : 0}
                        </span>
                        <button
                            onClick={handleIncrement}
                            className="bg-green-200 text-xs text-green-500 hover:bg-green-300 hover:text-green-800 px-1.5 py-0.5 rounded transition-colors"
                        >
                            +
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

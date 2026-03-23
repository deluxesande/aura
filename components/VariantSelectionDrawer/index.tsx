"use client";
import { Product } from "@/utils/typesDefinitions";
import { ShoppingCart, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface VariantSelectionDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product;
    onAddToCart: (variant: Product) => void;
}

export default function VariantSelectionDrawer({
    isOpen,
    onClose,
    product,
    onAddToCart,
}: VariantSelectionDrawerProps) {
    const [selectedVariant, setSelectedVariant] = useState<Product | null>(
        null,
    );

    return (
        <div
            className={`fixed inset-0 z-[100] transition-all duration-300 ease-in-out ${
                isOpen
                    ? "bg-black/40 backdrop-blur-sm opacity-100"
                    : "bg-transparent opacity-0 pointer-events-none"
            }`}
            onClick={onClose}
        >
            <div
                className={`fixed right-0 top-0 h-full w-full max-w-[20rem] bg-white shadow-2xl transition-transform duration-300 ease-in-out transform ${
                    isOpen ? "translate-x-0" : "translate-x-full"
                }`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-6 border-b flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                {product.name}
                            </h2>
                            <p className="text-sm text-gray-500">
                                Select a variation to add to cart
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X size={24} className="text-gray-400" />
                        </button>
                    </div>

                    {/* Product Info Summary */}
                    <div className="p-6 bg-gray-50 flex gap-4">
                        <div className="w-24 h-24 relative rounded-lg overflow-hidden border border-white shadow-sm shrink-0">
                            <Image
                                src={
                                    product.image ||
                                    "/images/default-product.png"
                                }
                                alt={product.name}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="flex flex-col justify-center">
                            <span className="bg-green-100 text-green-600 text-[10px] font-bold px-2 py-0.5 rounded-full w-fit mb-1">
                                TEMPLATE
                            </span>
                            <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                                {product.description}
                            </p>
                        </div>
                    </div>

                    {/* Variants List */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                Available Options
                            </p>
                        </div>

                        <div className="grid gap-3">
                            {product.variants?.map((variant) => {
                                const attributes = variant.attributeValues
                                    ?.map((av) => av.attributeOption.value)
                                    .join(" / ");

                                const isOutOfStock = variant.quantity <= 0;
                                const isSelected =
                                    selectedVariant?.id === variant.id;

                                return (
                                    <button
                                        key={variant.id}
                                        disabled={isOutOfStock}
                                        onClick={() =>
                                            setSelectedVariant(variant)
                                        }
                                        className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left group ${
                                            isSelected
                                                ? "border-green-500 bg-green-50/50 shadow-sm"
                                                : "border-gray-100 hover:border-gray-200"
                                        } ${isOutOfStock ? "opacity-50 cursor-not-allowed grayscale" : ""}`}
                                    >
                                        <div
                                            className={`w-3 h-3 rounded-full border-2 transition-all shrink-0 ${
                                                isSelected
                                                    ? "bg-green-500 border-green-500"
                                                    : "border-gray-300"
                                            }`}
                                        />

                                        <div className="flex-1">
                                            <p
                                                className={`text-sm font-bold transition-colors ${
                                                    isSelected
                                                        ? "text-green-700"
                                                        : "text-gray-900"
                                                }`}
                                            >
                                                {attributes ||
                                                    "Standard Version"}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <p className="text-xs text-gray-500 font-medium">
                                                    Ksh {variant.price}
                                                </p>
                                                <span className="text-gray-300">
                                                    •
                                                </span>
                                                <p
                                                    className={`text-[10px] font-bold ${
                                                        variant.quantity <= 5
                                                            ? "text-red-500"
                                                            : "text-gray-400"
                                                    }`}
                                                >
                                                    {variant.quantity} in stock
                                                </p>
                                            </div>
                                        </div>

                                        {isOutOfStock && (
                                            <span className="text-[10px] font-bold text-red-500 uppercase bg-red-50 px-2 py-1 rounded">
                                                Sold Out
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 border-t bg-white">
                        <button
                            disabled={!selectedVariant}
                            onClick={() => {
                                if (selectedVariant) {
                                    onAddToCart(selectedVariant);
                                    onClose();
                                }
                            }}
                            className="w-full py-4 bg-green-500 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-green-100"
                        >
                            <ShoppingCart className="stroke-white" size={20} />
                            <span className="text-white">Add to Cart</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

"use client";
import React, { useState } from "react";
import { Product } from "@/utils/typesDefinitions";
import { X, ShoppingCart } from "lucide-react";
import Image from "next/image";

interface VariantSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product; // This will be the TEMPLATE product
    onAddToCart: (variant: Product) => void;
}

export default function VariantSelectionModal({
    isOpen,
    onClose,
    product,
    onAddToCart,
}: VariantSelectionModalProps) {
    const [selectedVariant, setSelectedVariant] = useState<Product | null>(
        null,
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-bold text-gray-900 line-clamp-1">
                        Select Variant: {product.name}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="p-4 max-h-[60vh] overflow-y-auto">
                    <div className="grid gap-3">
                        {product.variants?.map((variant) => {
                            const attributes = variant.attributeValues
                                ?.map((av) => av.attributeOption.value)
                                .join(" / ");

                            const isOutOfStock = variant.quantity <= 0;

                            return (
                                <button
                                    key={variant.id}
                                    disabled={isOutOfStock}
                                    onClick={() => setSelectedVariant(variant)}
                                    className={`flex items-center gap-4 p-3 rounded-lg border-2 transition-all text-left ${
                                        selectedVariant?.id === variant.id
                                            ? "border-green-500 bg-green-50"
                                            : "border-gray-100 hover:border-gray-200"
                                    } ${isOutOfStock ? "opacity-50 cursor-not-allowed grayscale" : ""}`}
                                >
                                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                                        <Image
                                            src={
                                                variant.image ||
                                                product.image ||
                                                "/images/default-product.png"
                                            }
                                            alt={variant.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-gray-900">
                                            {attributes || "Default Variant"}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Qty: {variant.quantity} • Ksh{" "}
                                            {variant.price}
                                        </p>
                                    </div>
                                    {isOutOfStock && (
                                        <span className="text-[10px] font-bold text-red-500 uppercase">
                                            Out of stock
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="p-4 bg-gray-50 border-t">
                    <button
                        disabled={!selectedVariant}
                        onClick={() => {
                            if (selectedVariant) {
                                onAddToCart(selectedVariant);
                                onClose();
                            }
                        }}
                        className="w-full py-3 bg-green-500 text-white rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-green-200"
                    >
                        <ShoppingCart size={18} />
                        Add to Cart • Ksh {selectedVariant?.price || 0}
                    </button>
                </div>
            </div>
        </div>
    );
}

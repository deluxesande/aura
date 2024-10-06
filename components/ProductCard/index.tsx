import React from "react";
import Image from "next/image";

export default function ProductCard({
    image,
    name,
    quantity,
    price,
    inStock,
    onAddToCart,
}: ProductCardProps) {
    return (
        <div
            className="bg-white shadow-md rounded-lg overflow-hidden w-52 cursor-pointer"
            onClick={onAddToCart}
        >
            <div className="relative w-full h-48">
                <Image src={image} alt={name} layout="fill" objectFit="cover" />
            </div>
            <div className="p-4">
                <div className="flex justify-between items-center">
                    <p className="text-lg font-bold">{name}</p>
                    <span className="text-sm text-gray-600">
                        {quantity} pcs
                    </span>
                </div>
                <div className="flex justify-between items-center mt-4">
                    <span className="font-semibold">{price}</span>
                    <span
                        className={`text-sm ${
                            inStock ? "text-green-500" : "text-red-500"
                        }`}
                    >
                        {inStock ? "In Stock" : "Out of Stock"}
                    </span>
                </div>
            </div>
        </div>
    );
}

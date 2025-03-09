import React from "react";
import Image from "next/image";
// import Image from "../Image";

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
            className="bg-white shadow-md rounded-lg overflow-hidden w-56 cursor-pointer"
            onClick={onAddToCart}
        >
            <div className="relative w-full h-48">
                <Image src={image} alt={name} layout="fill" objectFit="cover" />
                {/* <Image path={image} alt={name} /> */}
            </div>
            <div className="p-4">
                <div className="flex justify-between items-center">
                    <p className="text-sm text-black font-bold truncate">
                        {name}
                    </p>
                    <span className="text-sm text-gray-600 whitespace-nowrap ml-2">
                        {quantity} pcs
                    </span>
                </div>
                <div className="flex justify-between items-center mt-4">
                    <span className="font-semibold text-black">{price}</span>
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

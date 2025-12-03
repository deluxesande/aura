import React from "react";
import Image from "next/image";
import { Product } from "@/utils/typesDefinitions";

export default function TopProducts({ product }: { product: Product }) {
    return (
        <div className="w-full h-16 p-2 bg-slate-50 shadow-sm rounded-md flex items-center justify-between my-4">
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
                    <p className="font-bold text-sm text-black max-w-24 whitespace-nowrap truncate">
                        {product.name}
                    </p>
                    <p className="mt-2 text-xs">$ {product.price}</p>
                </div>
            </div>
            <div className="relative flex items-center h-full">
                <div className="flex flex-col items-center mr-2">
                    <p className="text-black">{product.quantity}</p>
                </div>
            </div>
        </div>
    );
}

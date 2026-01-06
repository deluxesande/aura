import { Package, PlusCircle } from "lucide-react";
import React from "react";
import Link from "next/link";

function NoProductsFound() {
    return (
        <div className="w-full flex flex-col items-center justify-center py-24 px-4 text-center">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4 border border-green-100">
                <Package className="w-8 h-8 stroke-green-500" />
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                No Products Found
            </h3>
            <p className="text-sm text-gray-500 max-w-sm mb-6">
                Get started by creating your first product to track inventory
                and sales.
            </p>

            <Link href="/products/create">
                <button className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors shadow-sm">
                    <PlusCircle className="w-4 h-4 stroke-white" />
                    Add First Product
                </button>
            </Link>
        </div>
    );
}

export default NoProductsFound;

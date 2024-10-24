import { Product } from "@/utils/typesDefinitions";
import { ChevronLeft, ChevronRight, Edit, Trash } from "lucide-react";

export default function ProductList({ products }: { products: Product[] }) {
    return (
        <div className="p-4 card bg-white shadow-lg rounded-lg">
            <h1 className="text-2xl font-bold mb-6 text-gray-400">
                All Products
            </h1>
            <div className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                        <thead>
                            <tr>
                                <th className="py-2 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-400">
                                    ID
                                </th>
                                <th className="py-2 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-400">
                                    Product Name
                                </th>
                                <th className="py-2 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-400">
                                    Description
                                </th>
                                <th className="py-2 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-400">
                                    Quantity
                                </th>
                                <th className="py-2 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-400">
                                    Price
                                </th>
                                <th className="py-2 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-400">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {products?.map((product, index) => (
                                <tr
                                    key={index}
                                    className="hover:bg-gray-100 cursor-pointer"
                                >
                                    <td className="py-2 px-4 border-b text-black text-sm border-gray-100">
                                        {product.id}
                                    </td>
                                    <td className="py-2 px-4 border-b text-black text-sm border-gray-100">
                                        <p>{product.name}</p>
                                    </td>
                                    <td className="py-2 px-4 border-b text-black text-sm border-gray-100">
                                        {product.description}
                                    </td>
                                    <td className="py-2 px-4 border-b text-black text-sm border-gray-100">
                                        {product.quantity}
                                    </td>
                                    <td className="py-2 px-4 border-b text-black text-sm border-gray-100">
                                        ${product.price}
                                    </td>
                                    <td className="py-2 px-4 border-b border-gray-100 flex items-center">
                                        <button className="btn btn-sm btn-ghost text-black cursor-not-allowed">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <div className="border-l border-gray-300 h-4 mx-1"></div>
                                        <button className="btn btn-sm btn-ghost text-black cursor-not-allowed">
                                            <Trash className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex justify-center items-center pt-4 my-4 space-x-4">
                    <button className="btn btn-sm btn-ghost text-black flex items-center bg-gray-100">
                        <ChevronLeft className="w-4 h-4" />
                        <span className="ml-2">Back</span>
                    </button>
                    <div className="flex space-x-2">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <button
                                key={index}
                                className={`btn btn-sm ${
                                    index === 0
                                        ? "bg-black text-white"
                                        : "btn-ghost"
                                } text-black`}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>
                    <button className="btn btn-sm btn-ghost text-black flex items-center bg-gray-100">
                        <span className="mr-2">Next</span>
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
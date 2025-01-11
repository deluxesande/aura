import { Product } from "@/utils/typesDefinitions";
import {
    ChevronLeft,
    ChevronRight,
    Edit,
    PlusCircle,
    Trash,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProductList({
    products,
    handleDelete,
}: {
    products: Product[];
    handleDelete: (productId: string) => void;
}) {
    const router = useRouter();

    const handleEditClick = (productId: string) => {
        router.push(`/products/${productId}/edit`);
    };

    return (
        <div className="p-4 card bg-white shadow-lg rounded-lg mt-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-400">
                    All Products
                </h1>
                <Link href="/products/create">
                    <button className="btn btn-sm btn-ghost text-black flex items-center bg-green-400 w-full">
                        <PlusCircle className="w-4 h-4" />
                        Add Product
                    </button>
                </Link>
            </div>

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
                                        <button
                                            className="btn btn-sm btn-ghost text-black"
                                            onClick={() =>
                                                handleEditClick(product.id)
                                            }
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <div className="border-l border-gray-300 h-4 mx-1"></div>
                                        <button
                                            className="btn btn-sm btn-ghost text-black"
                                            onClick={() => {
                                                handleDelete(product.id);
                                            }}
                                        >
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

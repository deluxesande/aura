import { Product } from "@/utils/typesDefinitions";
import {
    PlusCircle,
    Edit,
    Trash,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function MobileProductList({
    products,
    handleDelete,
    loading = false,
}: {
    products: Product[];
    handleDelete: (productId: string) => void;
    loading?: boolean;
}) {
    const router = useRouter();

    const handleEditClick = (productId: string) => {
        router.push(`/products/${productId}/edit`);
    };

    return (
        <div className="p-4 card bg-white shadow-lg rounded-lg mt-4">
            <div className="flex flex-wrap space-y-4 lg:space-y-0 justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-400">
                    All Products
                </h1>
                <Link className="w-full" href="/products/create">
                    <button className="btn btn-sm btn-ghost lg:w-auto text-black flex items-center bg-green-400 w-full">
                        <PlusCircle className="w-4 h-4" />
                        Add Product
                    </button>
                </Link>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <span className="loading loading-spinner loading-lg text-green-500"></span>
                    <p className="mt-4 text-gray-600">Loading products...</p>
                </div>
            ) : products.length === 0 ? (
                <p className="p-4 text-black text-lg text-center">
                    No Products
                </p>
            ) : (
                <div className="flex flex-col space-y-4">
                    {products.map((product, index) => (
                        <div
                            key={index}
                            className="p-4 border rounded-lg shadow-sm bg-gray-50"
                        >
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold text-lg text-black max-w-36 whitespace-nowrap truncate">
                                    {product.name}
                                </h3>
                                <span className="text-sm text-gray-400 mr-3">
                                    {product.quantity}
                                </span>
                            </div>
                            <p className="text-sm text-gray-400 mt-1">
                                {product.description}
                            </p>
                            <div className="flex justify-between items-center mt-2">
                                <p className="text-green-600 font-light text-md">
                                    ${product.price}
                                </p>
                                <div className="flex space-x-2">
                                    <button
                                        className="btn btn-sm btn-ghost text-black"
                                        onClick={() =>
                                            handleEditClick(product.id)
                                        }
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        className="btn btn-sm btn-ghost text-black"
                                        onClick={() => handleDelete(product.id)}
                                    >
                                        <Trash className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            <div className="flex justify-center items-center pt-4 my-4 space-x-4">
                <button className="btn btn-sm btn-ghost text-black flex items-center bg-gray-100">
                    <ChevronLeft className="w-4 h-4" />
                    <span className="ml-2">Back</span>
                </button>
                <div className="flex space-x-2">
                    {Array.from({ length: 2 }).map((_, index) => (
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
    );
}

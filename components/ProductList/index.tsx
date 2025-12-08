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
import { useState } from "react";

export default function ProductList({
    products,
    handleDelete,
    loading = false,
}: {
    products: Product[];
    handleDelete: (productId: string) => void;
    loading?: boolean;
}) {
    const router = useRouter();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const handleEditClick = (productId: string) => {
        router.push(`/products/${productId}/edit`);
    };

    // Calculate pagination
    const totalPages = Math.ceil(products.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedProducts = products.slice(startIndex, endIndex);

    const handlePreviousPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    };

    const handlePageClick = (page: number) => {
        setCurrentPage(page);
    };

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages = [];
        const maxPagesToShow = 5;
        let startPage = Math.max(
            1,
            currentPage - Math.floor(maxPagesToShow / 2)
        );
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        return pages;
    };

    return (
        <div className="p-4 card bg-white shadow-lg rounded-lg mt-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-400">
                    All Products
                </h1>
                <Link href="/products/create">
                    <button className="btn btn-sm btn-ghost flex items-center bg-green-500 text-white hover:bg-green-600">
                        <PlusCircle className="w-4 h-4 stroke-white" />
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
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="py-12 px-4 text-center"
                                    >
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedProducts.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="p-4 text-black text-lg text-center"
                                    >
                                        No Products
                                    </td>
                                </tr>
                            ) : (
                                paginatedProducts?.map((product, index) => (
                                    <tr
                                        key={index}
                                        className="hover:bg-gray-100 cursor-pointer"
                                    >
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
                                            Ksh {product.price}
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
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && products.length > 0 && (
                    <div className="flex justify-center items-center pt-4 my-4 space-x-4">
                        <button
                            className="btn btn-xs btn-ghost flex items-center bg-green-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-600"
                            onClick={handlePreviousPage}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="w-4 h-4" />
                            <span className="text-sm">Back</span>
                        </button>
                        <div className="flex space-x-2">
                            {getPageNumbers().map((page) => (
                                <button
                                    key={page}
                                    onClick={() => handlePageClick(page)}
                                    className={`btn btn-xs border-0 ${
                                        currentPage === page
                                            ? "bg-green-500 text-white hover:bg-green-600"
                                            : "btn-ghost text-black hover:bg-green-100"
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                        <button
                            className="btn btn-xs btn-ghost flex items-center bg-green-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-600"
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                        >
                            <span className="text-sm">Next</span>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Page info */}
                {!loading && products.length > 0 && (
                    <div className="text-center text-sm text-gray-500 mt-2">
                        Page {currentPage} of {totalPages} | Showing{" "}
                        {startIndex + 1}-{Math.min(endIndex, products.length)}{" "}
                        of {products.length} products
                    </div>
                )}
            </div>
        </div>
    );
}

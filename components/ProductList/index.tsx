import { Product } from "@/utils/typesDefinitions";
import {
    ChevronLeft,
    ChevronRight,
    Edit,
    PlusCircle,
    Trash,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
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
                                {/* Image Column */}
                                <th className="py-2 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-400 w-20">
                                    Image
                                </th>
                                {/* Combined Details Column */}
                                <th className="py-2 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-400">
                                    Product Details
                                </th>
                                {/* Created By Column */}
                                <th className="py-2 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-400">
                                    Created By
                                </th>
                                {/* Price Column */}
                                <th className="py-2 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-400">
                                    Price
                                </th>
                                {/* Actions Column */}
                                <th className="py-2 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-400">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan={5}
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
                                        colSpan={5}
                                        className="p-4 text-black text-lg text-center"
                                    >
                                        No Products
                                    </td>
                                </tr>
                            ) : (
                                paginatedProducts?.map((product, index) => (
                                    <tr
                                        key={index}
                                        className="hover:bg-gray-50 border-b border-gray-100 last:border-0"
                                    >
                                        {/* 1. Product Image */}
                                        <td className="py-3 px-4">
                                            <div className="w-12 h-12 relative rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                                                {product.image ? (
                                                    <Image
                                                        src={product.image}
                                                        alt={product.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-xs text-gray-400">
                                                        No Img
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        {/* 2. Product Name & Description (Stacked) */}
                                        <td className="py-3 px-4 max-w-xs">
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {product.name}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate mt-0.5">
                                                    {product.description}
                                                </p>

                                                {/* COLOR CODED QUANTITY BADGE */}
                                                <span
                                                    className={`text-[10px] px-2 py-0.5 rounded-full mt-1 inline-block font-medium ${
                                                        product.quantity <= 5
                                                            ? "bg-red-100 text-red-600" // Low Stock Warning
                                                            : "bg-green-100 text-green-600" // Good Stock
                                                    }`}
                                                >
                                                    Qty: {product.quantity}
                                                </span>
                                            </div>
                                        </td>

                                        {/* 3. Created By */}
                                        <td className="py-3 px-4 text-black text-sm">
                                            {product.creator ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 ring-2 ring-gray-200 relative">
                                                        <Image
                                                            src={
                                                                product.creator
                                                                    .imageUrl ||
                                                                "https://www.svgrepo.com/show/535711/user.svg"
                                                            }
                                                            fill
                                                            alt={`${product.creator.firstName} Profile`}
                                                            className="object-cover rounded-full"
                                                        />
                                                    </div>
                                                    <div className="flex flex-col overflow-hidden">
                                                        <p className="text-sm font-semibold text-gray-900 truncate">
                                                            {
                                                                product.creator
                                                                    .firstName
                                                            }{" "}
                                                            {
                                                                product.creator
                                                                    .lastName
                                                            }
                                                        </p>
                                                        <p className="text-xs text-gray-500 truncate">
                                                            {
                                                                product.creator
                                                                    .role
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-sm">
                                                    Unknown
                                                </span>
                                            )}
                                        </td>

                                        {/* 4. Price */}
                                        <td className="py-3 px-4 text-sm font-medium text-gray-900">
                                            Ksh {product.price}
                                        </td>

                                        {/* 5. Actions */}
                                        <td className="py-3 px-4">
                                            <div className="flex items-center">
                                                <button
                                                    className="btn btn-sm btn-ghost text-gray-600 hover:text-green-600"
                                                    onClick={() =>
                                                        handleEditClick(
                                                            product.id
                                                        )
                                                    }
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <div className="border-l border-gray-300 h-4 mx-1"></div>
                                                <button
                                                    className="btn btn-sm btn-ghost text-gray-600 hover:text-red-600"
                                                    onClick={() =>
                                                        handleDelete(product.id)
                                                    }
                                                >
                                                    <Trash className="w-4 h-4" />
                                                </button>
                                            </div>
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
                        {/* Previous Button */}
                        <button
                            className="btn btn-xs btn-ghost flex items-center bg-green-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-600"
                            onClick={handlePreviousPage}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="w-4 h-4" />
                            <span className="hidden sm:inline text-sm">
                                Back
                            </span>
                        </button>

                        {/* Page Numbers */}
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

                        {/* Next Button */}
                        <button
                            className="btn btn-xs btn-ghost flex items-center bg-green-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-600"
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                        >
                            <span className="hidden sm:inline text-sm">
                                Next
                            </span>
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

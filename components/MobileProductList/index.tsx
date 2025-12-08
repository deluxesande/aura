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
import { useState } from "react";

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
            <div className="flex flex-wrap space-y-4 lg:space-y-0 justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-400">
                    All Products
                </h1>
                <Link className="w-full" href="/products/create">
                    <button className="btn btn-sm btn-ghost lg:w-auto flex items-center bg-green-500 text-white hover:bg-green-600 w-full">
                        <PlusCircle className="w-4 h-4 stroke-white" />
                        Add Product
                    </button>
                </Link>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                </div>
            ) : paginatedProducts.length === 0 ? (
                <p className="p-4 text-black text-lg text-center">
                    No Products
                </p>
            ) : (
                <div className="flex flex-col space-y-4">
                    {paginatedProducts.map((product, index) => (
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
            {!loading && products.length > 0 && (
                <div className="flex justify-center items-center pt-4 my-4 space-x-4">
                    <button
                        className="btn btn-sm btn-ghost flex items-center bg-green-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-600"
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="w-4 h-4" />
                        <span className="ml-2 text-sm">Back</span>
                    </button>
                    <div className="flex space-x-2">
                        {getPageNumbers().map((page) => (
                            <button
                                key={page}
                                onClick={() => handlePageClick(page)}
                                className={`btn btn-sm border-0 ${
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
                        className="btn btn-sm btn-ghost flex items-center bg-green-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-600"
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                    >
                        <span className="mr-2 text-sm">Next</span>
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Page info */}
            {!loading && products.length > 0 && (
                <div className="text-center text-sm text-gray-500 mt-2">
                    Page {currentPage} of {totalPages} | Showing{" "}
                    {startIndex + 1}-{Math.min(endIndex, products.length)} of{" "}
                    {products.length} products
                </div>
            )}
        </div>
    );
}

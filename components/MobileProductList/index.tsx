import { Product } from "@/utils/typesDefinitions";
import {
    PlusCircle,
    Edit,
    Trash,
    ChevronLeft,
    ChevronRight,
    Search,
    ArrowRightLeft,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import NoProductsFound from "../NoProducts";

export default function MobileProductList({
    products,
    handleDelete,
    onTransferClick,
    loading = false,
}: {
    products: Product[];
    handleDelete: (productId: string) => void;
    onTransferClick: (product: any) => void;
    loading?: boolean;
}) {
    const router = useRouter();
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const itemsPerPage = 10;

    const handleEditClick = (productId: string) => {
        router.push(`/products/${productId}/edit`);
    };

    // Extract Unique Categories
    const categories = [
        "All",
        ...Array.from(
            new Set(products.map((p: any) => p.Category?.name).filter(Boolean)),
        ),
    ];

    const filteredProducts = products.filter((product: any) => {
        const matchesCategory =
            selectedCategory === "All" ||
            product.Category?.name === selectedCategory;

        const query = searchQuery.toLowerCase();
        const matchesSearch =
            product.name.toLowerCase().includes(query) ||
            product.description?.toLowerCase().includes(query) ||
            product.sku?.toLowerCase().includes(query);

        return matchesCategory && matchesSearch;
    });

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedCategory]);

    // Calculate pagination based on FILTERED products
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

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
        const maxPagesToShow = 3;
        let startPage = Math.max(
            1,
            currentPage - Math.floor(maxPagesToShow / 2),
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
            <div className="flex flex-col space-y-4 mb-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-400">
                        All Products
                    </h1>
                </div>

                {!loading && products.length > 0 && (
                    <div className="flex flex-col gap-3">
                        <select
                            value={selectedCategory}
                            onChange={(e) =>
                                setSelectedCategory(e.target.value)
                            }
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500/20 transition-all cursor-pointer font-medium text-gray-600"
                        >
                            {categories.map((cat) => (
                                <option key={cat} value={cat as string}>
                                    {cat as string}
                                </option>
                            ))}
                        </select>

                        <div className="relative w-full">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 stroke-green-500" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search by name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-gray-50 text-gray-700 placeholder-gray-400 transition-colors"
                            />
                        </div>
                    </div>
                )}

                <Link className="w-full" href="/products/create">
                    <button className="btn btn-sm btn-ghost flex items-center justify-center bg-green-500 text-white hover:bg-green-600 w-full">
                        <PlusCircle className="w-4 h-4 stroke-white mr-2" />
                        Add Product
                    </button>
                </Link>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                </div>
            ) : paginatedProducts.length === 0 ? (
                <div className="p-8 text-center">
                    {products.length > 0 ? (
                        <div className="flex flex-col items-center gap-2">
                            <p className="text-gray-500">
                                No products found matching &quot;{searchQuery}
                                &quot;
                            </p>
                            <button
                                onClick={() => setSearchQuery("")}
                                className="text-sm text-green-500 hover:underline"
                            >
                                Clear search
                            </button>
                        </div>
                    ) : (
                        <NoProductsFound />
                    )}
                </div>
            ) : (
                <div className="flex flex-col space-y-4">
                    {paginatedProducts.map((product, index) => (
                        <div
                            key={index}
                            className="p-4 border rounded-lg shadow-sm bg-gray-50 flex flex-col gap-3"
                        >
                            <div className="flex gap-4">
                                <div className="w-20 h-20 relative rounded-lg overflow-hidden bg-gray-200 shrink-0 border border-gray-200">
                                    {product.image ? (
                                        <Image
                                            src={product.image}
                                            alt={product.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-[10px] text-gray-500">
                                            No Img
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <h3 className="font-bold text-base text-gray-900 truncate">
                                        {product.name}
                                    </h3>
                                    <p className="text-xs text-gray-500 truncate mt-1">
                                        {product.description}
                                    </p>
                                    <div className="mt-2">
                                        <span
                                            className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                                product.quantity <= 5
                                                    ? "bg-red-100 text-red-600"
                                                    : "bg-green-100 text-green-500"
                                            }`}
                                        >
                                            Qty: {product.quantity}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 my-1"></div>

                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-400">
                                    Created by:
                                </span>
                                {product.creator ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full overflow-hidden relative ring-1 ring-gray-200">
                                            <Image
                                                src={
                                                    product.creator.imageUrl ||
                                                    "/images/user.png"
                                                }
                                                fill
                                                alt="Creator"
                                                className="object-cover"
                                            />
                                        </div>
                                        <span className="text-xs font-medium text-gray-700">
                                            {product.creator.firstName}
                                        </span>
                                    </div>
                                ) : (
                                    <span className="text-xs text-gray-400">
                                        Unknown
                                    </span>
                                )}
                            </div>

                            <div className="flex justify-between items-center mt-1 bg-white p-2 rounded border border-gray-100">
                                <p className="text-green-500 font-bold text-lg">
                                    Ksh {product.price}
                                </p>
                                <div className="flex space-x-1">
                                    {product.type !== "TEMPLATE" && (
                                        <button
                                            className="btn btn-sm btn-ghost text-gray-600 hover:text-blue-600"
                                            onClick={() =>
                                                onTransferClick(product)
                                            }
                                            title="Transfer Stock"
                                        >
                                            <ArrowRightLeft className="w-4 h-4" />
                                        </button>
                                    )}
                                    <div className="border-l border-gray-300 h-5 mx-1 self-center"></div>
                                    <button
                                        className="btn btn-sm btn-ghost text-gray-600 hover:text-green-500"
                                        onClick={() =>
                                            handleEditClick(product.id)
                                        }
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <div className="border-l border-gray-300 h-5 mx-1 self-center"></div>
                                    <button
                                        className="btn btn-sm btn-ghost text-gray-600 hover:text-red-600"
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

            {/* Pagination - Only show if we have filtered items */}
            {!loading && filteredProducts.length > 0 && (
                <div className="flex justify-center items-center pt-4 my-4 space-x-4">
                    <button
                        className="btn btn-xs btn-ghost flex items-center bg-green-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-600"
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="w-4 h-4" />
                        <span className="hidden sm:inline text-sm">Back</span>
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
                        <span className="hidden sm:inline text-sm">Next</span>
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Page info */}
            {!loading && filteredProducts.length > 0 && (
                <div className="text-center text-sm text-gray-500 mt-2">
                    Page {currentPage} of {totalPages} | Showing{" "}
                    {startIndex + 1}-
                    {Math.min(endIndex, filteredProducts.length)} of{" "}
                    {filteredProducts.length} products
                </div>
            )}
        </div>
    );
}

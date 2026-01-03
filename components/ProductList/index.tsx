import { Product } from "@/utils/typesDefinitions";
import {
    ChevronLeft,
    ChevronRight,
    Edit,
    ListFilter,
    PlusCircle,
    Search,
    Trash,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import NoProductsFound from "../NoProducts";

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
            new Set(products.map((p: any) => p.Category?.name).filter(Boolean))
        ),
    ];

    const filteredProducts = products.filter((product: any) => {
        // 1. Check Category
        const matchesCategory =
            selectedCategory === "All" ||
            product.Category?.name === selectedCategory;

        // 2. Check Search (Name, Description, or SKU)
        const query = searchQuery.toLowerCase();
        const matchesSearch =
            product.name.toLowerCase().includes(query) ||
            product.description?.toLowerCase().includes(query) ||
            product.sku?.toLowerCase().includes(query);

        return matchesCategory && matchesSearch;
    });

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCategory, searchQuery]);

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
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-gray-400">
                        All Products
                    </h1>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                    {!loading && products.length > 0 && (
                        <div className="relative w-full sm:w-64">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 stroke-green-500" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-gray-50 text-gray-700 placeholder-gray-400 transition-colors"
                            />
                        </div>
                    )}

                    {/* CATEGORY FILTER DROPDOWN */}
                    {!loading && products.length > 0 && (
                        <div className="relative w-full sm:w-auto">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <ListFilter className="h-4 w-4 text-gray-400" />
                            </div>
                            <select
                                value={selectedCategory}
                                onChange={(e) =>
                                    setSelectedCategory(e.target.value)
                                }
                                className="w-full sm:w-auto pl-9 pr-8 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-gray-50 text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors appearance-none"
                            >
                                {categories.map((category: any) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    <Link href="/products/create">
                        <button className="btn btn-sm btn-ghost flex items-center bg-green-500 text-white hover:bg-green-600 whitespace-nowrap">
                            <PlusCircle className="w-4 h-4 stroke-white mr-2" />
                            Add Product
                        </button>
                    </Link>
                </div>
            </div>

            <div className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                        <thead>
                            <tr>
                                {/* Combined Details Column */}
                                <th className="py-2 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-400">
                                    Product Details
                                </th>
                                <th className="py-2 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-400">
                                    Category
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
                                        className="p-12 text-center text-gray-500"
                                    >
                                        {products.length > 0 ? (
                                            <div className="flex flex-col items-center gap-2">
                                                <p className="text-lg">
                                                    No products found matching
                                                    your filters
                                                </p>
                                                <div className="flex gap-2 text-sm">
                                                    <button
                                                        onClick={() =>
                                                            setSearchQuery("")
                                                        }
                                                        className="text-green-600 hover:underline"
                                                    >
                                                        Clear search
                                                    </button>
                                                    <span>or</span>
                                                    <button
                                                        onClick={() =>
                                                            setSelectedCategory(
                                                                "All"
                                                            )
                                                        }
                                                        className="text-green-600 hover:underline"
                                                    >
                                                        Clear category
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <NoProductsFound />
                                        )}
                                    </td>
                                </tr>
                            ) : (
                                paginatedProducts?.map((product, index) => (
                                    <tr
                                        key={index}
                                        className="hover:bg-gray-50 border-b border-gray-100 last:border-0"
                                    >
                                        {/* Product Details (Image, Name, Desc, Qty) */}
                                        <td className="py-3 px-4 max-w-xs">
                                            <div className="flex items-center gap-4">
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
                                                            product.quantity <=
                                                            5
                                                                ? "bg-red-100 text-red-600"
                                                                : "bg-green-100 text-green-600"
                                                        }`}
                                                    >
                                                        Qty: {product.quantity}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Category */}
                                        <td className="py-3 px-4 text-black text-sm">
                                            {product.Category
                                                ? product.Category.name
                                                : "Un-categorized"}
                                        </td>

                                        {/* Created By */}
                                        <td className="py-3 px-4 text-black text-sm">
                                            {product.creator ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 ring-2 ring-gray-200 relative">
                                                        <Image
                                                            src={
                                                                product.creator
                                                                    .imageUrl ||
                                                                "/images/user.png"
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

                                        {/* Price */}
                                        <td className="py-3 px-4 text-sm font-medium text-gray-900">
                                            Ksh {product.price}
                                        </td>

                                        {/* Actions */}
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
                {!loading && filteredProducts.length > 0 && (
                    <div className="flex justify-center items-center pt-4 my-4 space-x-4">
                        <button
                            className="btn btn-xs btn-ghost flex items-center bg-green-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-600"
                            onClick={handlePreviousPage}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="w-4 h-4 stroke-white" />
                            <span className="hidden sm:inline text-sm text-white">
                                Back
                            </span>
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
                            <span className="hidden sm:inline text-sm text-white">
                                Next
                            </span>
                            <ChevronRight className="w-4 h-4 stroke-white" />
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
        </div>
    );
}

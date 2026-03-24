import { Product } from "@/utils/typesDefinitions";
import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    Edit,
    Filter,
    PlusCircle,
    Search,
    Trash,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { Fragment, useEffect, useState, useMemo } from "react";
import { useDispatch } from "react-redux";
import { setProducts } from "@/store/slices/productSlice"; // <-- Added Redux import
import NoProductsFound from "../NoProducts";

// 1. EXTRACTED COMPONENT
const ProductRow = React.memo(
    ({
        product,
        isVariant = false,
        parentProduct,
        isExpanded,
        onToggleTemplate,
        onEditClick,
        onDelete,
    }: {
        product: any;
        isVariant?: boolean;
        parentProduct?: any;
        isExpanded?: boolean;
        onToggleTemplate?: (id: string) => void;
        onEditClick: (id: string) => void;
        onDelete: (id: string, parentId?: string) => void; // <-- Updated signature to accept parentId
    }) => {
        const isTemplate = product.type === "TEMPLATE";

        const displayCategory =
            isVariant && parentProduct
                ? parentProduct.Category?.name
                : product.Category?.name || "Un-categorized";

        const displayCreator =
            isVariant && parentProduct
                ? parentProduct.creator
                : product.creator;

        const displayQty = isTemplate
            ? product.variants?.reduce(
                  (sum: number, v: any) => sum + v.quantity,
                  0,
              ) || 0
            : product.quantity;

        const attributes = product.attributeValues
            ?.map((av: any) => av.attributeOption.value)
            .join(" / ");

        return (
            <Fragment>
                <tr
                    className={`${isVariant ? "bg-gray-50/50" : "hover:bg-gray-50"} border-b border-gray-100 last:border-0 transition-colors`}
                >
                    <td className="py-3 px-4 max-w-xs">
                        <div
                            className={`flex items-center gap-4 ${isVariant ? "pl-8" : ""}`}
                        >
                            {isTemplate && onToggleTemplate && (
                                <button
                                    onClick={() => onToggleTemplate(product.id)}
                                    className="p-1 hover:bg-gray-200 rounded transition-colors text-gray-400 hover:text-green-500"
                                >
                                    {isExpanded ? (
                                        <ChevronUp size={16} />
                                    ) : (
                                        <ChevronDown size={16} />
                                    )}
                                </button>
                            )}
                            {!isTemplate && isVariant && (
                                <div className="w-4 h-px bg-gray-300" />
                            )}

                            <div className="w-12 h-12 relative rounded-md overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                                {product.image ? (
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-[10px] text-gray-400">
                                        No Img
                                    </div>
                                )}
                            </div>

                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-semibold text-gray-900 truncate">
                                        {product.name}
                                    </p>
                                    {isTemplate && (
                                        <span className="bg-green-100 text-green-600 text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1">
                                            TEMPLATE
                                        </span>
                                    )}
                                </div>
                                {isVariant && attributes && (
                                    <p className="text-[10px] font-bold text-green-500 uppercase tracking-tight">
                                        {attributes}
                                    </p>
                                )}
                                <p className="text-xs text-gray-500 truncate mt-0.5">
                                    {product.description}
                                </p>

                                <span
                                    className={`text-[10px] px-2 py-0.5 rounded-full mt-1 inline-block font-medium ${
                                        displayQty <= 5
                                            ? "bg-red-100 text-red-600"
                                            : "bg-green-100 text-green-600"
                                    }`}
                                >
                                    Qty: {displayQty}{" "}
                                    {isTemplate &&
                                        `(${product.variants?.length} variants)`}
                                </span>
                            </div>
                        </div>
                    </td>

                    <td className="py-3 px-4 text-gray-600 text-sm">
                        {displayCategory}
                    </td>

                    <td className="py-3 px-4 text-gray-600 text-sm">
                        {displayCreator ? (
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 ring-2 ring-gray-100 relative">
                                    <Image
                                        src={
                                            displayCreator.imageUrl ||
                                            "/images/user.png"
                                        }
                                        fill
                                        alt="Creator"
                                        className="object-cover"
                                    />
                                </div>
                                <div className="flex flex-col overflow-hidden max-w-[100px]">
                                    <p className="text-xs font-semibold text-gray-900 truncate">
                                        {displayCreator.firstName}
                                    </p>
                                    <p className="text-[10px] text-gray-500 truncate uppercase">
                                        {displayCreator.role}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            "Unknown"
                        )}
                    </td>

                    <td className="py-3 px-4 text-sm font-medium text-gray-900">
                        {isTemplate ? "—" : `Ksh ${product.price}`}
                    </td>

                    <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                            <button
                                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                onClick={() => onEditClick(product.id)}
                            >
                                <Edit size={16} />
                            </button>
                            <button
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                // Passes the parent ID if this is a variant!
                                onClick={() =>
                                    onDelete(product.id, parentProduct?.id)
                                }
                            >
                                <Trash size={16} />
                            </button>
                        </div>
                    </td>
                </tr>
                {isTemplate &&
                    isExpanded &&
                    product.variants?.map((v: any) => (
                        <ProductRow
                            key={v.id}
                            product={v}
                            isVariant={true}
                            parentProduct={product}
                            onEditClick={onEditClick}
                            onDelete={onDelete}
                        />
                    ))}
            </Fragment>
        );
    },
);

ProductRow.displayName = "ProductRow";

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
    const dispatch = useDispatch(); // <-- Added Redux Dispatch

    const [currentPage, setCurrentPage] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedTemplates, setExpandedTemplates] = useState<string[]>([]);

    const itemsPerPage = 10;

    const handleEditClick = (productId: string) => {
        router.push(`/products/${productId}/edit`);
    };

    const toggleTemplate = (id: string) => {
        setExpandedTemplates((prev) =>
            prev.includes(id)
                ? prev.filter((tid) => tid !== id)
                : [...prev, id],
        );
    };

    // --- NEW: Redux Delete Wrapper ---
    const handleDeleteWrapper = (id: string, parentId?: string) => {
        // 1. Trigger the original API call passed from the parent page
        handleDelete(id);

        // 2. Immediately update Redux so the UI reacts instantly
        const updatedProducts = products
            .filter((p) => p.id !== id) // Removes standard products and templates
            .map((p) => {
                // If this is the parent template of the deleted variant, filter it out of the nested array
                if (parentId && p.id === parentId) {
                    return {
                        ...p,
                        variants: p.variants?.filter((v: any) => v.id !== id),
                    };
                }
                return p;
            });

        dispatch(setProducts(updatedProducts));
    };

    const categories = useMemo(() => {
        return [
            "All",
            ...Array.from(
                new Set(
                    products.map((p: any) => p.Category?.name).filter(Boolean),
                ),
            ),
        ];
    }, [products]);

    const filteredProducts = useMemo(() => {
        const baseProducts = products.filter((p) => p.type !== "VARIANT");
        const query = searchQuery.toLowerCase();

        return baseProducts.filter((product: any) => {
            const matchesCategory =
                selectedCategory === "All" ||
                product.Category?.name === selectedCategory;

            const matchesSearch =
                !query ||
                product.name.toLowerCase().includes(query) ||
                product.description?.toLowerCase().includes(query) ||
                product.sku?.toLowerCase().includes(query);

            return matchesCategory && matchesSearch;
        });
    }, [products, selectedCategory, searchQuery]);

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCategory, searchQuery]);

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    const handlePreviousPage = () =>
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    const handleNextPage = () =>
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    const handlePageClick = (page: number) => setCurrentPage(page);

    const getPageNumbers = () => {
        const pages = [];
        const maxPagesToShow = 5;
        let startPage = Math.max(
            1,
            currentPage - Math.floor(maxPagesToShow / 2),
        );
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
        if (endPage - startPage + 1 < maxPagesToShow)
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        for (let i = startPage; i <= endPage; i++) pages.push(i);
        return pages;
    };

    return (
        <div className="p-4 card bg-white shadow-lg rounded-lg mt-4 border border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold text-gray-400">Inventory</h1>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                    {!loading && products.length > 0 && (
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 stroke-green-500" />
                                <input
                                    type="text"
                                    placeholder="Search inventory..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg outline-none bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500/20 transition-all"
                                />
                            </div>

                            <select
                                value={selectedCategory}
                                onChange={(e) =>
                                    setSelectedCategory(e.target.value)
                                }
                                className="pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg outline-none bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500/20 transition-all appearance-none cursor-pointer font-medium text-gray-600"
                            >
                                {categories.map((cat) => (
                                    <option key={cat} value={cat as string}>
                                        {cat as string}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <Link href="/products/create">
                        <button className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-green-600 transition-all shadow-lg shadow-green-100 whitespace-nowrap">
                            <PlusCircle size={18} className="stroke-white" />
                            Add Product
                        </button>
                    </Link>
                </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-100">
                <table className="min-w-full bg-white">
                    <thead className="bg-gray-50/50">
                        <tr>
                            <th className="py-4 px-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                Product Details
                            </th>
                            <th className="py-4 px-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                Category
                            </th>
                            <th className="py-4 px-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                Added By
                            </th>
                            <th className="py-4 px-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                Unit Price
                            </th>
                            <th className="py-4 px-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="py-20 text-center">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500 mx-auto"></div>
                                </td>
                            </tr>
                        ) : paginatedProducts.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-20">
                                    <NoProductsFound />
                                </td>
                            </tr>
                        ) : (
                            paginatedProducts.map((product) => (
                                <ProductRow
                                    key={product.id}
                                    product={product}
                                    isExpanded={expandedTemplates.includes(
                                        product.id,
                                    )}
                                    onToggleTemplate={toggleTemplate}
                                    onEditClick={handleEditClick}
                                    // Use the new Redux wrapper instead of standard handleDelete
                                    onDelete={handleDeleteWrapper}
                                />
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {!loading && filteredProducts.length > 0 && (
                <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
                    <p className="text-xs text-gray-500 font-medium">
                        Showing {startIndex + 1} -{" "}
                        {Math.min(endIndex, filteredProducts.length)} of{" "}
                        {filteredProducts.length} items
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePreviousPage}
                            disabled={currentPage === 1}
                            className="p-2 bg-gray-50 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <div className="flex gap-1">
                            {getPageNumbers().map((page) => (
                                <button
                                    key={page}
                                    onClick={() => handlePageClick(page)}
                                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                                        currentPage === page
                                            ? "bg-green-500 text-white shadow-md shadow-green-100"
                                            : "hover:bg-gray-100 text-gray-600"
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            className="p-2 bg-gray-50 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

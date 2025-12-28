import React, { useState, useEffect } from "react";
import {
    Trash,
    ChevronLeft,
    ChevronRight,
    Check,
    Clock,
    X,
    Filter,
} from "lucide-react";
import { Invoice } from "@/utils/typesDefinitions";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Extend the Invoice interface
interface ExtendedInvoice extends Invoice {
    totalQuantity?: number;
}

export default function InvoicesTable({
    title,
    invoices,
    handleDelete,
    loading = false,
    itemsPerPage = 10,
}: {
    title: string;
    invoices: ExtendedInvoice[];
    handleDelete: (invoiceId: string) => void;
    loading?: boolean;
    itemsPerPage?: number;
}) {
    const router = useRouter();
    const [currentPage, setCurrentPage] = useState(1);

    // 1. Internal Filter State
    const [filterStatus, setFilterStatus] = useState<
        "ALL" | "PAID" | "PENDING" | "CANCELLED"
    >("ALL");

    // 2. Filter Logic
    const filteredInvoices = invoices.filter((inv) => {
        if (filterStatus === "ALL") return true;
        return inv.status?.toLowerCase() === filterStatus.toLowerCase();
    });

    // 3. Reset to Page 1 when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [filterStatus]);

    const handleRowClick = (invoiceId: string) => {
        router.push(`/invoice?id=${invoiceId}`);
    };

    const getStatusBadgeColor = (status: string | undefined) => {
        switch (status?.toLowerCase()) {
            case "paid":
                return "bg-green-100 text-green-700";
            case "pending":
                return "bg-yellow-100 text-yellow-700";
            case "cancelled":
                return "bg-red-100 text-red-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    const getStatusIcon = (status: string | undefined) => {
        switch (status?.toLowerCase()) {
            case "paid":
                return <Check className="w-3 h-3 stroke-green-700" />;
            case "pending":
                return <Clock className="w-3 h-3 stroke-yellow-700" />;
            case "cancelled":
                return <X className="w-3 h-3 stroke-red-700" />;
            default:
                return null;
        }
    };

    const getRoleBadgeColor = (role: string | undefined) => {
        switch (role?.toLowerCase()) {
            case "admin":
                return "bg-purple-100 text-purple-800";
            case "manager":
                return "bg-blue-100 text-blue-800";
            case "user":
                return "bg-gray-100 text-gray-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    // 4. Calculate pagination based on FILTERED results
    const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedInvoices = filteredInvoices.slice(startIndex, endIndex);

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
            {/* Header Area with Title & Filters */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold text-gray-400">{title}</h1>

                {/* Filter Tabs */}
                <div className="flex items-center bg-gray-100 p-1 rounded-lg">
                    {(["ALL", "PENDING", "PAID", "CANCELLED"] as const).map(
                        (status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`
                        px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200
                        ${
                            filterStatus === status
                                ? "bg-green-500 text-white shadow-sm"
                                : "text-gray-400 hover:text-gray-700 hover:bg-gray-200/50"
                        }
                    `}
                            >
                                {status === "ALL"
                                    ? "All"
                                    : status.charAt(0) +
                                      status.slice(1).toLowerCase()}
                            </button>
                        )
                    )}
                </div>
            </div>

            {/* Table for larger screens */}
            <div className="hidden lg:block">
                <div className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white">
                            <thead>
                                <tr>
                                    <th className="py-2 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-400">
                                        Invoice Name
                                    </th>
                                    <th className="py-2 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-400">
                                        Created By
                                    </th>
                                    <th className="py-2 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-400">
                                        Quantity
                                    </th>
                                    <th className="py-2 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-400">
                                        Amount
                                    </th>
                                    <th className="py-2 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-400">
                                        Status
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
                                ) : paginatedInvoices.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="py-12 px-4 text-center text-gray-500"
                                        >
                                            {filterStatus === "ALL"
                                                ? "No Invoices Found"
                                                : `No ${filterStatus.toLowerCase()} invoices found.`}
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedInvoices?.map((invoice, index) => (
                                        <tr
                                            key={index}
                                            className="hover:bg-gray-50 cursor-pointer transition-colors"
                                            onClick={() =>
                                                handleRowClick(
                                                    String(invoice.id)
                                                )
                                            }
                                        >
                                            <td className="py-3 px-4 border-b text-black text-sm border-gray-100">
                                                <p className="font-medium">
                                                    {invoice.invoiceName}
                                                </p>
                                            </td>
                                            <td className="py-3 px-4 border-b text-black text-sm border-gray-100">
                                                {invoice.creator ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 ring-2 ring-gray-200">
                                                            <Image
                                                                src={
                                                                    invoice
                                                                        .creator
                                                                        .imageUrl ||
                                                                    "https://www.svgrepo.com/show/535711/user.svg"
                                                                }
                                                                width={32}
                                                                height={32}
                                                                alt={`${invoice.creator.firstName} Profile`}
                                                                className="object-cover rounded-full"
                                                            />
                                                        </div>
                                                        <div className="flex flex-col overflow-hidden">
                                                            <p className="text-sm font-semibold text-gray-900 truncate">
                                                                {
                                                                    invoice
                                                                        .creator
                                                                        .firstName
                                                                }{" "}
                                                                {
                                                                    invoice
                                                                        .creator
                                                                        .lastName
                                                                }
                                                            </p>
                                                            <p className="text-xs text-gray-500 truncate">
                                                                {
                                                                    invoice
                                                                        .creator
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
                                            <td className="py-3 px-4 border-b text-black text-sm border-gray-100">
                                                {invoice.totalQuantity}
                                            </td>
                                            <td className="py-3 px-4 border-b text-black text-sm border-gray-100">
                                                <span className="font-semibold">
                                                    Ksh {invoice.totalAmount}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 border-b text-black text-xs border-gray-100">
                                                <span
                                                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                                                        invoice.status
                                                    )}`}
                                                >
                                                    {getStatusIcon(
                                                        invoice.status
                                                    )}
                                                    {invoice.status ||
                                                        "Unknown"}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 border-b border-gray-100">
                                                <button
                                                    className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(
                                                            String(invoice.id)
                                                        );
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
                </div>
            </div>

            {/* Card tiles for smaller screens */}
            <div className="block lg:hidden">
                {loading ? (
                    <div className="w-full py-12 flex flex-col items-center justify-center">
                        <div className="flex flex-col items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                        </div>
                    </div>
                ) : paginatedInvoices.length === 0 ? (
                    <p className="text-gray-500 text-center p-8">
                        {filterStatus === "ALL"
                            ? "No Invoices"
                            : `No ${filterStatus.toLowerCase()} invoices found.`}
                    </p>
                ) : (
                    <div className="flex flex-col space-y-4">
                        {paginatedInvoices.map((invoice, index) => (
                            <div
                                key={index}
                                className="p-4 border rounded-lg shadow-sm bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors flex flex-col gap-3"
                                onClick={() =>
                                    handleRowClick(String(invoice.id))
                                }
                            >
                                {/* TOP SECTION: Name, Quantity, Status */}
                                <div className="flex justify-between items-start">
                                    <div className="flex flex-col min-w-0 mr-2">
                                        <h3 className="font-bold text-base text-gray-900 truncate">
                                            {invoice.invoiceName}
                                        </h3>
                                        <span className="text-xs text-gray-500 mt-1">
                                            {invoice.totalQuantity} Items
                                        </span>
                                    </div>

                                    {/* Status Badge */}
                                    <span
                                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium shrink-0 ${getStatusBadgeColor(
                                            invoice.status
                                        )}`}
                                    >
                                        {getStatusIcon(invoice.status)}
                                        {invoice.status || "Unknown"}
                                    </span>
                                </div>

                                <div className="border-t border-gray-200 my-1"></div>

                                {/* MIDDLE SECTION: Creator Info */}
                                <div className="flex items-center justify-between">
                                    {invoice.creator ? (
                                        <div className="flex flex-1 items-center gap-2">
                                            <div className="w-6 h-6 rounded-full overflow-hidden relative ring-1 ring-gray-200">
                                                <Image
                                                    src={
                                                        invoice.creator
                                                            .imageUrl ||
                                                        "https://www.svgrepo.com/show/535711/user.svg"
                                                    }
                                                    fill
                                                    alt="Creator"
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-medium text-gray-700">
                                                    {invoice.creator.firstName}{" "}
                                                    {invoice.creator.lastName}
                                                </span>
                                                <span
                                                    className={`px-1.5 py-0.5 rounded-[4px] text-[10px] font-semibold ${getRoleBadgeColor(
                                                        invoice.creator.role
                                                    )}`}
                                                >
                                                    {invoice.creator.role}
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-gray-400">
                                            Unknown
                                        </span>
                                    )}
                                </div>

                                {/* BOTTOM SECTION: Price & Actions */}
                                <div className="flex justify-between items-center mt-1 bg-white p-2 rounded border border-gray-100">
                                    <p className="text-green-600 font-bold text-lg">
                                        Ksh {invoice.totalAmount}
                                    </p>
                                    <button
                                        className="btn btn-sm btn-ghost text-gray-500 hover:text-red-600"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(String(invoice.id));
                                        }}
                                    >
                                        <Trash className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {!loading && paginatedInvoices.length > 0 && (
                <div className="flex flex-wrap justify-center items-center pt-4 my-4 gap-2 sm:gap-4">
                    <button
                        className="btn btn-xs btn-ghost flex items-center bg-green-400 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-600"
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="w-4 h-4 stroke-white" />
                        <span className="hidden sm:inline text-sm text-white">
                            Back
                        </span>
                    </button>

                    <div className="flex space-x-1 sm:space-x-2">
                        {getPageNumbers().map((page) => (
                            <button
                                key={page}
                                onClick={() => handlePageClick(page)}
                                className={`btn btn-xs border-0 ${
                                    currentPage === page
                                        ? "bg-green-400 text-white hover:bg-green-600"
                                        : "btn-ghost text-black hover:bg-green-100"
                                }`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>

                    <button
                        className="btn btn-xs btn-ghost flex items-center bg-green-400 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-600"
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
            {!loading && filteredInvoices.length > 0 && (
                <div className="text-center text-sm text-gray-500 mt-2">
                    Page {currentPage} of {totalPages} | Showing{" "}
                    {startIndex + 1}-
                    {Math.min(endIndex, filteredInvoices.length)} of{" "}
                    {filteredInvoices.length}{" "}
                    {filterStatus === "ALL" ? "" : filterStatus.toLowerCase()}{" "}
                    invoices
                </div>
            )}
        </div>
    );
}

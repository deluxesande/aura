import React, { useState } from "react";
import {
    Trash,
    ChevronLeft,
    ChevronRight,
    Check,
    Clock,
    X,
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

    // Calculate pagination
    const totalPages = Math.ceil(invoices.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedInvoices = invoices.slice(startIndex, endIndex);

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
            <h1 className="text-2xl font-bold mb-6 text-gray-400">{title}</h1>

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
                                            className="py-2 px-4 text-black text-lg text-center"
                                        >
                                            No Invoices
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
                    <p className="text-black text-lg text-center">
                        No Invoices
                    </p>
                ) : (
                    <div className="flex flex-col space-y-4">
                        {paginatedInvoices.map((invoice, index) => (
                            <div
                                key={index}
                                className="p-4 border rounded-lg shadow-sm bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                                onClick={() =>
                                    handleRowClick(String(invoice.id))
                                }
                            >
                                <div className="flex justify-between items-start">
                                    <p className="font-bold text-lg text-black max-w-52 whitespace-nowrap truncate">
                                        {invoice.invoiceName}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-600">
                                            {invoice.totalQuantity}
                                        </span>
                                        <span
                                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                                                invoice.status
                                            )}`}
                                        >
                                            {getStatusIcon(invoice.status)}
                                            {invoice.status || "Unknown"}
                                        </span>
                                    </div>
                                </div>

                                {/* Creator Badge for Mobile */}
                                {invoice.creator && (
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 ring-2 ring-gray-200">
                                            <Image
                                                src={
                                                    invoice.creator.imageUrl ||
                                                    "https://www.svgrepo.com/show/535711/user.svg"
                                                }
                                                width={24}
                                                height={24}
                                                alt={`${invoice.creator.firstName} Profile`}
                                                className="object-cover rounded-full"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-xs font-medium text-gray-700">
                                                {invoice.creator.firstName}{" "}
                                                {invoice.creator.lastName}
                                            </p>
                                            <span
                                                className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getRoleBadgeColor(
                                                    invoice.creator.role
                                                )}`}
                                            >
                                                {invoice.creator.role}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-between items-center mt-3">
                                    <p className="text-green-600 font-semibold text-lg">
                                        Ksh {invoice.totalAmount}
                                    </p>
                                    <button
                                        className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
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
            {!loading && invoices.length > 0 && (
                <div className="flex justify-center items-center pt-4 my-4 space-x-4">
                    <button
                        className="btn btn-xs btn-ghost flex items-center bg-green-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-600"
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="w-4 h-4 stroke-white" />
                        <span className="text-sm text-white">Back</span>
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
                        <span className="text-sm text-white">Next</span>
                        <ChevronRight className="w-4 h-4 stroke-white" />
                    </button>
                </div>
            )}

            {/* Page info */}
            {!loading && invoices.length > 0 && (
                <div className="text-center text-sm text-gray-500 mt-2">
                    Page {currentPage} of {totalPages} | Showing{" "}
                    {startIndex + 1}-{Math.min(endIndex, invoices.length)} of{" "}
                    {invoices.length} invoices
                </div>
            )}
        </div>
    );
}

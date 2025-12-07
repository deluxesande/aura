import React, { useState } from "react";
import { Edit, Trash, ChevronLeft, ChevronRight } from "lucide-react";
import { Invoice } from "@/utils/typesDefinitions";
import { useRouter } from "next/navigation";

// Extend the Invoice interface
interface ExtendedInvoice extends Invoice {
    totalQuantity?: number;
}

export default function InvoicesTable({
    title,
    invoices,
    handleDelete,
    loading = false,
}: {
    title: string;
    invoices: ExtendedInvoice[];
    handleDelete: (invoiceId: string) => void;
    loading?: boolean;
}) {
    const router = useRouter();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const handleRowClick = (invoiceId: string) => {
        router.push(`/invoice?id=${invoiceId}`);
    };

    const getStatusBadgeColor = (status: string | undefined) => {
        switch (status?.toUpperCase()) {
            case "PAID":
                return "bg-green-500 text-white";
            case "PENDING":
                return "bg-yellow-500 text-white";
            case "CANCELLED":
                return "bg-red-500 text-white";
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
                                            colSpan={5}
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
                                            colSpan={5}
                                            className="py-2 px-4 text-black text-lg text-center"
                                        >
                                            No Invoices
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedInvoices?.map((invoice, index) => (
                                        <tr
                                            key={index}
                                            className="hover:bg-gray-100 cursor-pointer"
                                        >
                                            <td className="py-2 px-4 border-b text-black text-sm border-gray-100">
                                                <p>{invoice.invoiceName}</p>
                                            </td>
                                            <td className="py-2 px-4 border-b text-black text-sm border-gray-100">
                                                {invoice.totalQuantity}
                                            </td>
                                            <td className="py-2 px-4 border-b text-black text-sm border-gray-100">
                                                ${invoice.totalAmount}
                                            </td>
                                            <td className="py-2 px-4 border-b text-black text-sm border-gray-100">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(
                                                        invoice.status
                                                    )}`}
                                                >
                                                    {invoice.status ||
                                                        "Unknown"}
                                                </span>
                                            </td>
                                            <td className="py-2 px-4 border-b border-gray-100 flex items-center">
                                                <button
                                                    className="btn btn-sm btn-ghost text-black"
                                                    onClick={() =>
                                                        handleRowClick(
                                                            String(invoice.id)
                                                        )
                                                    }
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <div className="border-l border-gray-300 h-4 mx-1"></div>
                                                <button
                                                    className="btn btn-sm btn-ghost text-black"
                                                    onClick={() =>
                                                        handleDelete(
                                                            String(invoice.id)
                                                        )
                                                    }
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
                        <span className="loading loading-spinner loading-lg text-green-500"></span>
                        <p className="mt-4 text-gray-600">
                            Loading invoices...
                        </p>
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
                                className="p-4 border rounded-lg shadow-sm bg-gray-50"
                            >
                                <div className="flex justify-between items-start">
                                    <p className="font-bold text-lg text-black max-w-52 whitespace-nowrap truncate">
                                        {invoice.invoiceName}
                                    </p>
                                    <span className="text-sm text-gray-600 mr-3">
                                        {invoice.totalQuantity}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <p className="text-green-600 font-medium text-md">
                                        ${invoice.totalAmount}
                                    </p>
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(
                                            invoice.status
                                        )}`}
                                    >
                                        {invoice.status || "Unknown"}
                                    </span>
                                </div>
                                <div className="flex justify-end space-x-2 mt-3">
                                    <button
                                        className="btn btn-sm btn-ghost text-black"
                                        onClick={() =>
                                            handleRowClick(String(invoice.id))
                                        }
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        className="btn btn-sm btn-ghost text-black"
                                        onClick={() =>
                                            handleDelete(String(invoice.id))
                                        }
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

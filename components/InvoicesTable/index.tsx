import React, { useState, useEffect } from "react";
import {
    Trash,
    ChevronLeft,
    ChevronRight,
    Check,
    Clock,
    X,
    FileX,
    Calendar,
    CreditCard,
} from "lucide-react";
import { Invoice } from "@/utils/typesDefinitions";
import { useRouter } from "next/navigation";
import Image from "next/image";

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

    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [filterTime, setFilterTime] = useState<string>("30_days");
    const [filterPayment, setFilterPayment] = useState<string>("all");

    const filteredInvoices = invoices.filter((inv) => {
        if (filterStatus !== "all") {
            if (inv.status?.toLowerCase() !== filterStatus.toLowerCase()) {
                return false;
            }
        }

        if (filterPayment !== "all") {
            const pType = inv.paymentType?.toLowerCase() || "";
            if (pType !== filterPayment.toLowerCase()) {
                return false;
            }
        }

        if (filterTime === "all_time") return true;

        const invDate = new Date(inv.createdAt);
        const now = new Date();

        const invTime = invDate.getTime();

        switch (filterTime) {
            case "today":
                return invDate.toDateString() === now.toDateString();

            case "7_days": {
                const sevenDaysAgo = new Date(now);
                sevenDaysAgo.setDate(now.getDate() - 7);
                sevenDaysAgo.setHours(0, 0, 0, 0);
                return invTime >= sevenDaysAgo.getTime();
            }

            case "30_days": {
                const thirtyDaysAgo = new Date(now);
                thirtyDaysAgo.setDate(now.getDate() - 30);
                thirtyDaysAgo.setHours(0, 0, 0, 0);
                return invTime >= thirtyDaysAgo.getTime();
            }

            default:
                return true;
        }
    });

    useEffect(() => {
        setCurrentPage(1);
    }, [filterStatus, filterTime, filterPayment]);

    const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedInvoices = filteredInvoices.slice(startIndex, endIndex);

    const handleRowClick = (invoiceId: string) => {
        router.push(`/invoice?id=${invoiceId}`);
    };

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
            currentPage - Math.floor(maxPagesToShow / 2)
        );
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }
        for (let i = startPage; i <= endPage; i++) pages.push(i);
        return pages;
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

    const getEmptyStateContent = () => {
        if (invoices.length === 0) {
            return {
                title: "No invoices created",
                description:
                    "There are no invoices recorded in the system yet.",
            };
        }

        let timeText = "";
        switch (filterTime) {
            case "today":
                timeText = "today";
                break;
            case "7_days":
                timeText = "in the last 7 days";
                break;
            case "30_days":
                timeText = "in the last 30 days";
                break;
            case "all_time":
                timeText = "at all";
                break;
        }

        const statusText =
            filterStatus !== "all" ? filterStatus.toLowerCase() : "";
        const paymentText = filterPayment !== "all" ? filterPayment : "";

        let title = "No invoices found";

        if (statusText && paymentText) {
            title = `No ${statusText} ${paymentText} invoices`;
        } else if (statusText) {
            title = `No ${statusText} invoices`;
        } else if (paymentText) {
            title = `No ${paymentText} invoices`;
        }

        title = title.charAt(0).toUpperCase() + title.slice(1);

        return {
            title,
            description: `We couldn't find any results matching your filters ${timeText}.`,
        };
    };

    const emptyState = getEmptyStateContent();

    return (
        <div className="p-4 card bg-white shadow-lg rounded-lg mt-4">
            {/* Header Area with Title & Filters */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold text-gray-400 whitespace-nowrap">
                    {title}
                </h1>

                <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 w-full xl:w-auto">
                    {/* Status Tabs */}
                    <div className="flex items-center bg-gray-100 p-1 rounded-lg overflow-x-auto max-w-full">
                        {(
                            [
                                "all",
                                "pending",
                                "paid",
                                "cancelled",
                                "failed",
                            ] as const
                        ).map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`
                  px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 whitespace-nowrap uppercase
                  ${
                      filterStatus === status
                          ? "bg-green-500 text-white shadow-sm"
                          : "text-gray-400 hover:text-gray-700 hover:bg-gray-200/50"
                  }
                `}
                            >
                                {status}
                            </button>
                        ))}
                    </div>

                    <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>

                    {/* Time Filter */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                            <Calendar className="h-3.5 w-3.5 text-gray-400" />
                        </div>
                        <select
                            value={filterTime}
                            onChange={(e) => setFilterTime(e.target.value)}
                            className="pl-8 pr-8 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none cursor-pointer hover:bg-gray-100 transition-colors capitalize"
                        >
                            <option value="today">Today</option>
                            <option value="7_days">Last 7 Days</option>
                            <option value="30_days">Last 30 Days</option>
                            <option value="all_time">All Time</option>
                        </select>
                    </div>

                    {/* Payment Filter */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                            <CreditCard className="h-3.5 w-3.5 text-gray-400" />
                        </div>
                        <select
                            value={filterPayment}
                            onChange={(e) => setFilterPayment(e.target.value)}
                            className="pl-8 pr-8 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none cursor-pointer hover:bg-gray-100 transition-colors capitalize"
                        >
                            <option value="all">All Payments</option>
                            <option value="cash">Cash</option>
                            <option value="mpesa">Mpesa</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="hidden lg:block">
                <div className="overflow-hidden">
                    <div className="overflow-hidden rounded-lg border border-gray-200">
                        <table className="min-w-full bg-white">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Invoice Name
                                    </th>
                                    <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Created By
                                    </th>
                                    <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Quantity
                                    </th>
                                    <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Payment Type
                                    </th>
                                    <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan={7}
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
                                            colSpan={7}
                                            className="py-16 text-center"
                                        >
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="bg-green-100 border border-gray-100 rounded-full p-4 mb-3">
                                                    <FileX className="h-6 w-6 stroke-green-500" />
                                                </div>
                                                <h3 className="text-gray-900 font-medium text-sm">
                                                    {emptyState.title}
                                                </h3>
                                                <p className="text-gray-500 text-xs mt-1 max-w-xs mx-auto">
                                                    {emptyState.description}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedInvoices.map((invoice, index) => (
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
                                                <span className="text-[10px] text-gray-400">
                                                    {new Date(
                                                        invoice.createdAt
                                                    ).toLocaleDateString()}
                                                </span>
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
                                                                    "/images/user.png"
                                                                }
                                                                width={32}
                                                                height={32}
                                                                alt="Profile"
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
                                            <td className="py-3 px-4 border-b text-black text-sm border-gray-100">
                                                <span className="font-light text-sm">
                                                    {invoice.paymentType ||
                                                        "N/A"}
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
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                    </div>
                ) : paginatedInvoices.length === 0 ? (
                    <div className="flex flex-col items-center justify-center my-8">
                        <div className="bg-green-100 border border-gray-100 rounded-full p-4 mb-3">
                            <FileX className="h-6 w-6 stroke-green-500" />
                        </div>
                        <h3 className="text-gray-900 font-medium text-sm">
                            {emptyState.title}
                        </h3>
                        <p className="text-gray-500 text-xs mt-1 max-w-xs mx-auto text-center px-4">
                            {emptyState.description}
                        </p>
                    </div>
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
                                <div className="flex justify-between items-start">
                                    <div className="flex flex-col min-w-0 mr-2">
                                        <h3 className="font-bold text-base text-gray-900 truncate">
                                            {invoice.invoiceName}
                                        </h3>
                                        <span className="text-xs text-gray-500 mt-1">
                                            {invoice.totalQuantity} Items •{" "}
                                            {new Date(
                                                invoice.createdAt
                                            ).toLocaleDateString()}
                                        </span>
                                    </div>
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
                                <div className="flex items-center justify-between">
                                    {invoice.creator ? (
                                        <div className="flex flex-1 items-center gap-2">
                                            <div className="w-6 h-6 rounded-full overflow-hidden relative ring-1 ring-gray-200">
                                                <Image
                                                    src={
                                                        invoice.creator
                                                            .imageUrl ||
                                                        "/images/user.png"
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
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-gray-400">
                                            Unknown
                                        </span>
                                    )}
                                </div>
                                <div className="flex justify-between items-center mt-1 bg-white p-2 rounded border border-gray-100">
                                    <div className="flex flex-col">
                                        <p className="text-green-600 font-bold text-lg">
                                            Ksh {invoice.totalAmount}
                                        </p>
                                        <span className="text-[10px] text-gray-400 uppercase">
                                            {invoice.paymentType}
                                        </span>
                                    </div>
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
                    {filteredInvoices.length} invoices
                </div>
            )}
        </div>
    );
}

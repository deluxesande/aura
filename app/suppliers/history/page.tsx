"use client";

import Navbar from "@/components/Navbar";
import { apiClient } from "@/utils/apiClient";
import {
    Loader2,
    Search,
    ChevronLeft,
    ChevronRight,
    Plus,
    Lock,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { AppState } from "@/store";
import ReceiveStockModal from "@/components/modals/ReceiveStockModal";

export default function PurchaseHistoryPage() {
    const router = useRouter();
    const businessDetails = useSelector(
        (state: AppState) => state.businessData?.businessDetails,
    );

    const activeSub = Array.isArray(businessDetails?.subscription)
        ? businessDetails.subscription.find(
              (sub: any) =>
                  sub.status === "ACTIVE" || sub.status === "TRIALING",
          )
        : businessDetails?.subscription?.status === "ACTIVE" ||
            businessDetails?.subscription?.status === "TRIALING"
          ? businessDetails.subscription
          : null;
    const isPaidPlan = activeSub && activeSub.plan !== "STARTER";

    const [allReceipts, setAllReceipts] = useState<any[]>([]);
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showReceiveModal, setShowReceiveModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const fetchData = async () => {
        try {
            // Flatten stock receipts from suppliers endpoint (per previous structure)
            const res = await apiClient.get("/suppliers");
            const sups = res.data || [];
            setSuppliers(sups);

            const receipts = sups
                .flatMap((s: any) =>
                    (s.stockReceipts || []).map((r: any) => ({
                        ...r,
                        supplierName: s.name,
                    })),
                )
                .sort(
                    (a: any, b: any) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime(),
                );

            setAllReceipts(receipts);
        } catch (error: any) {
            if (error.response?.status !== 404) {
                toast.error("Failed to load purchase history");
            }
            setAllReceipts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (businessDetails) {
            if (isPaidPlan) {
                fetchData();
            } else {
                setLoading(false);
            }
        }
    }, [isPaidPlan, businessDetails]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const filteredReceipts = allReceipts.filter((r) => {
        const searchLower = searchQuery.toLowerCase();
        return (
            r.reference?.toLowerCase().includes(searchLower) ||
            r.Product?.name?.toLowerCase().includes(searchLower) ||
            r.supplierName?.toLowerCase().includes(searchLower) ||
            r.Store?.name?.toLowerCase().includes(searchLower)
        );
    });

    const totalPages = Math.ceil(filteredReceipts.length / itemsPerPage) || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedReceipts = filteredReceipts.slice(startIndex, endIndex);

    const handlePreviousPage = () =>
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    const handleNextPage = () =>
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    const handlePageClick = (page: number) => setCurrentPage(page);

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
        for (let i = startPage; i <= endPage; i++) pages.push(i);
        return pages;
    };

    if (!businessDetails || loading) {
        return (
            <Navbar>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                    </div>
                </div>
            </Navbar>
        );
    }

    if (!isPaidPlan) {
        return (
            <Navbar>
                <div className="p-4 md:p-8 mx-auto min-h-screen font-sans flex items-center justify-center">
                    <div className="bg-white shadow-lg rounded-xl p-10 border border-gray-100 max-w-md text-center">
                        <div className="w-16 h-16 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm">
                            <Lock className="w-8 h-8 text-gray-400" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">
                            Premium Feature
                        </h2>
                        <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                            Logging wholesale deliveries and tracking history
                            are exclusively available on our paid plans. Upgrade
                            your business to unlock these tools.
                        </p>
                        <button
                            onClick={() => router.push("/settings")}
                            className="w-full py-3 bg-gray-900 text-white font-bold text-sm rounded-lg hover:bg-gray-800 transition-colors shadow-md"
                        >
                            View Subscription Plans
                        </button>
                    </div>
                </div>
            </Navbar>
        );
    }

    return (
        <Navbar>
            <div className="p-4 md:p-8 mx-auto min-h-screen font-sans">
                <div className="bg-white shadow-lg rounded-lg p-4 border border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Delivery History
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                A complete log of all received stock and
                                supplies.
                            </p>
                        </div>
                        <button
                            onClick={() => setShowReceiveModal(true)}
                            className="flex items-center justify-center gap-2 bg-green-500 text-white px-4 py-2.5 rounded-lg hover:bg-green-600 transition-colors font-bold text-sm shadow-sm shadow-green-100"
                        >
                            <Plus className="w-4 h-4 stroke-white" />
                            Log Delivery
                        </button>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                        <div className="relative w-full md:w-96">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 stroke-green-500" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search by reference, product, or supplier..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-sm"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-gray-100">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        Date / Ref
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        Supplier
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        Product & Dest.
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        Qty Received
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        Total Value
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {paginatedReceipts.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-6 py-12 text-center text-sm text-gray-500"
                                        >
                                            No deliveries found.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedReceipts.map((receipt, index) => (
                                        <tr
                                            key={`history-row-${receipt?.id || index}`}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <p className="text-sm font-medium text-gray-500">
                                                    {new Date(
                                                        receipt.createdAt,
                                                    ).toLocaleDateString()}
                                                </p>
                                                <p className="text-xs font-bold text-gray-900 mt-0.5">
                                                    {receipt.reference ||
                                                        "NO-REF"}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <p className="text-sm font-bold text-gray-900">
                                                    {receipt.supplierName}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <p className="text-sm font-bold text-gray-900">
                                                    {receipt.Product?.name ||
                                                        "Unknown Product"}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    To:{" "}
                                                    {receipt.Store?.name ||
                                                        "Unknown Branch"}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <p className="text-sm font-black text-gray-900">
                                                    {receipt.quantity}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <span className="text-sm font-bold text-gray-900">
                                                    KSh{" "}
                                                    {(
                                                        receipt.totalCost || 0
                                                    ).toLocaleString()}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {paginatedReceipts.length > 0 && (
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
                </div>
            </div>

            {showReceiveModal && (
                <ReceiveStockModal
                    isOpen={showReceiveModal}
                    onClose={() => setShowReceiveModal(false)}
                    onSuccess={fetchData}
                    suppliers={suppliers}
                />
            )}
        </Navbar>
    );
}

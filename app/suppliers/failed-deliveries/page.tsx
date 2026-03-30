"use client";

import Navbar from "@/components/Navbar";
import { AppState } from "@/store";
import { apiClient } from "@/utils/apiClient";
import {
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    Lock,
    Search,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";

export default function FailedDeliveriesPage() {
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

    const [failedDeliveries, setFailedDeliveries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const fetchData = async () => {
        try {
            const res = await apiClient.get("/suppliers/failed-deliveries");
            setFailedDeliveries(res.data || []);
        } catch (error: any) {
            if (error.response?.status !== 404) {
                toast.error("Failed to load discrepancies");
            }
            setFailedDeliveries([]);
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

    const filteredDeliveries = failedDeliveries.filter((d) => {
        const searchLower = searchQuery.toLowerCase();
        return (
            d.reference?.toLowerCase().includes(searchLower) ||
            d.poReference?.toLowerCase().includes(searchLower) ||
            d.supplierName?.toLowerCase().includes(searchLower) ||
            d.storeName?.toLowerCase().includes(searchLower)
        );
    });

    const totalPages = Math.ceil(filteredDeliveries.length / itemsPerPage) || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedDeliveries = filteredDeliveries.slice(startIndex, endIndex);

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
                <div className="flex items-center justify-center min-h-[80vh]">
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
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm">
                            <Lock className="w-8 h-8 stroke-green-500" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">
                            Premium Feature
                        </h2>
                        <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                            Supplier Management and discrepancy tracking are
                            exclusively available on our paid plans. Upgrade
                            your business to unlock these tools.
                        </p>
                        <button
                            onClick={() => router.push("/settings")}
                            className="w-full py-3 bg-green-500 text-white font-bold text-sm rounded-lg hover:bg-green-600 transition-colors shadow-md"
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
                <button
                    onClick={() => router.back()}
                    className="w-10 h-10 items-center justify-center flex bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors mb-6"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div className="bg-white shadow-lg rounded-lg p-4 border border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Delivery Discrepancies
                                </h1>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                Highlighting orders where the received stock
                                doesn&apos;t match the purchase order.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                        <div className="relative w-full md:w-96">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 stroke-green-500" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search by reference, PO, or supplier..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-sm"
                            />
                        </div>
                        <div className="bg-orange-50 px-4 py-2.5 rounded-lg border border-orange-100 flex items-center gap-3 w-full md:w-auto justify-between shadow-sm">
                            <span className="text-sm text-orange-700 font-bold uppercase tracking-wider">
                                Total Discrepancies:
                            </span>
                            <span className="text-lg font-black text-orange-700">
                                {filteredDeliveries.length}
                            </span>
                        </div>
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-gray-100">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        Date / Reference
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        Linked Order
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        Supplier & Store
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        Major Discrepancies
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        Details
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {paginatedDeliveries.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-6 py-12 text-center text-sm text-gray-500"
                                        >
                                            No failed deliveries found.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedDeliveries.map(
                                        (delivery, index) => {
                                            const discrepancyCount =
                                                delivery.discrepancies.length;

                                            return (
                                                <tr
                                                    key={`failed-row-${delivery.id || index}`}
                                                    className="hover:bg-gray-50 transition-colors group cursor-pointer"
                                                    onClick={() =>
                                                        router.push(
                                                            `/suppliers/history/${delivery.id}`,
                                                        )
                                                    }
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <p className="text-sm font-medium text-gray-500">
                                                            {new Date(
                                                                delivery.createdAt,
                                                            ).toLocaleDateString()}
                                                        </p>
                                                        <p className="text-xs font-bold text-gray-900 mt-0.5">
                                                            {delivery.reference ||
                                                                "NO-REF"}
                                                        </p>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-100">
                                                            {
                                                                delivery.poReference
                                                            }
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <p className="text-sm font-bold text-gray-900">
                                                            {
                                                                delivery.supplierName
                                                            }
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-0.5">
                                                            To:{" "}
                                                            {delivery.storeName}
                                                        </p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col gap-1.5">
                                                            {delivery.discrepancies
                                                                .slice(0, 2)
                                                                .map(
                                                                    (
                                                                        disc: any,
                                                                        i: number,
                                                                    ) => (
                                                                        <div
                                                                            key={
                                                                                i
                                                                            }
                                                                            className="flex items-center gap-2"
                                                                        >
                                                                            <span
                                                                                className={`w-1.5 h-1.5 rounded-full ${disc.type === "MISSING" ? "bg-red-500" : "bg-orange-500"}`}
                                                                            />
                                                                            <p className="text-xs text-gray-600 line-clamp-1">
                                                                                <span className="font-bold">
                                                                                    {
                                                                                        disc.productName
                                                                                    }
                                                                                </span>

                                                                                :
                                                                                Exp:{" "}
                                                                                {
                                                                                    disc.expected
                                                                                }{" "}
                                                                                |
                                                                                Rec:{" "}
                                                                                {
                                                                                    disc.received
                                                                                }
                                                                            </p>
                                                                        </div>
                                                                    ),
                                                                )}
                                                            {discrepancyCount >
                                                                2 && (
                                                                <p className="text-[10px] font-bold text-gray-400 uppercase ml-3 tracking-widest">
                                                                    +{" "}
                                                                    {discrepancyCount -
                                                                        2}{" "}
                                                                    more issues
                                                                </p>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-bold text-green-600">
                                                        View Receipt
                                                    </td>
                                                </tr>
                                            );
                                        },
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>

                    {paginatedDeliveries.length > 0 && (
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
        </Navbar>
    );
}

"use client";

import { FinancialReportPDF } from "@/components/FinancialReportPDF";
import InfoCard from "@/components/InfoCard";
import InvoicesTable from "@/components/InvoicesTable";
import LineChart from "@/components/LineChart";
import Navbar from "@/components/Navbar";
import TopProductsChart from "@/components/TopProductsChart";
import { AppState } from "@/store";
import {
    setAnalyticsData,
    setAnalyticsError,
    setTimeRange,
    startFetching,
} from "@/store/slices/analyticsSlice";
import { setInvoices } from "@/store/slices/invoiceSlice";
import { pdf } from "@react-pdf/renderer";
import { apiClient } from "@/utils/apiClient";
import {
    AlertCircle,
    BadgeDollarSign,
    CheckCircle2,
    Download,
    FileText,
    HandCoins,
    Smartphone,
    X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

interface TopProduct {
    id: string;
    name: string;
    soldQuantity?: number;
    totalRevenue?: number;
    quantity?: number;
    price: number;
}

export default function Page() {
    const dispatch = useDispatch();

    const { user } = useSelector((state: AppState) => state.auth);
    const invoices = useSelector((state: AppState) => state.invoice.invoices);
    const {
        data: analyticsData,
        loading: analyticsLoading,
        timeRange,
    } = useSelector((state: AppState) => state.analytics);

    const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
    const [topProductsTimePeriod, setTopProductsTimePeriod] =
        useState<number>(7);
    const [topProductsLoading, setTopProductsLoading] = useState<boolean>(true);
    const [invoicesLoading, setInvoicesLoading] = useState<boolean>(
        invoices.length === 0,
    );

    // --- NEW: Report Modal State ---
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportPeriod, setReportPeriod] = useState("30");

    const userRole = user?.role || "user";
    const isAdminOrManager = userRole === "admin" || userRole === "manager";

    useEffect(() => {
        const fetchStats = async () => {
            dispatch(startFetching());

            try {
                const response = await apiClient.get("/analytics/stats", {
                    params: { timePeriod: timeRange },
                });

                dispatch(setAnalyticsData(response.data));
            } catch (error) {
                console.error("Failed to fetch stats");
                dispatch(setAnalyticsError("Failed to fetch dashboard stats"));
            }
        };

        fetchStats();
    }, [dispatch, timeRange]);

    useEffect(() => {
        const fetchInvoices = async () => {
            if (invoices.length === 0) setInvoicesLoading(true);

            try {
                const response = await apiClient.get("/invoice");
                dispatch(setInvoices(response.data));
            } catch (error) {
                // Handle error
            } finally {
                setInvoicesLoading(false);
            }
        };

        fetchInvoices();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch]);

    useEffect(() => {
        setTopProductsLoading(true);
        const fetchTopProducts = async () => {
            try {
                const response = await apiClient.get("/product/topProduct", {
                    params: { timePeriod: topProductsTimePeriod },
                });
                setTopProducts(
                    Array.isArray(response.data) ? response.data : [],
                );
            } catch (error) {
                setTopProducts([]);
            } finally {
                setTopProductsLoading(false);
            }
        };
        fetchTopProducts();
    }, [topProductsTimePeriod]);

    const [isGeneratingReport, setIsGeneratingReport] = useState(false);

    const handleDownloadReport = async () => {
        const periodText =
            reportPeriod === "all" ? "All Time" : `Last ${reportPeriod} Days`;

        setIsGeneratingReport(true);
        toast.loading(`Gathering data for ${periodText}...`, {
            id: "report-toast",
        });

        try {
            const response = await apiClient.get("/analytics/report", {
                params: { timePeriod: reportPeriod },
            });

            const blob = await pdf(
                <FinancialReportPDF
                    data={response.data}
                    periodLabel={periodText}
                />,
            ).toBlob();

            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            const safeLabel = periodText.replace(/[^a-zA-Z0-9]/g, "_");
            link.download = `Salesense_Report_${safeLabel}.pdf`;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast.success("Report downloaded successfully!", {
                id: "report-toast",
            });
            setIsReportModalOpen(false);
        } catch (error) {
            console.error("Failed to generate report", error);
            toast.error("Failed to generate report. Please try again.", {
                id: "report-toast",
            });
        } finally {
            setIsGeneratingReport(false);
        }
    };

    const handleTimeRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        dispatch(setTimeRange(e.target.value));
    };

    const handleOpenReportModal = () => {
        setIsReportModalOpen(true);
    };

    const stats = analyticsData?.stats;
    const percentageChanges = analyticsData?.percentageChanges;

    const infoCards = [
        {
            title: "Total Invoices",
            number: stats?.totalInvoices || 0,
            icon: FileText,
            percentageChange: percentageChanges?.totalInvoices || 0,
        },
        {
            title: "Total Revenue",
            number: `Ksh ${(stats?.totalRevenue || 0).toLocaleString()}`,
            icon: BadgeDollarSign,
            percentageChange: percentageChanges?.totalRevenue || 0,
        },
        {
            title: "Paid Invoices",
            number: stats?.paidInvoices || 0,
            icon: HandCoins,
            percentageChange: percentageChanges?.paidInvoices || 0,
        },
    ];

    return (
        <Navbar>
            <div
                className={`grid gap-4 my-4 ${
                    isAdminOrManager
                        ? "grid-cols-1 lg:grid-cols-3"
                        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
                }`}
            >
                <div
                    className={`grid gap-4 ${
                        isAdminOrManager
                            ? "lg:col-span-2 grid-cols-1 sm:grid-cols-2"
                            : "contents"
                    }`}
                >
                    {infoCards.map((card, index) => (
                        <InfoCard
                            key={index}
                            title={card.title}
                            number={card.number}
                            icon={card.icon}
                            percentageChange={card.percentageChange}
                        />
                    ))}

                    {/* Generate Reports Action Card */}
                    <div
                        onClick={handleOpenReportModal}
                        className="bg-white rounded-lg p-6 flex flex-col justify-center items-center shadow-sm border border-transparent hover:shadow-md hover:border-green-200 transition-all duration-200 cursor-pointer group h-full"
                    >
                        <div className="p-3 bg-green-50 rounded-full mb-3 group-hover:scale-110 transition-transform">
                            <Download className="stroke-green-500 w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-gray-700">
                            Generate Reports
                        </h3>
                        <p className="text-xs text-gray-400 mt-1">Export PDF</p>
                    </div>
                </div>

                {isAdminOrManager && (
                    <div className="lg:col-span-1 h-full">
                        <div className="bg-white rounded-lg p-6 h-full flex flex-col justify-between shadow-sm border border-transparent hover:shadow-md transition-all duration-200">
                            <div>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="font-light text-lg text-gray-400">
                                            Total M-Pesa Collections
                                        </p>
                                        <p className="font-bold text-3xl text-black mt-2">
                                            Ksh{" "}
                                            {(
                                                analyticsData?.mpesaBalance || 0
                                            ).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="p-2 bg-green-50 rounded-full">
                                        <Smartphone
                                            size={32}
                                            className="stroke-green-500"
                                        />
                                    </div>
                                </div>

                                <div className="mt-6 space-y-3">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle2
                                            size={18}
                                            className="stroke-green-500 mt-0.5 shrink-0"
                                        />
                                        <p className="text-sm text-gray-500">
                                            Total value of transactions
                                            processed successfully through the
                                            software.
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <AlertCircle
                                            size={18}
                                            className="stroke-orange-400 mt-0.5 shrink-0"
                                        />
                                        <p className="text-sm text-gray-500">
                                            Funds are settled directly to your
                                            Paybill/Till number by Safaricom in
                                            real-time.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Charts Section */}
            <div className="flex flex-wrap lg:flex-nowrap gap-4 my-4">
                <div className="px-6 py-4 h-fit rounded-lg gap-4 bg-white flex-1 w-full md:w-[40%]">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold text-gray-400">
                            Monthly Sales
                        </h1>
                        <select
                            className="select select-sm outline-none bg-green-50 appearance-none rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 disabled:opacity-50 text-green-500"
                            value={timeRange}
                            onChange={handleTimeRangeChange}
                        >
                            <option value="7">Last 7 days</option>
                            <option value="30">Last 30 days</option>
                            <option value="90">Last 90 days</option>
                            <option value="365">Last 1 year</option>
                        </select>
                    </div>
                    <LineChart timePeriod={Number(timeRange)} />
                </div>

                <div className="px-6 py-4 rounded-lg gap-4 bg-white w-full lg:w-[48%] relative">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold text-gray-400">
                            Top Products
                        </h1>
                        <select
                            className="select select-sm outline-none bg-green-50 appearance-none rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 disabled:opacity-50 text-green-500"
                            value={topProductsTimePeriod}
                            onChange={(e) =>
                                setTopProductsTimePeriod(Number(e.target.value))
                            }
                        >
                            <option value="7">Last 7 days</option>
                            <option value="30">Last 30 days</option>
                            <option value="90">Last 90 days</option>
                            <option value="365">Last 1 year</option>
                        </select>
                    </div>

                    {topProductsLoading ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                        </div>
                    ) : (
                        <TopProductsChart
                            products={topProducts}
                            timePeriod={topProductsTimePeriod}
                        />
                    )}
                </div>
            </div>

            <InvoicesTable
                title="Recent Invoices"
                invoices={invoices}
                handleDelete={() => {}}
                loading={invoicesLoading}
                itemsPerPage={5}
            />

            {/* Report Generation Modal */}
            {isReportModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                Export Data Report
                            </h2>
                            <button
                                onClick={() => setIsReportModalOpen(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Select Time Period
                                </label>
                                <select
                                    value={reportPeriod}
                                    onChange={(e) =>
                                        setReportPeriod(e.target.value)
                                    }
                                    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg outline-none focus:border-green-400 focus:ring-4 focus:ring-green-500/10 transition-all bg-gray-50 hover:bg-gray-100/50 cursor-pointer"
                                >
                                    <option value="7">Last 7 Days</option>
                                    <option value="30">Last 30 Days</option>
                                    <option value="90">Last 90 Days</option>
                                    <option value="180">Last 6 Months</option>
                                    <option value="365">Last 1 Year</option>
                                    <option value="all">
                                        All Time (Complete History)
                                    </option>
                                </select>
                            </div>

                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex gap-3">
                                <p className="text-xs text-blue-700 leading-relaxed">
                                    This report will include full transaction
                                    details, top-selling products, and revenue
                                    breakdowns for the selected period. It will
                                    be downloaded as a PDF file.
                                </p>
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                            <button
                                onClick={() => setIsReportModalOpen(false)}
                                className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDownloadReport}
                                className="px-5 py-2.5 text-sm font-bold text-white bg-green-500 rounded-lg hover:bg-green-600 flex items-center gap-2 shadow-lg shadow-green-500/20 transition-all active:scale-95"
                            >
                                Download
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Navbar>
    );
}

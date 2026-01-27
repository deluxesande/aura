"use client";

import Navbar from "@/components/Navbar";
import { AppState } from "@/store";
import { Invoice } from "@/utils/typesDefinitions";
import axios from "axios";
import { format, isSameMonth, parseISO, subMonths } from "date-fns";
import {
    AlertCircle,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Download,
    Loader2,
    Lock,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import useSWR from "swr";

interface TaxFiling {
    id: string;
    period: string;
    filingDate: string;
    totalSales: number;
    taxAmount: number;
    status: "Submitted" | "Processing" | "Failed";
    referenceNumber?: string;
}

interface KraDetails {
    kraPin: string;
    taxpayerName: string;
    taxpayerType: string;
    pinStatus: string;
    isAutoFilingEnabled: boolean;
}

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

const TaxReturnsPage = () => {
    const [selectedMonth, setSelectedMonth] = useState<Date>(
        subMonths(new Date(), 1),
    );

    const businessDetails = useSelector(
        (state: AppState) => state.businessData.businessDetails,
    );
    const plan = businessDetails?.subscription?.plan || "STARTER";
    const isStarter = plan === "STARTER";

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const [filingMode, setFilingMode] = useState<"MANUAL" | "AUTO">("MANUAL");
    const [isSavingSettings, setIsSavingSettings] = useState(false); // <--- 2. ADDED LOADING STATE
    const [calculationMode, setCalculationMode] = useState<"INVOICE" | "FIXED">(
        "INVOICE",
    );
    const [manualSalesInput, setManualSalesInput] = useState<string>("");
    const [isFiling, setIsFiling] = useState(false);

    const {
        data: kraDetails,
        isLoading: isLoadingKra,
        mutate,
    } = useSWR<KraDetails>("/api/kra", fetcher);

    const { data: invoices, isLoading: isLoadingInvoices } = useSWR<Invoice[]>(
        "/api/invoice",
        fetcher,
    );

    const { data: filingHistory = [], isLoading: isLoadingHistory } = useSWR<
        TaxFiling[]
    >("/api/kra/returns", fetcher);

    useEffect(() => {
        if (isStarter) {
            setFilingMode("AUTO");
        } else if (kraDetails) {
            setFilingMode(kraDetails.isAutoFilingEnabled ? "AUTO" : "MANUAL");
        }
    }, [isStarter, kraDetails]);

    const toggleFilingMode = async (mode: "MANUAL" | "AUTO") => {
        if (isStarter) return;
        if (mode === filingMode) return;

        setFilingMode(mode);
        setIsSavingSettings(true);

        try {
            await axios.patch("/api/kra/update", {
                isAutoFilingEnabled: mode === "AUTO",
            });
            toast.success(`Filing mode updated to ${mode}`);
            mutate();
        } catch (error) {
            toast.error("Failed to save preference");
            setFilingMode(mode === "AUTO" ? "MANUAL" : "AUTO");
        } finally {
            setIsSavingSettings(false);
        }
    };

    const totalPages = Math.ceil((filingHistory?.length || 0) / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedHistory = filingHistory.slice(startIndex, endIndex);

    const handlePreviousPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };
    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };
    const handlePageClick = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };
    const getPageNumbers = () => {
        const pages = [];
        for (let i = 1; i <= totalPages; i++) pages.push(i);
        return pages;
    };

    const calculatedTotalSales = useMemo(() => {
        if (!invoices || !Array.isArray(invoices)) return 0;
        const monthlyInvoices = invoices.filter((inv) => {
            const dateString = inv.createdAt || (inv as any).date;
            if (!dateString) return false;
            const invoiceDate = parseISO(String(dateString));
            const isCorrectMonth = isSameMonth(invoiceDate, selectedMonth);
            const status = (inv.status || "").toUpperCase();
            return (
                isCorrectMonth && (status === "PAID" || status === "COMPLETED")
            );
        });
        return monthlyInvoices.reduce(
            (sum, inv) =>
                sum +
                (Number(inv.totalAmount) || Number((inv as any).amount) || 0),
            0,
        );
    }, [invoices, selectedMonth]);

    const effectiveTotalSales =
        calculationMode === "FIXED"
            ? parseFloat(manualSalesInput) || 0
            : calculatedTotalSales;

    const handleFileReturn = async () => {
        if (isStarter && filingMode === "MANUAL") {
            toast.error("Manual filing is reserved for Premium plans.");
            return;
        }
        if (!kraDetails?.kraPin) {
            toast.error("Please validate your KRA PIN in settings first.");
            return;
        }
        setIsFiling(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 2000));
            toast.success(
                `Successfully filed TOT for ${format(selectedMonth, "MMMM yyyy")}`,
            );
        } catch (error) {
            toast.error("Failed to submit tax return. Try again.");
        } finally {
            setIsFiling(false);
        }
    };

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case "Submitted":
                return "bg-green-100 text-green-800";
            case "Processing":
                return "bg-blue-100 text-blue-800";
            case "Failed":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <Navbar>
            <div className="min-h-screen bg-gray-50/50 p-6">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                Tax Returns (TOT)
                            </h1>
                            <p className="text-gray-500 text-sm mt-1">
                                Monthly Turnover Tax Filing
                            </p>
                        </div>

                        {/* KRA Status Badge */}
                        <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 flex items-center gap-3 shadow-sm">
                            {isLoadingKra ? (
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                            ) : kraDetails ? (
                                <>
                                    <CheckCircle2 className="w-5 h-5 stroke-green-600" />
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                                            KRA PIN
                                        </p>
                                        <p className="font-mono font-medium text-sm text-gray-900">
                                            {kraDetails.kraPin}
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <AlertCircle className="w-4 h-4 stroke-red-500" />
                                    <p className="text-sm text-red-500 font-medium">
                                        PIN Not Set
                                    </p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* CARD 1: NEW FILING */}
                    <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                New Return
                            </h2>

                            <div className="flex items-center bg-gray-100 rounded-lg p-1 relative">
                                {isSavingSettings && (
                                    <div className="absolute inset-0 bg-white/50 z-10 rounded-lg flex items-center justify-center">
                                        <Loader2 className="w-3 h-3 animate-spin text-green-600" />
                                    </div>
                                )}
                                <button
                                    onClick={() => toggleFilingMode("MANUAL")}
                                    disabled={isStarter}
                                    title={
                                        isStarter
                                            ? "Available on Premium Plans"
                                            : "Manual Filing"
                                    }
                                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${
                                        filingMode === "MANUAL"
                                            ? "bg-white text-gray-900 shadow-sm"
                                            : "text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    }`}
                                >
                                    {isStarter && <Lock className="w-3 h-3" />}
                                    Manual
                                </button>
                                <button
                                    onClick={() => toggleFilingMode("AUTO")}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                                        filingMode === "AUTO"
                                            ? "bg-white text-green-600 shadow-sm"
                                            : "text-gray-500 hover:text-gray-700"
                                    }`}
                                >
                                    Auto-File
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Date & Source Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1.5 uppercase">
                                        Tax Period
                                    </label>
                                    <input
                                        type="month"
                                        value={format(selectedMonth, "yyyy-MM")}
                                        onClick={(e) => {
                                            try {
                                                e.currentTarget.showPicker();
                                            } catch (error) {}
                                        }}
                                        onChange={(e) =>
                                            setSelectedMonth(
                                                new Date(e.target.value),
                                            )
                                        }
                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm cursor-pointer"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1.5 uppercase">
                                        Data Source
                                    </label>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() =>
                                                setCalculationMode("INVOICE")
                                            }
                                            className={`flex-1 border rounded-lg py-2 px-3 flex items-center justify-center gap-2 text-sm transition-all ${
                                                calculationMode === "INVOICE"
                                                    ? "border-green-500 bg-green-50 text-green-700 font-medium"
                                                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                                            }`}
                                        >
                                            Auto-Sum
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (!isStarter)
                                                    setCalculationMode("FIXED");
                                            }}
                                            disabled={isStarter}
                                            className={`flex-1 border rounded-lg py-2 px-3 flex items-center justify-center gap-2 text-sm transition-all ${
                                                calculationMode === "FIXED"
                                                    ? "border-green-500 bg-green-50 text-green-700 font-medium"
                                                    : "border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:bg-gray-50 disabled:cursor-not-allowed"
                                            }`}
                                        >
                                            {isStarter && (
                                                <Lock className="w-3 h-3" />
                                            )}
                                            Manual Input
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Total Sales Input */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5 uppercase">
                                    Total Gross Sales (Ksh)
                                </label>
                                {calculationMode === "FIXED" ? (
                                    <input
                                        type="number"
                                        value={manualSalesInput}
                                        onChange={(e) =>
                                            setManualSalesInput(e.target.value)
                                        }
                                        placeholder="e.g. 500000"
                                        className="w-full bg-slate-50 px-4 py-3 border border-gray-300 rounded-lg  focus:ring-2 focus:ring-green-500 outline-none text-lg font-medium no-spinner"
                                    />
                                ) : (
                                    <div className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-lg text-gray-600 flex justify-between items-center">
                                        <span className="text-lg font-medium">
                                            {isLoadingInvoices
                                                ? "Calculating..."
                                                : effectiveTotalSales.toLocaleString()}
                                        </span>
                                        <span className="text-[10px] uppercase bg-gray-200 px-2 py-1 rounded font-bold text-gray-500">
                                            System Calculated
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Calculation & Action Footer */}
                            <div className="pt-4 mt-2 w-full border-t border-dashed border-gray-200">
                                <div className="flex w-full flex-col sm:flex-row items-center justify-between gap-6">
                                    <button
                                        onClick={handleFileReturn}
                                        disabled={
                                            isFiling ||
                                            effectiveTotalSales <= 0 ||
                                            (isStarter &&
                                                filingMode === "MANUAL")
                                        }
                                        className="w-full bg-green-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2 transition-all shadow-md shadow-green-100"
                                    >
                                        {isFiling ? (
                                            <>
                                                <Loader2 className="w-4 h-4 stroke-white animate-spin" />
                                                Submitting...
                                            </>
                                        ) : (
                                            <>File Return</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* CARD 2: HISTORY */}
                    <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                Filing History
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Period
                                        </th>
                                        <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Reference No.
                                        </th>
                                        <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Date Filed
                                        </th>
                                        <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Total Sales
                                        </th>
                                        <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Tax Paid
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
                                    {isLoadingHistory ? (
                                        <tr>
                                            <td colSpan={7} className="py-8">
                                                <div className="flex justify-center">
                                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : paginatedHistory &&
                                      paginatedHistory.length > 0 ? (
                                        paginatedHistory.map((filing) => (
                                            <tr
                                                key={filing.id}
                                                className="hover:bg-gray-50 transition-colors"
                                            >
                                                <td className="py-3 px-4 border-b border-gray-100 text-sm font-medium text-gray-900">
                                                    {filing.period}
                                                </td>
                                                <td className="py-3 px-4 border-b border-gray-100 text-sm text-gray-500 font-mono">
                                                    {filing.referenceNumber}
                                                </td>
                                                <td className="py-3 px-4 border-b border-gray-100 text-sm text-gray-500">
                                                    {new Date(
                                                        filing.filingDate,
                                                    ).toLocaleDateString()}
                                                </td>
                                                <td className="py-3 px-4 border-b border-gray-100 text-sm text-gray-900">
                                                    Ksh{" "}
                                                    {filing.totalSales.toLocaleString()}
                                                </td>
                                                <td className="py-3 px-4 border-b border-gray-100 text-sm font-medium text-green-600">
                                                    Ksh{" "}
                                                    {filing.taxAmount.toLocaleString()}
                                                </td>
                                                <td className="py-3 px-4 border-b border-gray-100">
                                                    <span
                                                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(filing.status)}`}
                                                    >
                                                        {filing.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 border-b border-gray-100">
                                                    <button className="text-gray-400 hover:text-green-600 transition-colors">
                                                        <Download className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="py-12 text-center"
                                            >
                                                <div className="flex flex-col items-center justify-center text-gray-400">
                                                    <div className="w-10 h-10 mb-2 rounded-full bg-green-50 flex items-center justify-center">
                                                        <AlertCircle className=" stroke-green-500" />
                                                    </div>
                                                    <p className="text-sm font-medium">
                                                        No tax returns filed yet
                                                    </p>
                                                    <p className="text-xs mt-1 opacity-70">
                                                        Completed filings will
                                                        appear here
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Footer */}
                        {!isLoadingHistory && filingHistory.length > 0 && (
                            <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="text-sm text-gray-500">
                                    Page {currentPage} of {totalPages} | Showing{" "}
                                    {startIndex + 1}-
                                    {Math.min(endIndex, filingHistory.length)}{" "}
                                    of {filingHistory.length} returns
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        className="btn btn-xs btn-ghost flex items-center bg-green-400 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-600 px-3 py-1.5 rounded-md"
                                        onClick={handlePreviousPage}
                                        disabled={currentPage === 1}
                                    >
                                        <ChevronLeft className="w-4 h-4 stroke-white mr-1" />{" "}
                                        Back
                                    </button>
                                    <div className="flex gap-1">
                                        {getPageNumbers().map((page) => (
                                            <button
                                                key={page}
                                                onClick={() =>
                                                    handlePageClick(page)
                                                }
                                                className={`w-6 h-6 flex items-center justify-center rounded text-xs font-medium transition-colors ${currentPage === page ? "bg-green-500 text-white" : "text-gray-600 hover:bg-gray-100"}`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        className="btn btn-xs btn-ghost flex items-center bg-green-400 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-600 px-3 py-1.5 rounded-md"
                                        onClick={handleNextPage}
                                        disabled={currentPage === totalPages}
                                    >
                                        Next{" "}
                                        <ChevronRight className="w-4 h-4 stroke-white ml-1" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </Navbar>
    );
};

export default TaxReturnsPage;

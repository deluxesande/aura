"use client";

import Navbar from "@/components/Navbar";
import { Invoice } from "@/utils/typesDefinitions";
import axios from "axios";
import { format, isSameMonth, parseISO, subMonths } from "date-fns";
import { AlertCircle, CheckCircle2, Download, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
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
}

const MOCK_FILING_HISTORY: TaxFiling[] = [
    {
        id: "TAX-001",
        period: "December 2025",
        filingDate: "2026-01-15T10:00:00Z",
        totalSales: 450000,
        taxAmount: 13500,
        status: "Submitted",
        referenceNumber: "KRA20260012345",
    },
    {
        id: "TAX-002",
        period: "November 2025",
        filingDate: "2025-12-18T14:30:00Z",
        totalSales: 380000,
        taxAmount: 11400,
        status: "Submitted",
        referenceNumber: "KRA20250098765",
    },
];

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

const TaxReturnsPage = () => {
    // Default to LAST month (standard filing practice)
    // If testing with new data, change this to: new Date()
    const [selectedMonth, setSelectedMonth] = useState<Date>(
        subMonths(new Date(), 1),
    );

    const [filingMode, setFilingMode] = useState<"MANUAL" | "AUTO">("MANUAL");
    const [calculationMode, setCalculationMode] = useState<"INVOICE" | "FIXED">(
        "INVOICE",
    );
    const [manualSalesInput, setManualSalesInput] = useState<string>("");
    const [isFiling, setIsFiling] = useState(false);

    const { data: kraDetails, isLoading: isLoadingKra } = useSWR<KraDetails>(
        "/api/kra",
        fetcher,
    );

    const { data: invoices, isLoading: isLoadingInvoices } = useSWR<Invoice[]>(
        "/api/invoice",
        fetcher,
    );

    // Filter and Sum Invoices for the Selected Month
    const calculatedTotalSales = useMemo(() => {
        if (!invoices || !Array.isArray(invoices)) return 0;

        const monthlyInvoices = invoices.filter((inv) => {
            // Robust date parsing
            const dateString = inv.createdAt || (inv as any).date;
            if (!dateString) return false;

            const invoiceDate = parseISO(String(dateString));
            const isCorrectMonth = isSameMonth(invoiceDate, selectedMonth);

            // Robust status check (case insensitive)
            const status = (inv.status || "").toUpperCase();
            const isPaid = status === "PAID" || status === "COMPLETED";

            return isCorrectMonth && isPaid;
        });

        // FIX: Ensure we coerce values to Number() to prevent string concatenation
        // Also checks for both 'totalAmount' and 'amount' depending on API shape
        return monthlyInvoices.reduce((sum, inv) => {
            const amount =
                Number(inv.totalAmount) || Number((inv as any).amount) || 0;
            return sum + amount;
        }, 0);
    }, [invoices, selectedMonth]);

    const effectiveTotalSales =
        calculationMode === "FIXED"
            ? parseFloat(manualSalesInput) || 0
            : calculatedTotalSales;

    const taxRate = 0.03;
    const taxPayable = effectiveTotalSales * taxRate;

    const handleFileReturn = async () => {
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
                                Monthly Turnover Tax (3%) Filing
                            </p>
                        </div>

                        {/* KRA Status Badge */}
                        <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 flex items-center gap-3 shadow-sm">
                            {isLoadingKra ? (
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                            ) : kraDetails ? (
                                <>
                                    <CheckCircle2 className="w-5 h-5 text-green-600" />
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
                                    <AlertCircle className="w-5 h-5 text-red-500" />
                                    <p className="text-sm text-red-600 font-medium">
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
                            {/* Mode Toggle */}
                            <div className="flex items-center bg-gray-100 rounded-lg p-1">
                                <button
                                    onClick={() => setFilingMode("MANUAL")}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                                        filingMode === "MANUAL"
                                            ? "bg-white text-gray-900 shadow-sm"
                                            : "text-gray-500 hover:text-gray-700"
                                    }`}
                                >
                                    Manual
                                </button>
                                <button
                                    onClick={() => setFilingMode("AUTO")}
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
                                        onChange={(e) =>
                                            setSelectedMonth(
                                                new Date(e.target.value),
                                            )
                                        }
                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm"
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
                                            onClick={() =>
                                                setCalculationMode("FIXED")
                                            }
                                            className={`flex-1 border rounded-lg py-2 px-3 flex items-center justify-center gap-2 text-sm transition-all ${
                                                calculationMode === "FIXED"
                                                    ? "border-green-500 bg-green-50 text-green-700 font-medium"
                                                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                                            }`}
                                        >
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
                            <div className="pt-4 mt-2 border-t border-dashed border-gray-200">
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                                    <div className="flex flex-col">
                                        <span className="text-sm text-gray-500">
                                            Tax Payable (3% Rate)
                                        </span>
                                        <span className="text-3xl font-bold text-green-600">
                                            Ksh {taxPayable.toLocaleString()}
                                        </span>
                                    </div>

                                    <button
                                        onClick={handleFileReturn}
                                        disabled={
                                            isFiling || effectiveTotalSales <= 0
                                        }
                                        className="w-full sm:w-auto bg-green-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-all shadow-md shadow-green-100"
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
                                    {MOCK_FILING_HISTORY.map((filing) => (
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
                                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                                                        filing.status,
                                                    )}`}
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
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </div>
        </Navbar>
    );
};

export default TaxReturnsPage;

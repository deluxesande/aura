"use client";
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { AppState } from "@/store";
import {
    ArrowUpCircle,
    CheckCircle2,
    Zap,
    Calendar,
    RefreshCcw,
    X,
    Loader2,
    Phone,
    UserPlus,
    ChevronLeft,
    ChevronRight,
    FileX,
    Receipt,
} from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type BillingHistoryItem = {
    id: string;
    plan: string;
    status: string;
    amount: number;
    receiptNumber: string;
    paymentDate: string;
};

const SubscriptionManagement: React.FC = () => {
    const router = useRouter();
    const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState("");

    const [history, setHistory] = useState<BillingHistoryItem[]>([]);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const businessDetails = useSelector(
        (state: AppState) => state.businessData.businessDetails
    );

    useEffect(() => {
        const fetchHistory = async () => {
            if (!businessDetails?.id) return;
            try {
                const res = await axios.get("/api/subscription/history");
                setHistory(res.data);
            } catch (error) {
                console.error("Failed to fetch billing history");
            } finally {
                setHistoryLoading(false);
            }
        };
        fetchHistory();
    }, [businessDetails?.id]);

    if (!businessDetails) return null;

    const { subscription, usage } = businessDetails;
    const plan = subscription?.plan || "STARTER";

    const calculateDaysLeft = () => {
        if (!subscription?.currentPeriodEnd) return 0;
        const end = new Date(subscription.currentPeriodEnd);
        const today = new Date();
        const diff = end.getTime() - today.getTime();
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    };

    const daysLeft = calculateDaysLeft();

    const showUpgradeActions =
        plan === "STARTER" || daysLeft <= 5 || usage.isLimitReached;

    const txRemaining =
        plan === "STARTER"
            ? Math.max(0, 100 - usage.transactionCount)
            : "Unlimited";

    const teamLimit =
        plan === "STARTER" ? 1 : plan === "STANDARD" ? 5 : Infinity;
    const invitesRemaining =
        teamLimit === Infinity
            ? "Unlimited"
            : Math.max(0, teamLimit - usage.staffCount);

    const handleRenewSub = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const amount = plan === "STANDARD" ? 1000 : 1500;
            const res = await axios.post("/api/subscription/stk-push", {
                phoneNumber,
                amount,
                planId: plan,
            });

            if (res.data.data.CheckoutRequestID) {
                toast.success("STK Push sent! Redirecting...");
                router.push(
                    `/payment/checking?id=${res.data.data.CheckoutRequestID}`
                );
            }
        } catch (error: any) {
            toast.error(
                error.response?.data?.error || "Failed to initiate renewal"
            );
        } finally {
            setLoading(false);
        }
    };

    const totalPages = Math.ceil(history.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedHistory = history.slice(startIndex, endIndex);

    const handlePreviousPage = () => {
        if (currentPage > 1) setCurrentPage((prev) => prev - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
    };

    const handlePageClick = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const getPageNumbers = () => {
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            pages.push(i);
        }
        return pages;
    };

    return (
        <div className="bg-white p-4 sm:p-8 shadow sm:rounded-lg border border-gray-100">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                        Subscription Plan
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                        Manage your billing and view usage limits.
                    </p>
                </div>
                <div className="px-3 py-1 bg-green-50 text-green-500 rounded-full text-xs font-bold uppercase tracking-wider border border-green-100">
                    {plan}
                </div>
            </div>

            <div className="space-y-8">
                {/* Usage Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Days Left Card */}
                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                Days Remaining
                            </p>
                            <p
                                className={`text-xl font-bold mt-1 ${
                                    plan !== "STARTER" && daysLeft <= 5
                                        ? "text-red-600"
                                        : "text-gray-900"
                                }`}
                            >
                                {plan === "STARTER" ? "FREE" : daysLeft}
                            </p>
                        </div>
                        <div
                            className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                plan !== "STARTER" && daysLeft <= 5
                                    ? "bg-red-100"
                                    : "bg-green-100"
                            }`}
                        >
                            <Calendar
                                className={`w-5 h-5 ${
                                    plan !== "STARTER" && daysLeft <= 5
                                        ? "stroke-red-500"
                                        : "stroke-green-500"
                                }`}
                            />
                        </div>
                    </div>

                    {/* Allowance Left Card */}
                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                Allowance Left
                            </p>
                            <p className="text-xl font-bold text-gray-900 mt-1">
                                {txRemaining}
                            </p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                            <Zap className="w-5 h-5 stroke-green-500" />
                        </div>
                    </div>

                    {/* Team Invites Card */}
                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                Team Invites
                            </p>
                            <p className="text-xl font-bold text-gray-900 mt-1">
                                {invitesRemaining}
                            </p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                            <UserPlus className="w-5 h-5 stroke-green-500" />
                        </div>
                    </div>

                    {/* Billing Status Card */}
                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                Billing Status
                            </p>
                            <p
                                className={`text-xl font-bold mt-1 ${
                                    subscription?.status === "ACTIVE"
                                        ? "text-green-600"
                                        : "text-orange-600"
                                }`}
                            >
                                {subscription?.status || "ACTIVE"}
                            </p>
                        </div>
                        <div
                            className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                subscription?.status === "ACTIVE"
                                    ? "bg-green-100"
                                    : "bg-orange-100"
                            }`}
                        >
                            <CheckCircle2
                                className={`w-5 h-5 ${
                                    subscription?.status === "ACTIVE"
                                        ? "stroke-green-500"
                                        : "stroke-orange-500"
                                }`}
                            />
                        </div>
                    </div>
                </div>

                {/* Progress Bar (Visible only for Starter) */}
                {plan === "STARTER" && (
                    <div>
                        <div className="flex justify-between items-end mb-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-tighter">
                                Monthly Progress
                            </label>
                            <span className="text-xs font-bold text-gray-900">
                                {usage.transactionCount} / 100
                            </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div
                                style={{
                                    width: `${Math.min(
                                        (usage.transactionCount / 100) * 100,
                                        100
                                    )}%`,
                                }}
                                className={`h-full rounded-full transition-all duration-500 ease-out ${
                                    usage.isLimitReached
                                        ? "bg-red-500"
                                        : "bg-green-500"
                                }`}
                            />
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                {showUpgradeActions && (
                    <div className="pt-6 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {plan !== "STARTER" ? (
                            <button
                                onClick={() => setIsRenewModalOpen(true)}
                                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 transition-all shadow-sm w-full"
                            >
                                <RefreshCcw size={18} />
                                Renew Current Plan
                            </button>
                        ) : (
                            <div className="hidden sm:block" />
                        )}

                        <Link
                            href="/payment"
                            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-green-500 text-white text-sm font-bold rounded-xl hover:bg-green-700 transition-all shadow-md shadow-green-100 w-full text-center"
                        >
                            <ArrowUpCircle size={18} className="stroke-white" />
                            Upgrade Plan
                        </Link>
                    </div>
                )}
            </div>

            <div className="mt-12 pt-8 border-t border-gray-100">
                <p className="mb-4 text-sm text-gray-600">
                    View your billing history.
                </p>

                <div className="overflow-x-auto rounded-lg border border-gray-100">
                    <table className="min-w-full bg-white hidden md:table">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Plan
                                </th>
                                <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Reference
                                </th>
                                <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {historyLoading ? (
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
                            ) : paginatedHistory.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="py-16 text-center"
                                    >
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="bg-green-100 border border-gray-100 rounded-full p-4 mb-3">
                                                <FileX className="h-6 w-6 stroke-green-500" />
                                            </div>
                                            <h3 className="text-gray-900 font-medium text-sm">
                                                No Billing History
                                            </h3>
                                            <p className="text-gray-500 text-xs mt-1 max-w-xs mx-auto">
                                                You haven&apos;t made any
                                                payments yet.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedHistory.map((item, index) => (
                                    <tr
                                        key={index}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="py-3 px-4 border-b text-black text-sm border-gray-100">
                                            {new Date(
                                                item.paymentDate
                                            ).toLocaleDateString()}
                                        </td>
                                        <td className="py-3 px-4 border-b text-black text-sm border-gray-100 font-medium">
                                            {item.plan}
                                        </td>
                                        <td className="py-3 px-4 border-b text-black text-sm border-gray-100">
                                            KSh {item.amount.toLocaleString()}
                                        </td>
                                        <td className="py-3 px-4 border-b text-gray-500 text-xs border-gray-100">
                                            {item.receiptNumber !== "N/A"
                                                ? item.receiptNumber
                                                : "-"}
                                        </td>
                                        <td className="py-3 px-4 border-b text-black text-xs border-gray-100">
                                            <span
                                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                                    item.status === "ACTIVE"
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-gray-100 text-gray-500"
                                                }`}
                                            >
                                                {item.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    {/* Mobile View for Billing History */}
                    <div className="md:hidden space-y-4 p-4">
                        {historyLoading ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                            </div>
                        ) : paginatedHistory.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="bg-green-100 border border-gray-100 rounded-full p-4 mb-3 inline-block">
                                    <FileX className="h-6 w-6 stroke-green-500" />
                                </div>
                                <h3 className="text-gray-900 font-medium text-sm">
                                    No Billing History
                                </h3>
                            </div>
                        ) : (
                            paginatedHistory.map((item, index) => (
                                <div
                                    key={index}
                                    className="bg-gray-50 rounded-lg p-4 border border-gray-100 flex flex-col gap-2"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-gray-900">
                                                {item.plan}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(
                                                    item.paymentDate
                                                ).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-bold ${
                                                item.status === "ACTIVE"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-gray-200 text-gray-500"
                                            }`}
                                        >
                                            {item.status}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center border-t border-gray-200 pt-2 mt-1">
                                        <span className="text-sm text-gray-600 flex items-center gap-1">
                                            {item.receiptNumber !== "N/A"
                                                ? item.receiptNumber
                                                : "No Receipt"}
                                        </span>
                                        <span className="font-bold text-gray-900">
                                            KSh {item.amount.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Pagination */}
                {!historyLoading && paginatedHistory.length > 0 && (
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

            {/* Renewal Modal */}
            {isRenewModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-lg p-8 w-full max-w-md shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                                Renew Plan
                            </h3>
                            <button
                                onClick={() => setIsRenewModalOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X size={24} className="text-gray-400" />
                            </button>
                        </div>

                        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                            You are about to renew your <strong>{plan}</strong>{" "}
                            subscription. Please confirm your phone number
                            below.
                        </p>

                        <form onSubmit={handleRenewSub} className="space-y-6">
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                                    M-Pesa Number
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Phone
                                            size={18}
                                            className="h-5 w-5 stroke-green-500"
                                        />
                                    </div>
                                    <input
                                        type="tel"
                                        required
                                        placeholder="07XXXXXXXX"
                                        value={phoneNumber}
                                        onChange={(e) =>
                                            setPhoneNumber(e.target.value)
                                        }
                                        className="block w-full pl-10 pr-3 py-3 bg-slate-50 outline-none border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition-colors"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 px-4 bg-green-600 text-white font-black rounded-2xl hover:bg-green-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-lg shadow-green-200"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin" />
                                ) : (
                                    "Request STK Push"
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubscriptionManagement;

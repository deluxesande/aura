"use client";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { AppState } from "@/store";
import {
    CreditCard,
    ArrowUpCircle,
    CheckCircle2,
    Zap,
    Calendar,
    RefreshCcw,
    X,
    Loader2,
    Phone,
    UserPlus,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const SubscriptionManagement: React.FC = () => {
    const router = useRouter();
    const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState("");

    const businessDetails = useSelector(
        (state: AppState) => state.businessData.businessDetails
    );

    if (!businessDetails) return null;

    const { subscription, usage } = businessDetails;
    const plan = subscription?.plan || "STARTER";

    // --- Logic Calculations ---
    const calculateDaysLeft = () => {
        if (!subscription?.currentPeriodEnd) return 0;
        const end = new Date(subscription.currentPeriodEnd);
        const today = new Date();
        const diff = end.getTime() - today.getTime();
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    };

    const daysLeft = calculateDaysLeft();

    // UPDATED LOGIC: Always show actions for STARTER, or if PAID plan is expiring/limit hit
    const showUpgradeActions =
        plan === "STARTER" || daysLeft <= 5 || usage.isLimitReached;

    const txLimit = plan === "STARTER" ? 100 : Infinity;
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
                <div className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider border border-green-100">
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
                                className={`text-2xl font-bold mt-1 ${
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
                            <p className="text-2xl font-bold text-gray-900 mt-1">
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
                            <p className="text-2xl font-bold text-gray-900 mt-1">
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
                        <div className="w-full bg-gray-100 rounded-full h-2">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{
                                    width: `${Math.min(
                                        (usage.transactionCount / 100) * 100,
                                        100
                                    )}%`,
                                }}
                                className={`h-2 rounded-full ${
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
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="pt-6 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4"
                    >
                        {/* HIDE RENEW MODAL FOR STARTER: Only show for Standard/Premium */}
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

                        {/* ALWAYS SHOW UPGRADE LINK */}
                        <Link
                            href="/payment"
                            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-green-500 text-white text-sm font-bold rounded-xl hover:bg-green-700 transition-all shadow-md shadow-green-100 w-full text-center"
                        >
                            <ArrowUpCircle size={18} className="stroke-white" />
                            Upgrade Plan
                        </Link>
                    </motion.div>
                )}
            </div>

            {/* Renewal Modal */}
            <AnimatePresence>
                {isRenewModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-lg p-8 w-full max-w-md shadow-2xl"
                        >
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
                                You are about to renew your{" "}
                                <strong>{plan}</strong> subscription. Please
                                confirm your phone number below.
                            </p>

                            <form
                                onSubmit={handleRenewSub}
                                className="space-y-6"
                            >
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
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SubscriptionManagement;

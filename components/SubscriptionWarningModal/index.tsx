"use client";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { AppState } from "@/store";
import { AlertTriangle, AlertOctagon, X, Loader2 } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { toast } from "sonner";

const SubscriptionWarningModal = () => {
    const router = useRouter();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState<"WARNING" | "BLOCKING" | null>(null);
    const [loading, setLoading] = useState(false);

    const [phoneNumber, setPhoneNumber] = useState("");
    const [showRenewInput, setShowRenewInput] = useState(false);

    const businessDetails = useSelector(
        (state: AppState) => state.businessData.businessDetails
    );

    useEffect(() => {
        if (!businessDetails || !businessDetails.subscription) return;

        const { subscription } = businessDetails;
        const plan = subscription.plan;

        if (plan === "STARTER") return;

        const end = new Date(subscription.currentPeriodEnd);
        const today = new Date();
        const diff = end.getTime() - today.getTime();
        const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
        const isExpired = daysLeft <= 0 || subscription.status !== "ACTIVE";

        if (isExpired) {
            if (!pathname?.startsWith("/payment/checking")) {
                setMode("BLOCKING");
                setIsOpen(true);
            } else {
                setIsOpen(false);
            }
            return;
        }

        const storageKey = `sub_warning_dismissed_${
            businessDetails.id
        }_${new Date().toDateString()}`;
        const isDismissed = localStorage.getItem(storageKey);

        if (!isDismissed && daysLeft <= 15) {
            setMode("WARNING");
            setIsOpen(true);
        }
    }, [businessDetails, pathname]);

    const handleDismiss = () => {
        if (mode === "BLOCKING") return;

        setIsOpen(false);
        if (businessDetails?.id) {
            const storageKey = `sub_warning_dismissed_${
                businessDetails.id
            }_${new Date().toDateString()}`;
            localStorage.setItem(storageKey, "true");
        }
    };

    const handleRenewSub = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!phoneNumber) {
            toast.error("Please enter a phone number");
            return;
        }

        const plan = businessDetails?.subscription?.plan;
        if (!plan) return;

        setLoading(true);
        try {
            // Determine amount based on current plan
            const amount = plan === "STANDARD" ? 1000 : 1500;

            const res = await axios.post("/api/subscription/stk-push", {
                phoneNumber,
                amount,
                planId: plan,
            });

            if (res.data.data.CheckoutRequestID) {
                toast.success("STK Push sent! Please check your phone.");
                router.push(
                    `/payment/checking?id=${res.data.data.CheckoutRequestID}`
                );
                setIsOpen(false);
            }
        } catch (error: any) {
            toast.error(
                error.response?.data?.error || "Failed to initiate renewal"
            );
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !mode) return null;

    const isBlocking = mode === "BLOCKING";
    const currentPlan = businessDetails?.subscription?.plan || "Standard";

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-900/90 backdrop-blur-md animate-in fade-in duration-300 p-4">
            <div
                className={`w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8 ${
                    isBlocking ? "border-4 border-red-100" : ""
                }`}
            >
                {!isBlocking && (
                    <button
                        onClick={handleDismiss}
                        className="absolute top-4 right-4 p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} className="text-gray-400" />
                    </button>
                )}

                {/* Header Icon */}
                <div className="flex flex-col items-center text-center mb-6">
                    <div
                        className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                            isBlocking ? "bg-red-50" : "bg-orange-50"
                        }`}
                    >
                        {isBlocking ? (
                            <AlertOctagon className="w-8 h-8 stroke-red-600" />
                        ) : (
                            <AlertTriangle className="w-8 h-8 stroke-orange-500" />
                        )}
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-2">
                        {isBlocking
                            ? "Subscription Expired"
                            : "Subscription Expiring Soon"}
                    </h2>

                    <p className="text-gray-500 text-sm leading-relaxed">
                        {isBlocking
                            ? `Your ${currentPlan} plan has expired. To restore access, please renew now.`
                            : `Your ${currentPlan} plan is set to renew soon.`}
                    </p>

                    {!isBlocking &&
                        businessDetails?.subscription?.currentPeriodEnd && (
                            <div className="mt-4 px-3 py-1 bg-orange-50 text-orange-700 rounded-lg text-xs font-bold border border-orange-100 inline-block">
                                Expires in{" "}
                                {Math.ceil(
                                    (new Date(
                                        businessDetails.subscription.currentPeriodEnd
                                    ).getTime() -
                                        new Date().getTime()) /
                                        (1000 * 60 * 60 * 24)
                                )}{" "}
                                Days
                            </div>
                        )}
                </div>

                <div className="space-y-3">
                    {showRenewInput ? (
                        <form
                            onSubmit={handleRenewSub}
                            className="space-y-3 p-4 rounded-xl animate-in fade-in slide-in-from-top-2"
                        >
                            <label className="text-xs font-bold text-gray-500 uppercase block text-left">
                                M-Pesa Number
                            </label>
                            <input
                                type="tel"
                                placeholder="07XXXXXXXX"
                                className="w-full bg-slate-50 p-3 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-green-500 text-sm"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                autoFocus
                            />
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowRenewInput(false)}
                                    className="flex-1 py-2 px-4 bg-white border border-gray-300 text-gray-700 font-bold text-sm rounded-lg hover:bg-gray-50 transition-colors"
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 py-2 px-4 bg-green-500 text-white font-bold text-sm rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center"
                                >
                                    {loading ? (
                                        <Loader2 className="animate-spin w-4 h-4" />
                                    ) : (
                                        "Pay Now"
                                    )}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <button
                            onClick={() => setShowRenewInput(true)}
                            className={`w-full py-3 px-4 rounded-xl text-sm font-bold text-white transition-all shadow-lg hover:scale-[1.01] active:scale-95 ${
                                isBlocking
                                    ? "bg-green-500 hover:bg-green-600 shadow-green-200"
                                    : "bg-green-500 hover:bg-green-600 shadow-green-200"
                            }`}
                        >
                            Renew {currentPlan} Plan
                        </button>
                    )}

                    {!showRenewInput && (
                        <Link
                            href="/payment"
                            className="block w-full text-center py-3 px-4 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            Upgrade / Change Plan
                        </Link>
                    )}

                    {!isBlocking && !showRenewInput && (
                        <button
                            onClick={handleDismiss}
                            className="w-full text-center text-xs text-gray-400 font-medium hover:text-gray-600 transition-colors mt-2"
                        >
                            Remind me later
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SubscriptionWarningModal;

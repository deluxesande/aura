"use client";
import { AppState } from "@/store";
import axios from "axios";
import { AlertTriangle, Loader2, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";

const SubscriptionWarningModal = () => {
    const router = useRouter();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [showRenewInput, setShowRenewInput] = useState(false);
    const [statusType, setStatusType] = useState<"WARNING" | "EXPIRED">(
        "WARNING",
    );

    const businessDetails = useSelector(
        (state: AppState) => state.businessData.businessDetails,
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

        const isExpired =
            daysLeft <= 0 ||
            (subscription.status !== "ACTIVE" &&
                subscription.status !== "TRIALING");

        if (isExpired) {
            if (
                !pathname?.startsWith("/subscription-expired") &&
                !pathname?.startsWith("/payment")
            ) {
                router.replace("/subscription-expired");
                return;
            }
            return;
        }

        const isWarning = daysLeft <= 15;
        const storageKey = `sub_warning_dismissed_${businessDetails.id}_${new Date().toDateString()}`;
        const isDismissed = localStorage.getItem(storageKey);

        if (!isDismissed && isWarning) {
            setStatusType("WARNING");
            setIsOpen(true);
        }
    }, [businessDetails, pathname, router]);

    const handleDismiss = () => {
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
            toast.error("Please provide a phone number to continue.");
            return;
        }

        const plan = businessDetails?.subscription?.plan;
        if (!plan) return;

        setLoading(true);
        try {
            const amount = plan === "STANDARD" ? 1000 : 1500;
            const res = await axios.post("/api/subscription/stk-push", {
                phoneNumber,
                amount,
                planId: plan,
            });

            if (res.data.data.CheckoutRequestID) {
                toast.success("We've sent a payment request to your phone. Please check your screen.");
                router.push(
                    `/payment/checking?id=${res.data.data.CheckoutRequestID}`,
                );
                setIsOpen(false);
            }
        } catch (error: any) {
            toast.error(
                error.response?.data?.error || "We couldn't start the renewal process. Please try again.",
            );
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const currentPlan = businessDetails?.subscription?.plan || "Standard";

    const isExpiredState = statusType === "EXPIRED";

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300 p-4">
            <div
                className={`w-full max-w-md bg-white rounded-lg shadow-2xl overflow-hidden p-6 relative ${isExpiredState ? "border-2 border-red-100" : ""}`}
            >
                <div className="flex justify-end mb-2">
                    <button
                        onClick={handleDismiss}
                        className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-orange-50">
                        <AlertTriangle className="w-8 h-8 stroke-orange-500" />
                    </div>

                    <h2 className="text-xl font-black text-gray-900 mb-2">
                        Subscription Expiring Soon
                    </h2>

                    <p className="text-gray-500 text-sm leading-relaxed">
                        Your {currentPlan} plan is set to renew soon.
                    </p>

                    {businessDetails?.subscription?.currentPeriodEnd && (
                        <div className="mt-4 px-3 py-1 bg-orange-50 text-orange-700 rounded-lg text-xs font-bold border border-orange-100 inline-block">
                            Expires in{" "}
                            {Math.ceil(
                                (new Date(
                                    businessDetails.subscription
                                        .currentPeriodEnd,
                                ).getTime() -
                                    new Date().getTime()) /
                                    (1000 * 60 * 60 * 24),
                            )}{" "}
                            Days
                        </div>
                    )}
                </div>

                <div className="space-y-3">
                    {showRenewInput ? (
                        <form
                            onSubmit={handleRenewSub}
                            className="space-y-3 animate-in fade-in slide-in-from-top-2"
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
                                    className="flex-1 py-2 px-4 bg-green-500 hover:bg-green-600 text-white font-bold text-sm rounded-lg transition-colors flex items-center justify-center"
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
                            className="w-full py-3 px-4 rounded-lg text-sm font-bold text-white transition-all shadow-lg hover:scale-[1.01] active:scale-95 bg-green-500 hover:bg-green-600 shadow-green-200"
                        >
                            Renew {currentPlan} Plan
                        </button>
                    )}

                    {!showRenewInput && (
                        <Link
                            href="/payment"
                            className="block w-full text-center py-3 px-4 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Upgrade / Change Plan
                        </Link>
                    )}

                    {!showRenewInput && (
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

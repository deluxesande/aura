"use client";
import Navbar from "@/components/Navbar";
import { AppState } from "@/store";
import axios from "axios";
import { AlertOctagon, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";

const SubscriptionExpiredPage = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [showRenewInput, setShowRenewInput] = useState(false);

    const businessDetails = useSelector(
        (state: AppState) => state.businessData.businessDetails,
    );

    useEffect(() => {
        if (
            businessDetails?.subscription?.status === "ACTIVE" ||
            businessDetails?.subscription?.status === "TRIALING"
        ) {
            toast.info("Your subscription is active. Redirecting...");
            router.replace("/settings");
        }
    }, [businessDetails, router]);

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
            const amount = plan === "STANDARD" ? 1000 : 1500;

            const res = await axios.post("/api/subscription/stk-push", {
                phoneNumber,
                amount,
                planId: plan,
            });

            if (res.data.data.CheckoutRequestID) {
                toast.success("STK Push sent! Please check your phone.");
                router.push(
                    `/payment/checking?id=${res.data.data.CheckoutRequestID}`,
                );
            }
        } catch (error: any) {
            toast.error(
                error.response?.data?.error || "Failed to initiate renewal",
            );
        } finally {
            setLoading(false);
        }
    };

    const currentPlan = businessDetails?.subscription?.plan || "Business";

    if (
        businessDetails?.subscription?.status === "ACTIVE" ||
        businessDetails?.subscription?.status === "TRIALING"
    ) {
        return null;
    }

    return (
        <Navbar>
            <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-50 p-4">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-red-100 overflow-hidden p-8 text-center animate-in fade-in zoom-in duration-300">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertOctagon className="w-10 h-10 stroke-red-600" />
                    </div>

                    <h1 className="text-2xl font-black text-gray-900 mb-2">
                        Access Suspended
                    </h1>

                    <p className="text-gray-500 mb-8">
                        Your <strong>{currentPlan}</strong> subscription has
                        expired. <br />
                        Please renew your plan to regain access to your
                        dashboard.
                    </p>

                    <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-8 flex items-center justify-center gap-2 text-red-800 text-sm font-medium">
                        Account is currently locked
                    </div>

                    <div className="space-y-4">
                        {showRenewInput ? (
                            <form
                                onSubmit={handleRenewSub}
                                className="space-y-4 animate-in fade-in slide-in-from-bottom-2"
                            >
                                <div className="text-left">
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
                                        M-Pesa Number
                                    </label>
                                    <input
                                        type="tel"
                                        placeholder="07XXXXXXXX"
                                        className="w-full bg-slate-50 p-3 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-green-500 text-sm"
                                        value={phoneNumber}
                                        onChange={(e) =>
                                            setPhoneNumber(e.target.value)
                                        }
                                        autoFocus
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 px-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center shadow-lg shadow-green-200"
                                >
                                    {loading ? (
                                        <Loader2 className="animate-spin w-5 h-5" />
                                    ) : (
                                        "Pay Now"
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowRenewInput(false)}
                                    disabled={loading}
                                    className="text-sm text-gray-400 hover:text-gray-600 underline"
                                >
                                    Go back
                                </button>
                            </form>
                        ) : (
                            <button
                                onClick={() => setShowRenewInput(true)}
                                className="w-full py-3.5 px-4 rounded-xl text-base font-bold text-white transition-all shadow-lg hover:scale-[1.02] active:scale-95 bg-green-600 hover:bg-green-700 shadow-green-200"
                            >
                                Renew Subscription
                            </button>
                        )}

                        {!showRenewInput && (
                            <Link
                                href="/payment"
                                className="block w-full text-center py-3.5 px-4 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                Choose a Different Plan
                            </Link>
                        )}
                    </div>
                </div>

                <p className="mt-8 text-xs text-gray-400">
                    Need help? Contact support at support@trysalesense.online
                </p>
            </div>
        </Navbar>
    );
};

export default SubscriptionExpiredPage;

"use client";
import React, { useState } from "react";
import { Check, X, AlertCircle, Loader2, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";
import { useSelector } from "react-redux";
import { AppState } from "@/store";

type Plan = {
    id: string;
    name: string;
    price: number;
    description: string;
    features: {
        text: string;
        included: boolean;
        highlight?: string;
        bold?: boolean;
    }[];
    cta: string;
    popular: boolean;
};

const PLANS: Plan[] = [
    {
        id: "STARTER",
        name: "Starter",
        price: 0,
        description: "Perfect for side hustles & small dukas",
        features: [
            { text: "1 User", included: true },
            { text: "Salesense Branded Receipts", included: true },
            {
                text: "Use Salesense Paybill",
                included: true,
                highlight: "warning",
            },
            {
                text: "Max 100 Transactions/mo",
                included: true,
                highlight: "warning",
            },
            {
                text: "2% Transaction Fee",
                included: true,
                highlight: "warning",
            },
            { text: "No Data Export", included: false },
        ],
        cta: "Start Free",
        popular: false,
    },
    {
        id: "STANDARD",
        name: "Standard",
        // !! Change price to 1000
        price: 1,
        description: "For busy hardware stores & cafes",
        features: [
            { text: "Unlimited Transactions", included: true },
            { text: "5 Staff Accounts", included: true },
            {
                text: "0% Commission (Keep 100%)",
                included: true,
                highlight: "success",
            },
            { text: "Connect YOUR Own Paybill", included: true },
            { text: "Salesense Branded Receipts", included: true },
            { text: "PDF Reports", included: true },
        ],
        cta: "Select Standard",
        popular: true,
    },
    {
        id: "PREMIUM",
        name: "Premium",
        // !! Change price to 1500
        price: 1,
        description: "For shops that need data & scaling",
        features: [
            { text: "Unlimited Transactions", included: true },
            { text: "Unlimited Staff Accounts", included: true },
            { text: "Connect YOUR Own Paybill", included: true },
            { text: "Custom Receipt Branding", included: true },
            { text: "Full Excel/CSV Data Export", included: true },
            { text: "Priority Support", included: true },
        ],
        cta: "Select Premium",
        popular: false,
    },
];

export default function PaymentPage() {
    const router = useRouter();

    const user = useSelector((state: AppState) => state.auth.user);
    // Get existing business/subscription data
    const businessDetails = useSelector(
        (state: AppState) => state.businessData.businessDetails
    );

    const currentPlanId = businessDetails?.subscription?.plan || null;

    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState("");

    const handlePlanSelect = (plan: Plan) => {
        if (plan.id === currentPlanId) {
            toast.info(`You are already on the ${plan.name} plan.`);
            return;
        }

        if (plan.price === 0) {
            const setupFreeAccount = async () => {
                const formData = new FormData();
                const businessName = user?.firstName
                    ? `${user.firstName}'s Business`
                    : "My New Business";
                formData.append("name", businessName);

                try {
                    await axios.post("/api/business", formData, {
                        headers: { "Content-Type": "multipart/form-data" },
                    });
                    router.push("/settings");
                    return "Welcome to Salesense Starter!";
                } catch (error: any) {
                    throw new Error(
                        error.response?.data?.error ||
                            "Failed to set up account"
                    );
                }
            };

            toast.promise(setupFreeAccount(), {
                loading: "Setting up your account...",
                success: (data) => data,
                error: (err) => err.message,
            });
        } else {
            setSelectedPlan(plan);
            setIsModalOpen(true);
        }
    };

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!selectedPlan) return;

        try {
            // If user already has a businessDetails (meaning they have a businessId),
            // we use the upgrade endpoint. Otherwise, first-time STK push.
            const endpoint = businessDetails?.id
                ? "/api/subscription/upgrade"
                : "/api/subscription/stk-push";

            const response = await axios.post(endpoint, {
                phoneNumber: phoneNumber,
                amount: selectedPlan.price,
                planId: selectedPlan.id,
                businessId: businessDetails?.id,
            });

            setIsModalOpen(false);

            toast.success("STK Push Sent!", {
                description: `Check your phone (${phoneNumber}) to enter your PIN.`,
                duration: 8000,
            });

            const checkoutRequestId = response.data.data.CheckoutRequestID;
            router.push(`/payment/checking?id=${checkoutRequestId}`);
        } catch (error: any) {
            console.error("Payment Error:", error);
            const message =
                error.response?.data?.error || "Payment request failed.";
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            {/* Header section... */}
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                        Select Your Plan
                    </h2>
                    {currentPlanId && (
                        <div className="mt-2 inline-block px-4 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                            Current Plan: {currentPlanId}
                        </div>
                    )}
                </div>

                <div className="grid md:grid-cols-3 gap-8 items-start">
                    {PLANS.map((plan) => {
                        const isCurrent = plan.id === currentPlanId;
                        return (
                            <motion.div
                                key={plan.id}
                                whileHover={{ y: -5 }}
                                className={`relative bg-white rounded-2xl shadow-sm border ${
                                    isCurrent
                                        ? "border-green-500 ring-2 ring-green-500/20"
                                        : plan.popular
                                        ? "border-green-500 shadow-md ring-1 ring-green-500"
                                        : "border-gray-200"
                                } flex flex-col p-8 h-full`}
                            >
                                {/* Plan content logic remains same... */}
                                <div className="mb-6">
                                    <h3 className="text-xl font-semibold text-gray-900">
                                        {plan.name}
                                    </h3>
                                    <p className="text-gray-500 text-sm mt-2 min-h-[40px]">
                                        {plan.description}
                                    </p>
                                </div>

                                <div className="mb-6">
                                    <span className="text-4xl font-bold text-gray-900">
                                        {plan.price === 0
                                            ? "Free"
                                            : `KSh ${plan.price.toLocaleString()}`}
                                    </span>
                                    {plan.price > 0 && (
                                        <span className="text-gray-500">
                                            /mo
                                        </span>
                                    )}
                                </div>

                                <ul className="space-y-4 mb-8 flex-1">
                                    {plan.features.map((feature, idx) => (
                                        <li
                                            key={idx}
                                            className="flex items-start"
                                        >
                                            {feature.included ? (
                                                <Check
                                                    className={`h-5 w-5 mr-3 shrink-0 ${
                                                        feature.highlight ===
                                                        "warning"
                                                            ? "text-orange-500"
                                                            : "text-green-500"
                                                    }`}
                                                />
                                            ) : (
                                                <X className="h-5 w-5 text-gray-300 mr-3 shrink-0" />
                                            )}
                                            <span
                                                className={`text-sm ${
                                                    !feature.included
                                                        ? "text-gray-400"
                                                        : "text-gray-600"
                                                }`}
                                            >
                                                {feature.text}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={() => handlePlanSelect(plan)}
                                    disabled={isCurrent}
                                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
                                        isCurrent
                                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                            : plan.popular
                                            ? "bg-green-600 text-white hover:bg-green-700 shadow-sm"
                                            : "bg-white text-green-600 border border-green-600 hover:bg-green-50"
                                    }`}
                                >
                                    {isCurrent ? "Active Plan" : plan.cta}
                                </button>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Confirmation Modal logic remains same... */}
            <AnimatePresence>
                {isModalOpen && selectedPlan && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden z-10"
                        >
                            <div className="p-6 text-center">
                                <h3 className="text-2xl font-bold">
                                    {currentPlanId
                                        ? "Confirm Upgrade"
                                        : "Confirm Payment"}
                                </h3>
                                <p className="opacity-90 mt-1">
                                    Subscribe to {selectedPlan.name}
                                </p>
                                <div className="mt-4 text-3xl font-bold">
                                    KSh {selectedPlan.price.toLocaleString()}
                                </div>
                            </div>
                            <div className="p-8">
                                <form
                                    onSubmit={handlePayment}
                                    className="space-y-6"
                                >
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            M-Pesa Phone Number
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
                                                    setPhoneNumber(
                                                        e.target.value
                                                    )
                                                }
                                                className="block w-full pl-10 pr-3 py-3 bg-slate-50 outline-none border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition-colors"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading || !phoneNumber}
                                        className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 transition-all"
                                    >
                                        {loading ? (
                                            <Loader2 className="animate-spin mr-2 h-4 w-4" />
                                        ) : (
                                            `Pay KSh ${selectedPlan.price.toLocaleString()}`
                                        )}
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

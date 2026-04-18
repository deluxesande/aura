"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    plan: any;
    currentPlanId: string | null;
    phoneNumber: string;
    setPhoneNumber: (val: string) => void;
    handlePayment: (e: React.FormEvent) => void;
    paymentLoading: boolean;
}

export default function PaymentModal({
    isOpen,
    onClose,
    plan,
    currentPlanId,
    phoneNumber,
    setPhoneNumber,
    handlePayment,
    paymentLoading,
}: PaymentModalProps) {
    if (!isOpen || !plan) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="relative bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden z-10"
                >
                    <div className="p-6 text-center border-b border-gray-100">
                        <h3 className="text-2xl font-bold text-gray-900">
                            {currentPlanId
                                ? "Confirm Upgrade"
                                : "Confirm Payment"}
                        </h3>
                        <p className="text-gray-500 mt-1 italic">
                            Subscribe to {plan.name}
                        </p>
                        <div className="mt-4 text-3xl font-black text-green-500">
                            KSh {plan.price.toLocaleString()}
                        </div>
                    </div>
                    <div className="p-8">
                        <form onSubmit={handlePayment} className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                                    M-Pesa Phone Number
                                </label>
                                <div className="relative">
                                    <input
                                        type="tel"
                                        required
                                        placeholder="07XXXXXXXX"
                                        value={phoneNumber}
                                        onChange={(e) =>
                                            setPhoneNumber(e.target.value)
                                        }
                                        className="block w-full pl-10 pr-3 py-3 bg-slate-50 outline-none border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={paymentLoading || !phoneNumber}
                                className="w-full flex justify-center items-center py-4 px-4 rounded-lg shadow-lg text-sm font-black text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 transition-all shadow-green-100"
                            >
                                {paymentLoading ? (
                                    <Loader2 className="animate-spin h-4 w-4 stroke-white" />
                                ) : (
                                    `Pay KSh ${plan.price.toLocaleString()}`
                                )}
                            </button>
                        </form>
                        <button
                            onClick={onClose}
                            className="mt-4 w-full text-center text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

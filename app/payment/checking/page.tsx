"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import { Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function PaymentCheckingPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const checkoutRequestId = searchParams?.get("id");

    const [status, setStatus] = useState("PENDING");
    const [message, setMessage] = useState("Waiting for M-Pesa...");
    const [pollCount, setPollCount] = useState(0);
    const [isVerifying, setIsVerifying] = useState(false);

    const checkStatus = useCallback(async () => {
        if (!checkoutRequestId) return null;
        try {
            const response = await axios.get(
                `/api/subscription/check-status?checkoutRequestId=${checkoutRequestId}`
            );
            const currentStatus = response.data.status;

            if (currentStatus === "COMPLETED") {
                setStatus("COMPLETED");
                setMessage("Payment Successful!");
                return true;
            } else if (currentStatus === "FAILED") {
                setStatus("FAILED");
                setMessage("Payment Failed. Please try again.");
                return false;
            } else if (currentStatus === "CANCELLED") {
                setStatus("CANCELLED");
                setMessage("You cancelled the payment.");
                return false;
            }
            return null;
        } catch (error) {
            console.error("Status check error:", error);
            return null;
        }
    }, [checkoutRequestId]);

    // 2. Automated Polling logic
    useEffect(() => {
        if (!checkoutRequestId) return;

        let intervalId: NodeJS.Timeout;
        const maxPolls = 20;

        const runPolling = async () => {
            const result = await checkStatus();
            if (result === true) {
                clearInterval(intervalId);
                setTimeout(() => router.push("/settings"), 2000);
            } else if (result === false) {
                clearInterval(intervalId);
            } else {
                setPollCount((prev) => {
                    if (prev >= maxPolls) {
                        clearInterval(intervalId);
                        setStatus("TIMEOUT");
                        setMessage("We haven't received confirmation yet.");
                        return prev;
                    }
                    return prev + 1;
                });
            }
        };

        runPolling();
        intervalId = setInterval(runPolling, 3000);

        return () => clearInterval(intervalId);
    }, [checkoutRequestId, router, checkStatus]);

    const handleTryAgain = async () => {
        setIsVerifying(true);
        const result = await checkStatus();
        setIsVerifying(false);

        if (result === true) {
            toast.success("Payment was actually successful! Redirecting...");
            setTimeout(() => router.push("/settings"), 1500);
        } else {
            router.push("/payment");
        }
    };

    if (!checkoutRequestId) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-gray-500">Invalid Payment ID</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-8 rounded-2xl shadow-lg max-w-sm w-full text-center"
            >
                <div className="flex justify-center mb-6">
                    {status === "PENDING" && (
                        <div className="relative">
                            <div className="h-20 w-20 rounded-full border-4 border-gray-100"></div>
                            <div className="absolute top-0 left-0 h-20 w-20 rounded-full border-4 border-green-500 border-t-transparent animate-spin"></div>
                        </div>
                    )}
                    {status === "COMPLETED" && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center"
                        >
                            <CheckCircle2 className="h-10 w-10 stroke-green-600" />
                        </motion.div>
                    )}
                    {(status === "FAILED" || status === "CANCELLED") && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="h-20 w-20 bg-red-100 rounded-full flex items-center justify-center"
                        >
                            <XCircle className="h-10 w-10 stroke-red-600" />
                        </motion.div>
                    )}
                    {status === "TIMEOUT" && (
                        <div className="h-20 w-20 bg-orange-100 rounded-full flex items-center justify-center">
                            <AlertCircle className="h-10 w-10 stroke-orange-600" />
                        </div>
                    )}
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {status === "PENDING"
                        ? "Check your phone"
                        : status === "COMPLETED"
                        ? "Payment Confirmed"
                        : "Payment Issue"}
                </h2>

                <p className="text-gray-500 mb-8">
                    {message}
                    {status === "PENDING" && (
                        <span className="block text-xs mt-2 text-gray-400">
                            Enter your M-Pesa PIN to complete the transaction.
                        </span>
                    )}
                </p>

                {status === "PENDING" && (
                    <div className="text-sm text-gray-400 animate-pulse">
                        Checking status...
                    </div>
                )}

                {(status === "FAILED" ||
                    status === "CANCELLED" ||
                    status === "TIMEOUT") && (
                    <div className="space-y-3">
                        <button
                            onClick={handleTryAgain}
                            disabled={isVerifying}
                            className="w-full flex justify-center items-center py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400"
                        >
                            {isVerifying ? (
                                <Loader2 className="h-5 w-5 stroke-white animate-spin" />
                            ) : (
                                "Try Again"
                            )}
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
}

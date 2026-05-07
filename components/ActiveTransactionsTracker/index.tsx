"use client";

import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AppState } from "@/store";
import {
    updateTransactionStatus,
    removeTransaction,
    ActiveTransaction,
} from "@/store/slices/activeTransactionsSlice";
import { apiClient } from "@/utils/apiClient";
import { CheckCircle2, Clock, XCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ActiveTransactionsTracker() {
    const dispatch = useDispatch();
    const transactions = useSelector(
        (state: AppState) => state.activeTransactions.transactions,
    );

    useEffect(() => {
        const pending = transactions.filter((t) => t.status === "PENDING");
        if (pending.length === 0) return;

        const interval = setInterval(async () => {
            for (const tx of pending) {
                try {
                    // Check status of invoice
                    const res = await apiClient.get(
                        `/invoice?id=${tx.invoiceId}`,
                    );
                    const invoice = res.data;

                    if (invoice.status === "PAID") {
                        dispatch(
                            updateTransactionStatus({
                                id: tx.invoiceId,
                                status: "COMPLETED",
                            }),
                        );
                    } else if (
                        invoice.status === "FAILED" ||
                        invoice.status === "VOIDED"
                    ) {
                        dispatch(
                            updateTransactionStatus({
                                id: tx.invoiceId,
                                status: "FAILED",
                            }),
                        );
                    }
                } catch (e) {
                    console.error("Polling error", e);
                }
            }
        }, 5000); // Poll every 5s

        return () => clearInterval(interval);
    }, [transactions, dispatch]);

    if (transactions.length === 0) return null;

    return (
        <div className="fixed bottom-6 left-6 z-[60] flex flex-col gap-3 pointer-events-none">
            <AnimatePresence>
                {transactions.slice(0, 3).map((tx) => (
                    <motion.div
                        key={tx.invoiceId}
                        initial={{ opacity: 0, x: -20, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -20, scale: 0.95 }}
                        className="pointer-events-auto bg-white border border-gray-100 shadow-xl rounded-2xl p-4 w-72 flex items-start gap-4 relative"
                    >
                        <button
                            onClick={() =>
                                dispatch(removeTransaction(tx.invoiceId))
                            }
                            className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 rounded-full transition-colors"
                        >
                            <X size={14} />
                        </button>

                        <div
                            className={`p-2.5 rounded-lg shrink-0 ${
                                tx.status === "PENDING"
                                    ? "bg-amber-50 text-amber-500"
                                    : tx.status === "COMPLETED"
                                      ? "bg-green-50 text-green-500"
                                      : "bg-red-50 text-red-500"
                            }`}
                        >
                            {tx.status === "PENDING" ? (
                                <Clock size={20} className="animate-pulse" />
                            ) : tx.status === "COMPLETED" ? (
                                <CheckCircle2 size={20} />
                            ) : (
                                <XCircle size={20} />
                            )}
                        </div>

                        <div className="flex-1 pr-4">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
                                {tx.status} Payment
                            </p>
                            <p className="text-sm font-bold text-gray-900 truncate">
                                {tx.customerName}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                                <span className="text-xs font-bold text-green-500">
                                    Ksh {tx.amount.toLocaleString()}
                                </span>
                                <span className="text-[10px] text-gray-400 font-medium">
                                    {tx.phoneNumber}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>

            {transactions.length > 3 && (
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">
                    + {transactions.length - 3} more active
                </div>
            )}
        </div>
    );
}

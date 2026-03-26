"use client";

import React, { useState, useEffect } from "react";
import { apiClient } from "@/utils/apiClient";
import { toast } from "sonner";
import { FloatingPortal } from "@floating-ui/react";
import { motion } from "framer-motion";
import { Loader2, ChevronDown, X } from "lucide-react";
import { useSelector } from "react-redux";
import { AppState } from "@/store";

interface EditExpenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    expense: any;
}

const EXPENSE_CATEGORIES = [
    "Rent",
    "Utilities (Water/Electricity)",
    "Transport & Logistics",
    "Salaries & Wages",
    "Marketing",
    "Maintenance & Repairs",
    "Office Supplies",
    "Other",
];

export default function EditExpenseModal({
    isOpen,
    onClose,
    onSuccess,
    expense,
}: EditExpenseModalProps) {
    const businessDetails = useSelector(
        (state: AppState) => state.businessData?.businessDetails,
    );
    const user = useSelector((state: AppState) => state.auth.user);

    const [stores, setStores] = useState<any[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingStores, setIsLoadingStores] = useState(true);

    const [formData, setFormData] = useState({
        title: "",
        category: EXPENSE_CATEGORIES[0],
        amount: "",
        storeId: "",
        notes: "",
    });

    useEffect(() => {
        if (isOpen && expense) {
            setFormData({
                title: expense.title || "",
                category: expense.category || EXPENSE_CATEGORIES[0],
                amount: expense.amount?.toString() || "",
                storeId: expense.storeId || "",
                notes: expense.notes || "",
            });
        }
    }, [isOpen, expense]);

    useEffect(() => {
        if (isOpen && businessDetails?.id && user?.role === "admin") {
            apiClient
                .get(`/business/${businessDetails.id}/stores`)
                .then((res) => {
                    setStores(
                        res.data.filter((s: any) => s.isActive !== false) || [],
                    );
                    setIsLoadingStores(false);
                })
                .catch(() => {
                    toast.error("Failed to load branches");
                    setIsLoadingStores(false);
                });
        } else {
            setIsLoadingStores(false);
        }
    }, [isOpen, businessDetails?.id, user?.role]);

    if (!isOpen || !expense) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.amount || Number(formData.amount) <= 0) {
            toast.error("Please enter a valid amount.");
            return;
        }

        setIsSaving(true);
        try {
            await apiClient.patch(`/expenses/${expense.id}`, {
                ...formData,
                amount: Number(formData.amount),
                storeId: formData.storeId === "" ? null : formData.storeId,
            });
            toast.success("Expense updated successfully.");
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(
                error.response?.data?.error || "Failed to update expense",
            );
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <FloatingPortal>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white rounded-lg w-full max-w-md shadow-2xl border border-gray-100 overflow-hidden relative"
                >
                    <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white/50 backdrop-blur-sm relative z-10">
                        <h3 className="font-bold text-lg text-gray-900">
                            Edit Expense
                        </h3>
                        <button
                            onClick={onClose}
                            className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {isLoadingStores ? (
                        <div className="flex flex-col items-center justify-center h-[200px]">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="relative z-10">
                            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                        Expense Title
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                title: e.target.value,
                                            })
                                        }
                                        className="w-full px-4 py-2.5 bg-slate-50 outline-none border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm transition-all"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                            Category
                                        </label>
                                        <div className="relative">
                                            <select
                                                required
                                                value={formData.category}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        category:
                                                            e.target.value,
                                                    })
                                                }
                                                className="w-full pl-4 pr-10 py-2.5 bg-slate-50 outline-none border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm appearance-none cursor-pointer"
                                            >
                                                {EXPENSE_CATEGORIES.map(
                                                    (cat) => (
                                                        <option
                                                            key={cat}
                                                            value={cat}
                                                        >
                                                            {cat}
                                                        </option>
                                                    ),
                                                )}
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                            Amount (KSh)
                                        </label>
                                        <input
                                            required
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={formData.amount}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    amount: e.target.value,
                                                })
                                            }
                                            className="w-full px-4 py-2.5 bg-slate-50 outline-none border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm transition-all"
                                        />
                                    </div>
                                </div>

                                {user?.role === "admin" && (
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                            Branch (Optional)
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={formData.storeId}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        storeId: e.target.value,
                                                    })
                                                }
                                                className="w-full pl-4 pr-10 py-2.5 bg-slate-50 outline-none border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm appearance-none cursor-pointer"
                                            >
                                                <option value="">
                                                    Business-wide Expense
                                                </option>
                                                {stores.map((s) => (
                                                    <option
                                                        key={s.id}
                                                        value={s.id}
                                                    >
                                                        {s.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                        Additional Notes
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={formData.notes}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                notes: e.target.value,
                                            })
                                        }
                                        className="w-full px-4 py-2.5 bg-slate-50 outline-none border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm transition-all resize-none"
                                    />
                                </div>
                            </div>

                            <div className="p-5 border-t border-gray-100 bg-gray-50/50 backdrop-blur-sm flex gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={isSaving}
                                    className="flex-1 py-2.5 px-4 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex-1 py-2.5 px-4 text-sm font-bold text-white bg-green-500 rounded-lg hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                                >
                                    {isSaving ? (
                                        <Loader2 className="animate-spin w-4 h-4 stroke-white" />
                                    ) : (
                                        "Save Changes"
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </motion.div>
            </motion.div>
        </FloatingPortal>
    );
}

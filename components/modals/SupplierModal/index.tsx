"use client";

import React, { useState, useEffect } from "react";
import { apiClient } from "@/utils/apiClient";
import { toast } from "sonner";
import { FloatingPortal } from "@floating-ui/react";
import { motion } from "framer-motion";
import { Loader2, X } from "lucide-react";

interface SupplierModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    supplier?: any | null;
}

export default function SupplierModal({
    isOpen,
    onClose,
    onSuccess,
    supplier,
}: SupplierModalProps) {
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phoneNumber: "",
        address: "",
    });

    useEffect(() => {
        if (isOpen) {
            if (supplier) {
                setFormData({
                    name: supplier.name || "",
                    email: supplier.email || "",
                    phoneNumber: supplier.phoneNumber || "",
                    address: supplier.address || "",
                });
            } else {
                setFormData({
                    name: "",
                    email: "",
                    phoneNumber: "",
                    address: "",
                });
            }
        }
    }, [isOpen, supplier]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (supplier?.id) {
                await apiClient.patch(`/suppliers/${supplier.id}`, formData);
                toast.success("Supplier updated successfully.");
            } else {
                await apiClient.post("/suppliers", formData);
                toast.success("Supplier added successfully.");
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(
                error.response?.data?.error || "Failed to save supplier",
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
                            {supplier ? "Edit Supplier" : "Add Supplier"}
                        </h3>
                        <button
                            onClick={onClose}
                            className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="relative z-10">
                        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                    Supplier Name
                                </label>
                                <input
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            name: e.target.value,
                                        })
                                    }
                                    className="w-full px-4 py-2.5 bg-slate-50 outline-none border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm transition-all"
                                    placeholder="e.g. Acme Wholesale"
                                    autoFocus
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phoneNumber}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                phoneNumber: e.target.value,
                                            })
                                        }
                                        className="w-full px-4 py-2.5 bg-slate-50 outline-none border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm transition-all"
                                        placeholder="07XX..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                email: e.target.value,
                                            })
                                        }
                                        className="w-full px-4 py-2.5 bg-slate-50 outline-none border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm transition-all"
                                        placeholder="contact@acme.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                    Physical Address
                                </label>
                                <textarea
                                    rows={2}
                                    value={formData.address}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            address: e.target.value,
                                        })
                                    }
                                    className="w-full px-4 py-2.5 bg-slate-50 outline-none border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm transition-all resize-none"
                                    placeholder="Nairobi, Kenya..."
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
                                    "Save Supplier"
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </FloatingPortal>
    );
}

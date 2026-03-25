"use client";

import React, { useState, useEffect } from "react";
import { apiClient } from "@/utils/apiClient";
import { toast } from "sonner";
import { FloatingPortal } from "@floating-ui/react";
import { motion } from "framer-motion";
import { Loader2, ChevronDown, X } from "lucide-react";
import { useSelector } from "react-redux";
import { AppState } from "@/store";

interface StockTransferModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: any;
    onSuccess: () => void;
}

export default function StockTransferModal({
    isOpen,
    onClose,
    product,
    onSuccess,
}: StockTransferModalProps) {
    const [stores, setStores] = useState<any[]>([]);
    const [fromStoreId, setFromStoreId] = useState("");
    const [toStoreId, setToStoreId] = useState("");
    const [quantity, setQuantity] = useState<number | "">("");
    const [isTransferring, setIsTransferring] = useState(false);
    const [isLoadingStores, setIsLoadingStores] = useState(true);

    const businessDetails = useSelector(
        (state: AppState) => state.businessData?.businessDetails,
    );

    useEffect(() => {
        if (isOpen && businessDetails?.id) {
            const fetchStores = async () => {
                try {
                    const response = await apiClient.get(
                        `/business/${businessDetails.id}/stores`,
                    );
                    setStores(response.data || []);
                } catch (error) {
                    toast.error("Failed to load branches");
                } finally {
                    setIsLoadingStores(false);
                }
            };
            fetchStores();
        }
    }, [isOpen, businessDetails?.id]);

    if (!isOpen || !product) return null;

    const handleTransfer = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!fromStoreId || !toStoreId) {
            toast.error("Please select both origin and destination branches.");
            return;
        }

        if (fromStoreId === toStoreId) {
            toast.error("Origin and destination branches must be different.");
            return;
        }

        if (!quantity || Number(quantity) <= 0) {
            toast.error("Please enter a valid quantity to transfer.");
            return;
        }

        setIsTransferring(true);

        try {
            await apiClient.post("/inventory/transfer", {
                productId: product.id,
                fromStoreId,
                toStoreId,
                quantity: Number(quantity),
            });

            toast.success("Stock transferred successfully.");
            onSuccess();
            onClose();
            setFromStoreId("");
            setToStoreId("");
            setQuantity("");
        } catch (error: any) {
            toast.error(
                error.response?.data?.error || "Failed to transfer stock.",
            );
        } finally {
            setIsTransferring(false);
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
                    <div className="p-6 pb-0 relative z-10 text-center">
                        <div className="flex justify-end absolute right-4 top-4">
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">
                            Transfer Stock
                        </h3>
                        <p className="text-sm text-gray-500 mt-1 truncate px-4">
                            {product.name}
                        </p>
                    </div>

                    <div className="p-6 relative z-10">
                        {isLoadingStores ? (
                            <div className="flex flex-col items-center justify-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                            </div>
                        ) : (
                            <form
                                onSubmit={handleTransfer}
                                className="space-y-5"
                            >
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                        From Branch (Origin)
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={fromStoreId}
                                            onChange={(e) =>
                                                setFromStoreId(e.target.value)
                                            }
                                            className="block w-full pl-4 pr-10 py-3 bg-slate-50 outline-none border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm appearance-none cursor-pointer"
                                            required
                                        >
                                            <option value="" disabled>
                                                Select origin branch...
                                            </option>
                                            {stores
                                                .filter(
                                                    (s) => s.isActive !== false,
                                                )
                                                .map((store) => (
                                                    <option
                                                        key={store.id}
                                                        value={store.id}
                                                    >
                                                        {store.name}
                                                    </option>
                                                ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none h-4 w-4" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                        To Branch (Destination)
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={toStoreId}
                                            onChange={(e) =>
                                                setToStoreId(e.target.value)
                                            }
                                            className="block w-full pl-4 pr-10 py-3 bg-slate-50 outline-none border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm appearance-none cursor-pointer"
                                            required
                                        >
                                            <option value="" disabled>
                                                Select destination branch...
                                            </option>
                                            {stores
                                                .filter(
                                                    (s) => s.isActive !== false,
                                                )
                                                .map((store) => (
                                                    <option
                                                        key={store.id}
                                                        value={store.id}
                                                    >
                                                        {store.name}
                                                    </option>
                                                ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none h-4 w-4" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                        Quantity to Transfer
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={quantity}
                                        onChange={(e) =>
                                            setQuantity(Number(e.target.value))
                                        }
                                        className="block w-full px-4 py-3 bg-slate-50 outline-none border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm no-spinner"
                                        placeholder="e.g. 10"
                                        required
                                    />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        disabled={isTransferring}
                                        className="flex-1 px-4 py-3 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isTransferring}
                                        className="flex-1 px-4 py-3 text-sm font-bold text-white bg-green-500 rounded-lg hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                                    >
                                        {isTransferring ? (
                                            <Loader2 className="animate-spin h-4 w-4 stroke-white" />
                                        ) : (
                                            "Transfer Stock"
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </FloatingPortal>
    );
}

import { FloatingPortal } from "@floating-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, X } from "lucide-react";
import React from "react";

function QuickRestockModal({
    productToRestock,
    setIsRestockModalOpen,
    restockAmount,
    setRestockAmount,
    handleQuickRestockSubmit,
    isRestocking,
}: {
    productToRestock: { id: string; name: string; quantity: number | null };
    setIsRestockModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    restockAmount: string;
    setRestockAmount: React.Dispatch<React.SetStateAction<string>>;
    handleQuickRestockSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    isRestocking: boolean;
}) {
    return (
        <AnimatePresence>
            <FloatingPortal>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white w-full max-w-sm rounded-lg shadow-2xl border border-gray-100 overflow-hidden relative"
                    >
                        {/* --- Background Line Pattern (Green) --- */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.05]">
                            {/* Fresh Green Blobs */}
                            <div className="absolute -top-[10%] -left-[10%] w-[80%] h-[40%] rounded-full bg-green-500/20 blur-[60px]" />
                            <div className="absolute bottom-0 right-0 w-[60%] h-[40%] bg-green-400/20 blur-[60px] rounded-full" />

                            <svg
                                className="absolute inset-0 w-full h-full"
                                viewBox="0 0 100 100"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                preserveAspectRatio="none"
                            >
                                <path
                                    d="M0 100 C 20 0 50 0 100 100 Z"
                                    stroke="#16a34a" /* Green-600 */
                                    strokeWidth="0.5"
                                    className="opacity-40"
                                />
                                <path
                                    d="M0 0 C 50 100 80 100 100 0"
                                    stroke="#22c55e" /* Green-500 */
                                    strokeWidth="0.5"
                                    className="opacity-30"
                                />
                            </svg>
                        </div>

                        {/* Header */}
                        <div className="p-5 border-b border-gray-100 flex justify-between items-center relative z-10 bg-white/50 backdrop-blur-sm">
                            <h3 className="font-bold text-lg text-gray-900">
                                Restock Product
                            </h3>
                            <button
                                onClick={() => setIsRestockModalOpen(false)}
                                className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <form
                            onSubmit={handleQuickRestockSubmit}
                            className="p-6 relative z-10"
                        >
                            <div className="bg-green-50 border border-green-100 rounded-lg p-4 mb-6">
                                <p className="text-sm text-green-500 font-medium mb-1">
                                    Restocking:
                                </p>
                                <p className="text-lg font-bold text-green-500 truncate">
                                    {productToRestock.name}
                                </p>
                                <div className="mt-3 pt-3 border-t border-green-200/50 flex justify-between text-sm">
                                    <span className="text-green-500">
                                        Current Stock:
                                    </span>
                                    <span className="font-bold text-green-500">
                                        {productToRestock.quantity}
                                    </span>
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                    Quantity to Add
                                </label>
                                <input
                                    type="number"
                                    value={restockAmount}
                                    onChange={(e) =>
                                        setRestockAmount(e.target.value)
                                    }
                                    placeholder="e.g., 20"
                                    className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-gray-200 outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-gray-900 font-medium no-spinner"
                                    autoFocus
                                    disabled={isRestocking}
                                />
                            </div>

                            <div className="flex items-center justify-between text-sm mb-6 px-1">
                                <span className="text-gray-500">
                                    New Total Stock:
                                </span>
                                <span className="font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded-lg">
                                    {(productToRestock.quantity || 0) +
                                        (parseInt(restockAmount || "0") || 0)}
                                </span>
                            </div>

                            <button
                                type="submit"
                                disabled={isRestocking}
                                className="w-full py-3 px-4 rounded-lg bg-green-500 text-white font-bold hover:bg-green-600 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isRestocking ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin stroke-white" />
                                        Updating...
                                    </>
                                ) : (
                                    "Confirm Restock"
                                )}
                            </button>
                        </form>
                    </motion.div>
                </motion.div>
            </FloatingPortal>
        </AnimatePresence>
    );
}

export default QuickRestockModal;

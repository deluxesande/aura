import { Loader2, X } from "lucide-react";
import React from "react";

function QuicKRestockModal({
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900">
                        Restock {productToRestock.name}
                    </h3>
                    <button
                        onClick={() => setIsRestockModalOpen(false)}
                        className="p-1 hover:bg-gray-100 rounded-full text-gray-500"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleQuickRestockSubmit} className="p-6">
                    <div className="bg-green-50 border border-green-100 rounded-lg p-3 mb-4">
                        <p className="text-sm text-green-800 flex justify-between">
                            <span>Current Stock:</span>
                            <span className="font-bold">
                                {productToRestock.quantity}
                            </span>
                        </p>
                    </div>

                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantity to Add
                    </label>
                    <input
                        type="number"
                        value={restockAmount}
                        onChange={(e) => setRestockAmount(e.target.value)}
                        placeholder="e.g., 20"
                        className="w-full px-4 py-2 rounded-lg bg-slate-50 no-spinner border border-gray-300 outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 mb-2"
                        autoFocus
                        disabled={isRestocking}
                    />

                    <p className="text-md font-semibold text-gray-500">
                        New Total:{" "}
                        <span className="font-bold">
                            {(productToRestock.quantity || 0) +
                                (parseInt(restockAmount || "0") || 0)}
                        </span>
                    </p>

                    <button
                        type="submit"
                        disabled={isRestocking}
                        className="w-full mt-6 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-medium transition-colors flex items-center justify-center gap-2"
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
            </div>
        </div>
    );
}

export default QuicKRestockModal;

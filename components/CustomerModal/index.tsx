import { FloatingPortal } from "@floating-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, X } from "lucide-react";
import React from "react";

function CustomerModal({
    showAddCustomerModal,
    setShowAddCustomerModal,
    newCustomerDetails,
    setNewCustomerDetails,
    handleSaveNewCustomer,
}: {
    showAddCustomerModal: boolean;
    setShowAddCustomerModal: React.Dispatch<React.SetStateAction<boolean>>;
    newCustomerDetails: {
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber: string;
    };
    setNewCustomerDetails: React.Dispatch<
        React.SetStateAction<{
            firstName: string;
            lastName: string;
            email: string;
            phoneNumber: string;
        }>
    >;
    handleSaveNewCustomer: () => void;
}) {
    // Optional: You can pass an 'isSaving' prop later to show spinner
    const isSaving = false;

    return (
        <AnimatePresence>
            {showAddCustomerModal && (
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
                            className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-gray-100 overflow-hidden relative"
                        >
                            {/* --- Background Line Pattern --- */}
                            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03] z-0">
                                <div className="absolute -top-[10%] -left-[10%] w-[80%] h-[40%] rounded-full bg-green-900/20 blur-[60px]" />
                                <svg
                                    className="absolute inset-0 w-full h-full"
                                    viewBox="0 0 100 100"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    preserveAspectRatio="none"
                                >
                                    <path
                                        d="M0 100 C 20 0 50 0 100 100 Z"
                                        stroke="black"
                                        strokeWidth="0.5"
                                        className="opacity-20"
                                    />
                                </svg>
                            </div>

                            {/* Header */}
                            <div className="p-5 border-b border-gray-100 flex items-center justify-between relative z-10 bg-white/50 backdrop-blur-sm">
                                <h3 className="font-bold text-lg text-gray-900">
                                    Add New Customer
                                </h3>
                                <button
                                    onClick={() =>
                                        setShowAddCustomerModal(false)
                                    }
                                    className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Form Content */}
                            <div className="p-6 space-y-5 relative z-10">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            First Name
                                        </label>
                                        <input
                                            className="w-full px-4 py-2.5 rounded-xl outline-none bg-slate-50 focus:bg-white border border-gray-200 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm"
                                            placeholder="John"
                                            value={newCustomerDetails.firstName}
                                            onChange={(e) =>
                                                setNewCustomerDetails({
                                                    ...newCustomerDetails,
                                                    firstName: e.target.value,
                                                })
                                            }
                                            autoFocus
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            Last Name
                                        </label>
                                        <input
                                            className="w-full px-4 py-2.5 rounded-xl outline-none bg-slate-50 focus:bg-white border border-gray-200 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm"
                                            placeholder="Doe"
                                            value={newCustomerDetails.lastName}
                                            onChange={(e) =>
                                                setNewCustomerDetails({
                                                    ...newCustomerDetails,
                                                    lastName: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        Phone Number (M-Pesa)
                                    </label>
                                    <input
                                        className="w-full px-4 py-2.5 rounded-xl outline-none bg-slate-50 focus:bg-white border border-gray-200 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm no-spinner"
                                        placeholder="0712 345 678"
                                        type="number"
                                        value={newCustomerDetails.phoneNumber}
                                        onChange={(e) =>
                                            setNewCustomerDetails({
                                                ...newCustomerDetails,
                                                phoneNumber: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        Email (Optional)
                                    </label>
                                    <input
                                        className="w-full px-4 py-2.5 rounded-xl outline-none bg-slate-50 focus:bg-white border border-gray-200 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm"
                                        placeholder="john@example.com"
                                        value={newCustomerDetails.email}
                                        onChange={(e) =>
                                            setNewCustomerDetails({
                                                ...newCustomerDetails,
                                                email: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-5 border-t border-gray-100 bg-gray-50/50 backdrop-blur-sm relative z-10 flex gap-3">
                                <button
                                    onClick={() =>
                                        setShowAddCustomerModal(false)
                                    }
                                    className="flex-1 py-2.5 px-4 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveNewCustomer}
                                    disabled={isSaving}
                                    className="flex-1 py-2.5 px-4 text-sm font-bold text-white bg-green-500 rounded-xl hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                                >
                                    {isSaving ? (
                                        <Loader2 className="animate-spin h-4 w-4 stroke-white" />
                                    ) : (
                                        "Save Customer"
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                </FloatingPortal>
            )}
        </AnimatePresence>
    );
}

export default CustomerModal;

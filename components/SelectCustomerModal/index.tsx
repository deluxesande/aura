import { FloatingPortal } from "@floating-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Search, UserIcon, X, Plus } from "lucide-react";
import React from "react";

function SelectCustomerModal({
    setShowSelectCustomerModal,
    customers,
    customerSearchQuery,
    setCustomerSearchQuery,
    selectedCustomer,
    setSelectedCustomer,
    handleSelectCustomer,
    handleGuestCheckout,
    showAddCustomerModal,
    setShowAddCustomerModal,
}: {
    setShowSelectCustomerModal: React.Dispatch<React.SetStateAction<boolean>>;
    customers: {
        id: string;
        firstName: string;
        lastName: string;
        phoneNumber: string;
        email?: string;
    }[];
    customerSearchQuery: string;
    setCustomerSearchQuery: React.Dispatch<React.SetStateAction<string>>;
    selectedCustomer: {
        id: string;
        firstName: string;
        lastName: string;
        phoneNumber: string;
        email?: string;
    } | null;
    setSelectedCustomer: React.Dispatch<
        React.SetStateAction<{
            id: string;
            firstName: string;
            lastName: string;
            phoneNumber: string;
            email?: string;
        } | null>
    >;
    handleSelectCustomer: (customer: {
        id: string;
        firstName: string;
        lastName: string;
        phoneNumber: string;
        email?: string;
    }) => void;
    handleGuestCheckout: () => void;
    showAddCustomerModal: boolean;
    setShowAddCustomerModal: React.Dispatch<React.SetStateAction<boolean>>;
}) {
    return (
        <AnimatePresence>
            <FloatingPortal>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white w-full max-w-md rounded-lg shadow-2xl border border-gray-100 overflow-hidden relative flex flex-col max-h-[80vh]"
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
                                Select Customer
                            </h3>
                            <button
                                onClick={() =>
                                    setShowSelectCustomerModal(false)
                                }
                                className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Search & List */}
                        <div className="p-4 flex-grow overflow-y-auto relative z-10">
                            <div className="relative mb-4">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <input
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm"
                                    placeholder="Search by name or number..."
                                    value={customerSearchQuery}
                                    onChange={(e) =>
                                        setCustomerSearchQuery(e.target.value)
                                    }
                                    autoFocus
                                />
                            </div>

                            <div className="space-y-2">
                                {/* Guest Checkout Option */}
                                <button
                                    onClick={handleGuestCheckout}
                                    className="w-full p-3 flex items-center gap-3 hover:bg-slate-50 rounded-lg border border-transparent hover:border-gray-200 transition-all text-left group"
                                >
                                    <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center text-gray-500 group-hover:bg-white group-hover:shadow-sm transition-all">
                                        <UserIcon size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-gray-900">
                                            Guest Checkout
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            No customer attached
                                        </p>
                                    </div>
                                    {selectedCustomer === null && (
                                        <div className="ml-auto bg-green-100 p-1 rounded-full">
                                            <Check
                                                className="text-green-600"
                                                size={14}
                                                strokeWidth={3}
                                            />
                                        </div>
                                    )}
                                </button>

                                <div className="border-t border-gray-100 my-2"></div>

                                {/* Customer List */}
                                {customers
                                    .filter(
                                        (c) =>
                                            c.firstName
                                                .toLowerCase()
                                                .includes(
                                                    customerSearchQuery.toLowerCase(),
                                                ) ||
                                            c.lastName
                                                .toLowerCase()
                                                .includes(
                                                    customerSearchQuery.toLowerCase(),
                                                ) ||
                                            c.phoneNumber.includes(
                                                customerSearchQuery,
                                            ),
                                    )
                                    .map((customer) => (
                                        <button
                                            key={customer.id}
                                            onClick={() =>
                                                handleSelectCustomer(customer)
                                            }
                                            className={`w-full p-3 flex items-center gap-3 rounded-lg border transition-all text-left group ${
                                                selectedCustomer?.id ===
                                                customer.id
                                                    ? "bg-green-50 border-green-200"
                                                    : "hover:bg-slate-50 border-transparent hover:border-gray-200"
                                            }`}
                                        >
                                            <div
                                                className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                                                    selectedCustomer?.id ===
                                                    customer.id
                                                        ? "bg-green-200 text-green-700"
                                                        : "bg-green-50 text-green-600 group-hover:bg-white group-hover:shadow-sm"
                                                }`}
                                            >
                                                {customer.firstName.charAt(0)}
                                                {customer.lastName.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-gray-900">
                                                    {customer.firstName}{" "}
                                                    {customer.lastName}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {customer.phoneNumber}
                                                </p>
                                            </div>
                                            {selectedCustomer?.id ===
                                                customer.id && (
                                                <div className="ml-auto bg-green-500 p-1 rounded-full shadow-sm">
                                                    <Check
                                                        className="text-white"
                                                        size={14}
                                                        strokeWidth={3}
                                                    />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                {customers.length === 0 && (
                                    <div className="text-center py-8">
                                        <p className="text-gray-400 text-sm">
                                            No customers found
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-gray-100 bg-gray-50/50 backdrop-blur-sm relative z-10">
                            <button
                                onClick={() => {
                                    setShowSelectCustomerModal(false);
                                    setShowAddCustomerModal(true);
                                }}
                                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-all"
                            >
                                Add New Customer
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            </FloatingPortal>
        </AnimatePresence>
    );
}

export default SelectCustomerModal;

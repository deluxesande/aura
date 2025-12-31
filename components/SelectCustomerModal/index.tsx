import { Check, Search, UserIcon, X } from "lucide-react";
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                {/* Header */}
                <div className="p-4 border-b flex items-center justify-between">
                    <h3 className="font-bold text-lg">Select Customer</h3>
                    <button
                        onClick={() => setShowSelectCustomerModal(false)}
                        className="p-1 hover:bg-gray-100 rounded-full"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Search & List */}
                <div className="p-4 flex-grow overflow-y-auto">
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-2 stroke-green-500 h-4 w-4" />
                        <input
                            className="w-full pl-9 pr-4 py-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-100"
                            placeholder="Search by name or number..."
                            value={customerSearchQuery}
                            onChange={(e) =>
                                setCustomerSearchQuery(e.target.value)
                            }
                        />
                    </div>

                    <div className="space-y-2">
                        <button
                            onClick={handleGuestCheckout}
                            className="w-full p-3 flex items-center gap-3 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-200 transition-all text-left group"
                        >
                            <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 group-hover:bg-gray-200">
                                <UserIcon size={20} />
                            </div>
                            <div>
                                <p className="font-medium text-gray-700">
                                    Guest Checkout
                                </p>
                                <p className="text-xs text-gray-400">
                                    No customer attached
                                </p>
                            </div>
                            {selectedCustomer === null && (
                                <Check
                                    className="ml-auto text-green-500"
                                    size={16}
                                />
                            )}
                        </button>

                        <div className="border-t my-2"></div>

                        {customers
                            .filter(
                                (c) =>
                                    c.firstName
                                        .toLowerCase()
                                        .includes(
                                            customerSearchQuery.toLowerCase()
                                        ) ||
                                    c.lastName
                                        .toLowerCase()
                                        .includes(
                                            customerSearchQuery.toLowerCase()
                                        ) ||
                                    c.phoneNumber.includes(customerSearchQuery)
                            )
                            .map((customer) => (
                                <button
                                    key={customer.id}
                                    onClick={() =>
                                        handleSelectCustomer(customer)
                                    }
                                    className="w-full p-3 flex items-center gap-3 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-200 transition-all text-left group"
                                >
                                    <div className="h-10 w-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center font-bold text-sm">
                                        {customer.firstName.charAt(0)}
                                        {customer.lastName.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">
                                            {customer.firstName}{" "}
                                            {customer.lastName}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {customer.phoneNumber}
                                        </p>
                                    </div>
                                    {selectedCustomer?.id === customer.id && (
                                        <Check
                                            className="ml-auto text-green-500"
                                            size={16}
                                        />
                                    )}
                                </button>
                            ))}
                        {customers.length === 0 && (
                            <p className="text-center text-gray-400 py-4">
                                No customers found
                            </p>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-gray-50">
                    <button
                        onClick={() => {
                            setShowSelectCustomerModal(false);
                            setShowAddCustomerModal(true);
                        }}
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                        Add New Customer
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SelectCustomerModal;

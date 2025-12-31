import { X } from "lucide-react";
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
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden">
                <div className="p-4 border-b flex items-center justify-between">
                    <h3 className="font-bold text-lg">Add New Customer</h3>
                    <button
                        onClick={() => setShowAddCustomerModal(false)}
                        className="p-1 hover:bg-gray-100 rounded-full"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500">
                                First Name
                            </label>
                            <input
                                className="w-full px-4 py-2 rounded-lg outline-none bg-slate-50 focus:border-gray-400 border-2"
                                placeholder="John"
                                value={newCustomerDetails.firstName}
                                onChange={(e) =>
                                    setNewCustomerDetails({
                                        ...newCustomerDetails,
                                        firstName: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500">
                                Last Name
                            </label>
                            <input
                                className="w-full px-4 py-2 rounded-lg outline-none bg-slate-50 focus:border-gray-400 border-2"
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
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500">
                            Phone Number (M-Pesa)
                        </label>
                        <input
                            className="w-full px-4 py-2 rounded-lg outline-none bg-slate-50 focus:border-gray-400 border-2 no-spinner"
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
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500">
                            Email (Optional)
                        </label>
                        <input
                            className="w-full px-4 py-2 rounded-lg outline-none bg-slate-50 focus:border-gray-400 border-2"
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
                <div className="p-4 border-t bg-gray-50 flex gap-3">
                    <button
                        onClick={() => setShowAddCustomerModal(false)}
                        className="flex-1 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSaveNewCustomer}
                        className="flex-1 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                    >
                        Save Customer
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CustomerModal;

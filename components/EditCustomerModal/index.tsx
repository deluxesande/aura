import { X } from "lucide-react";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";

interface Customer {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phoneNumber: string;
    createdAt: string;
    CreatedBy?: {
        firstName: string | null;
        lastName: string | null;
        imageUrl?: string | null;
        role?: string;
    } | null;
}

interface EditCustomerModalProps {
    showEditCustomerModal: boolean;
    setShowEditCustomerModal: React.Dispatch<React.SetStateAction<boolean>>;
    customer: Customer;
    onSuccess: (updatedCustomer: Customer) => void;
}

export default function EditCustomerModal({
    showEditCustomerModal,
    setShowEditCustomerModal,
    customer,
    onSuccess,
}: EditCustomerModalProps) {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (showEditCustomerModal && customer) {
            setFormData({
                firstName: customer.firstName || "",
                lastName: customer.lastName || "",
                email: customer.email || "",
                phoneNumber: customer.phoneNumber || "",
            });
        }
    }, [showEditCustomerModal, customer]);

    const handleUpdateCustomer = async () => {
        if (!customer) return;
        setLoading(true);

        try {
            const promise = async () => {
                await axios.put(`/api/customer/${customer.id}`, {
                    ...formData,
                });

                onSuccess({
                    ...customer,
                    ...formData,
                });
                setShowEditCustomerModal(false);
            };

            toast.promise(promise(), {
                loading: "Updating customer...",
                success: "Customer updated successfully!",
                error: "Failed to update customer.",
            });
        } catch (error) {
            toast.error("Failed to update customer. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!showEditCustomerModal) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden">
                <div className="p-4 border-b flex items-center justify-between">
                    <h3 className="font-bold text-lg">Edit Customer</h3>
                    <button
                        onClick={() => setShowEditCustomerModal(false)}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
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
                                className="w-full px-4 py-2 rounded-lg outline-none bg-slate-50 focus:border-green-500 focus:bg-white border-2 transition-all"
                                placeholder="John"
                                value={formData.firstName}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
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
                                className="w-full px-4 py-2 rounded-lg outline-none bg-slate-50 focus:border-green-500 focus:bg-white border-2 transition-all"
                                placeholder="Doe"
                                value={formData.lastName}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        lastName: e.target.value,
                                    })
                                }
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500">
                            Phone Number
                        </label>
                        <input
                            className="w-full px-4 py-2 rounded-lg outline-none bg-slate-50 focus:border-green-500 focus:bg-white border-2 transition-all no-spinner"
                            placeholder="0712 345 678"
                            type="number"
                            value={formData.phoneNumber}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
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
                            className="w-full px-4 py-2 rounded-lg outline-none bg-slate-50 focus:border-green-500 focus:bg-white border-2 transition-all"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    email: e.target.value,
                                })
                            }
                        />
                    </div>
                </div>

                <div className="p-4 border-t bg-gray-50 flex gap-3">
                    <button
                        onClick={() => setShowEditCustomerModal(false)}
                        disabled={loading}
                        className="flex-1 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors font-medium disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleUpdateCustomer}
                        disabled={loading}
                        className="flex-1 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Saving...
                            </>
                        ) : (
                            "Save Changes"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

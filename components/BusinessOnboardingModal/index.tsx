"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { AppState } from "@/store";
import { setBusiness } from "@/store/slices/businessSlice";
import { Building2, Loader2 } from "lucide-react";

interface Business {
    id: string;
    name: string;
}
interface UserState {
    businessId?: string | null;
    firstName?: string;
    Business: Business | null;
}

const BusinessOnboardingModal = () => {
    const [businessName, setBusinessName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(true);

    const dispatch = useDispatch();

    const user = useSelector(
        (state: AppState) => state.auth.user,
    ) as UserState | null;

    const shouldShow =
        (user && !user.businessId) ||
        user?.Business?.name === "My New Business";

    if (!shouldShow || !isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!businessName.trim()) return;

        setIsLoading(true);
        try {
            const data = { name: businessName };

            const response = await axios.put(
                `/api/business/${user?.businessId}`,
                data,
                {
                    headers: { "Content-Type": "application/json" },
                },
            );

            dispatch(
                setBusiness({
                    id: response.data.id,
                    name: response.data.name,
                    logo: response.data.logo,
                }),
            );

            toast.success("Business profile created!");

            setIsOpen(false);
        } catch (error: any) {
            toast.error(
                error.response?.data?.error || "Failed to create business",
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/90 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden p-8 animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <Building2 className="w-8 h-8 stroke-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        Welcome, {user?.firstName || "there"}!
                    </h2>
                    <p className="text-gray-500 mt-2">
                        To get started, please name your business workspace.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label
                            htmlFor="onboarding-business-name"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Business Name{" "}
                            <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="onboarding-business-name"
                            type="text"
                            value={businessName}
                            onChange={(e) => setBusinessName(e.target.value)}
                            placeholder="e.g. Acme Corp, Jane's Bakery"
                            className="outline-none bg-slate-50 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                            required
                            autoFocus
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !businessName.trim()}
                        className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 stroke-white" />
                                Setting up...
                            </>
                        ) : (
                            <>Continue</>
                        )}
                    </button>
                </form>

                <p className="text-xs text-center text-gray-400 mt-6">
                    You can change this later in settings.
                </p>
            </div>
        </div>
    );
};

export default BusinessOnboardingModal;

"use client";
import { AppState } from "@/store";
import { setBusinessDetails } from "@/store/slices/businessDataSlice";
import { formatPhoneNumber } from "@/utils/formatPhoneNumber";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import {
    Check,
    Loader2,
    Phone,
    X,
    AlertTriangle,
    User,
    Mail,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

// --- TYPES ---
type Plan = {
    id: string;
    name: string;
    price: number;
    description: string;
    features: {
        text: string;
        included: boolean;
        highlight?: string;
        bold?: boolean;
    }[];
    cta: string;
    popular: boolean;
    staffLimit: number;
};

type StaffMember = {
    id: string;
    name?: string;
    email: string;
    role: string;
    isOwner?: boolean;
    type: "USER" | "INVITE"; // Added to distinguish types
};

// --- DATA ---
const PLANS: Plan[] = [
    {
        id: "STARTER",
        name: "Starter",
        price: 0,
        description: "For side hustles just getting started",
        features: [
            { text: "Connect Your Own Paybill", included: true },
            { text: "1 Staff Account", included: true },
            { text: "Max 100 Transactions/mo", included: true },
            { text: "Auto-Filing Only", included: true, highlight: "warning" },
            { text: "No Data Export", included: false },
        ],
        cta: "Start Free",
        popular: false,
        staffLimit: 1,
    },
    {
        id: "STANDARD",
        name: "Standard",
        price: 1000,
        description: "For growing shops & hardware stores",
        features: [
            { text: "Unlimited Transactions", included: true },
            { text: "5 Staff Accounts", included: true },
            { text: "Connect Your Own Paybill", included: true },
            {
                text: "Auto-Filing Included",
                included: true,
                highlight: "success",
            },
            { text: "Salesense Branded Receipts", included: true },
        ],
        cta: "Select Standard",
        popular: true,
        staffLimit: 5,
    },
    {
        id: "PREMIUM",
        name: "Premium",
        price: 1500,
        description: "For businesses that need full control",
        features: [
            { text: "Unlimited Staff & Transactions", included: true },
            { text: "Remove 'Powered by Salesense'", included: true },
            { text: "Full Excel/CSV Data Export", included: true },
            {
                text: "Advanced Filing Control",
                included: true,
                highlight: "success",
            },
            { text: "Priority Phone Support", included: true },
        ],
        cta: "Select Premium",
        popular: false,
        staffLimit: 999,
    },
];

export default function PaymentPage() {
    const router = useRouter();
    const dispatch = useDispatch();

    const user = useSelector((state: AppState) => state.auth.user);
    const businessDetails = useSelector(
        (state: AppState) => state.businessData.businessDetails,
    );

    const [isFetching, setIsFetching] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

    // Payment State
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState("");

    // Downgrade State
    const [isDowngradeModalOpen, setIsDowngradeModalOpen] = useState(false);
    const [staffList, setStaffList] = useState<StaffMember[]>([]);
    const [loadingStaff, setLoadingStaff] = useState(false);
    const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);
    const [downgradeLoading, setDowngradeLoading] = useState(false);

    const fetchAttempted = useRef(false);

    useEffect(() => {
        const rehydrateBusiness = async () => {
            if (user && !businessDetails && !fetchAttempted.current) {
                fetchAttempted.current = true;
                setIsFetching(true);
                try {
                    const response = await axios.get(
                        `/api/business/${user.businessId}`,
                    );
                    if (response.data) {
                        dispatch(setBusinessDetails(response.data));
                    }
                } catch (error: any) {
                    // Silent fail for 404s
                } finally {
                    setTimeout(() => setIsFetching(false), 100);
                }
            }
        };
        rehydrateBusiness();
    }, [user, businessDetails, dispatch]);

    const currentPlanId = businessDetails?.subscription?.plan || null;

    // --- CHECK STAFF LOGIC ---
    const checkStaffForDowngrade = async (targetPlan: Plan) => {
        setLoadingStaff(true);
        try {
            const response = await axios.get("/api/auth/invite/get");
            const data = response.data;

            let combinedStaff: StaffMember[] = [];

            // Robust parsing: Handle if API returns { users: [], invitations: [] } or just flat array
            if (data.users || data.invitations) {
                const users = (data.users || []).map((u: any) => ({
                    ...u,
                    type: "USER" as const,
                }));
                const invites = (data.invitations || []).map((i: any) => ({
                    ...i,
                    type: "INVITE" as const,
                    name: i.email, // Invites might not have names, use email
                }));
                combinedStaff = [...users, ...invites];
            } else if (Array.isArray(data)) {
                // If the API returns a mixed array, try to detect based on 'token' or 'status'
                combinedStaff = data.map((item: any) => ({
                    ...item,
                    type: item.token ? "INVITE" : "USER",
                    name: item.name || item.email,
                }));
            }

            // Check if Total count > Plan Limit
            if (combinedStaff.length > targetPlan.staffLimit) {
                setStaffList(combinedStaff);

                // Pre-select Owner to avoid lockout
                const owner = combinedStaff.find(
                    (s) => s.email === user?.email,
                );
                if (owner) {
                    setSelectedStaffIds([owner.id]);
                }

                // Use targetPlan (the argument), NOT selectedPlan (state)
                setSelectedPlan(targetPlan);
                setIsDowngradeModalOpen(true);
                return false; // STOP: Open modal
            }

            return true; // OK: Proceed
        } catch (error) {
            console.error(error);
            toast.error("Failed to verify staff count. Please try again.");
            return false;
        } finally {
            setLoadingStaff(false);
        }
    };

    const handlePlanSelect = async (plan: Plan) => {
        if (plan.id === currentPlanId) {
            toast.info(`You are already on the ${plan.name} plan.`);
            return;
        }

        if (plan.price === 0) {
            const safeToDowngrade = await checkStaffForDowngrade(plan);
            if (safeToDowngrade) {
                processFreePlanSwitch(plan);
            }
        } else {
            setSelectedPlan(plan);
            setIsPaymentModalOpen(true);
        }
    };

    const processFreePlanSwitch = async (
        plan: Plan,
        staffToKeep?: string[],
    ) => {
        setDowngradeLoading(true);

        const setupFreeAccount = async () => {
            if (!user?.businessId) {
                // New Account Logic
                const formData = new FormData();
                const businessName = user?.firstName
                    ? `${user.firstName}'s Business`
                    : "My New Business";
                formData.append("name", businessName);

                await axios.post("/api/business", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                router.push("/settings");
                return "Welcome to Salesense Starter!";
            } else {
                // Downgrade Logic
                await axios.post("/api/subscription/downgrade", {
                    planId: plan.id,
                    activeStaffIds: staffToKeep,
                });

                // Refresh Data
                const res = await axios.get(`/api/business/${user.businessId}`);
                dispatch(setBusinessDetails(res.data));

                setIsDowngradeModalOpen(false);
                router.push("/settings");
                return `Successfully downgraded to ${plan.name} plan.`;
            }
        };

        toast.promise(setupFreeAccount(), {
            loading: "Updating your plan...",
            success: (data) => data,
            error: "Failed to update plan.",
            finally: () => setDowngradeLoading(false),
        });
    };

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setPaymentLoading(true);

        if (!selectedPlan) return;

        const formattedNumber = formatPhoneNumber(phoneNumber);
        if (!formattedNumber) {
            toast.error("Invalid phone number.");
            setPaymentLoading(false);
            return;
        }

        try {
            const response = await axios.post("/api/subscription/stk-push", {
                phoneNumber: formattedNumber,
                amount: selectedPlan.price,
                planId: selectedPlan.id,
                businessId: businessDetails?.id,
            });

            setIsPaymentModalOpen(false);
            toast.success("STK Push Sent!", {
                description: `Check your phone (${phoneNumber}) to enter your PIN.`,
                duration: 8000,
            });

            const checkoutRequestId = response.data.data.CheckoutRequestID;
            router.push(`/payment/checking?id=${checkoutRequestId}`);
        } catch (error: any) {
            console.error("Payment Error:", error);
            const message =
                error.response?.data?.error || "Payment request failed.";
            toast.error(message);
        } finally {
            setPaymentLoading(false);
        }
    };

    const toggleStaffSelection = (staffId: string) => {
        if (selectedStaffIds.includes(staffId)) {
            // Deselect
            setSelectedStaffIds((prev) => prev.filter((id) => id !== staffId));
        } else {
            // Select (Check Limit)
            if (
                selectedPlan &&
                selectedStaffIds.length >= selectedPlan.staffLimit
            ) {
                toast.warning(
                    `You can only select ${selectedPlan.staffLimit} active staff member(s).`,
                );
                return;
            }
            setSelectedStaffIds((prev) => [...prev, staffId]);
        }
    };

    if (isFetching || loadingStaff) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin h-10 w-10 text-green-600" />
                    <p className="text-gray-500 animate-pulse text-sm font-medium">
                        {loadingStaff
                            ? "Verifying staff limits..."
                            : "Syncing your plan details..."}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                        Select Your Plan
                    </h2>
                    <p className="mt-4 text-xl text-gray-600">
                        Choose the plan that fits your business stage.
                    </p>
                    {currentPlanId && (
                        <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-100 text-green-700 text-sm font-bold border border-green-200">
                            Active Plan: {currentPlanId}
                        </div>
                    )}
                </div>

                <div className="grid md:grid-cols-3 gap-8 items-start">
                    {PLANS.map((plan) => {
                        const isCurrent = plan.id === currentPlanId;
                        return (
                            <motion.div
                                key={plan.id}
                                whileHover={{ y: -5 }}
                                className={`relative bg-white rounded-2xl shadow-sm border ${
                                    isCurrent
                                        ? "border-green-500 ring-2 ring-green-500/20 shadow-lg"
                                        : plan.popular
                                          ? "border-green-500 shadow-md ring-1 ring-green-500"
                                          : "border-gray-200"
                                } flex flex-col p-8 h-full`}
                            >
                                {plan.popular && !isCurrent && (
                                    <div className="absolute top-0 right-1/2 transform translate-x-1/2 -translate-y-1/2 bg-green-600 text-white px-4 py-1 rounded-full text-sm font-medium shadow-sm">
                                        Most Popular
                                    </div>
                                )}

                                <div className="mb-6">
                                    <h3 className="text-xl font-semibold text-gray-900">
                                        {plan.name}
                                    </h3>
                                    <p className="text-gray-500 text-sm mt-2 min-h-[40px]">
                                        {plan.description}
                                    </p>
                                </div>

                                <div className="mb-6">
                                    <span className="text-4xl font-bold text-gray-900">
                                        {plan.price === 0
                                            ? "Free"
                                            : `KSh ${plan.price.toLocaleString()}`}
                                    </span>
                                    {plan.price > 0 && (
                                        <span className="text-gray-500">
                                            /mo
                                        </span>
                                    )}
                                </div>

                                <ul className="space-y-4 mb-8 flex-1">
                                    {plan.features.map((feature, idx) => (
                                        <li
                                            key={idx}
                                            className="flex items-start"
                                        >
                                            {feature.included ? (
                                                <Check
                                                    className={`h-5 w-5 mr-3 shrink-0 ${feature.highlight === "warning" ? "text-orange-500" : feature.highlight === "success" ? "text-green-500" : "text-green-500"}`}
                                                />
                                            ) : (
                                                <X className="h-5 w-5 text-gray-300 mr-3 shrink-0" />
                                            )}
                                            <span
                                                className={`text-sm ${!feature.included ? "text-gray-400" : "text-gray-600"}`}
                                            >
                                                {feature.text}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={() => handlePlanSelect(plan)}
                                    disabled={isCurrent}
                                    className={`w-full py-3 px-4 rounded-lg font-bold transition-all duration-200 ${
                                        isCurrent
                                            ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                                            : plan.popular
                                              ? "bg-green-600 text-white hover:bg-green-700 shadow-md"
                                              : "bg-white text-green-600 border border-green-600 hover:bg-green-50"
                                    }`}
                                >
                                    {isCurrent ? "Active Plan" : plan.cta}
                                </button>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* --- PAYMENT MODAL --- */}
            <AnimatePresence>
                {isPaymentModalOpen && selectedPlan && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden z-10"
                        >
                            <div className="p-6 text-center border-b border-gray-100">
                                <h3 className="text-2xl font-bold text-gray-900">
                                    {currentPlanId
                                        ? "Confirm Upgrade"
                                        : "Confirm Payment"}
                                </h3>
                                <p className="text-gray-500 mt-1 italic">
                                    Subscribe to {selectedPlan.name}
                                </p>
                                <div className="mt-4 text-3xl font-black text-green-600">
                                    KSh {selectedPlan.price.toLocaleString()}
                                </div>
                            </div>
                            <div className="p-8">
                                <form
                                    onSubmit={handlePayment}
                                    className="space-y-6"
                                >
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                                            M-Pesa Phone Number
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Phone
                                                    size={18}
                                                    className="h-5 w-5 stroke-green-500"
                                                />
                                            </div>
                                            <input
                                                type="tel"
                                                required
                                                placeholder="07XXXXXXXX"
                                                value={phoneNumber}
                                                onChange={(e) =>
                                                    setPhoneNumber(
                                                        e.target.value,
                                                    )
                                                }
                                                className="block w-full pl-10 pr-3 py-3 bg-slate-50 outline-none border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={
                                            paymentLoading || !phoneNumber
                                        }
                                        className="w-full flex justify-center items-center py-4 px-4 rounded-xl shadow-lg text-sm font-black text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 transition-all shadow-green-100"
                                    >
                                        {paymentLoading ? (
                                            <Loader2 className="animate-spin stroke-white mr-2 h-4 w-4" />
                                        ) : (
                                            `Pay KSh ${selectedPlan.price.toLocaleString()}`
                                        )}
                                    </button>
                                </form>
                                <button
                                    onClick={() => setIsPaymentModalOpen(false)}
                                    className="mt-4 w-full text-center text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* --- DOWNGRADE SELECTION MODAL --- */}
            <AnimatePresence>
                {isDowngradeModalOpen && selectedPlan && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden z-10"
                        >
                            <div className="p-6 bg-red-50 border-b border-red-100">
                                <div className="flex items-center gap-3 text-red-600 mb-2">
                                    <AlertTriangle size={24} />
                                    <h3 className="text-xl font-bold">
                                        Downgrade Action Required
                                    </h3>
                                </div>
                                <p className="text-gray-700 text-sm">
                                    The <strong>{selectedPlan.name}</strong>{" "}
                                    plan allows{" "}
                                    <strong>{selectedPlan.staffLimit}</strong>{" "}
                                    staff member(s). You currently have{" "}
                                    <strong>{staffList.length}</strong> (active
                                    users + pending invites).
                                </p>
                                <p className="text-xs text-red-500 mt-2 font-medium">
                                    Please uncheck staff or invites to meet the
                                    limit. Active users not selected will be
                                    suspended.
                                </p>
                            </div>

                            <div className="p-6 max-h-[300px] overflow-y-auto">
                                <div className="space-y-3">
                                    {staffList.map((staff) => {
                                        const isSelected =
                                            selectedStaffIds.includes(staff.id);
                                        const isMaxReached =
                                            selectedStaffIds.length >=
                                            selectedPlan.staffLimit;
                                        // Disable logic: If limit reached AND this item isn't selected, you can't select it.
                                        const isDisabled =
                                            isMaxReached && !isSelected;

                                        const isInvite =
                                            staff.type === "INVITE";

                                        return (
                                            <div
                                                key={staff.id}
                                                onClick={() =>
                                                    !isDisabled &&
                                                    toggleStaffSelection(
                                                        staff.id,
                                                    )
                                                }
                                                className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                                                    isSelected
                                                        ? "border-green-500 bg-green-50 ring-1 ring-green-500"
                                                        : "border-gray-200 hover:border-gray-300"
                                                } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={`w-10 h-10 rounded-full flex items-center justify-center ${isSelected ? "bg-green-200 text-green-600" : "bg-gray-100 text-gray-500"}`}
                                                    >
                                                        {isInvite ? (
                                                            <Mail size={18} />
                                                        ) : (
                                                            <User size={20} />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-semibold text-gray-900">
                                                                {staff.name ||
                                                                    "Staff Member"}
                                                            </p>
                                                            {isInvite && (
                                                                <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full font-bold">
                                                                    PENDING
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-gray-500">
                                                            {staff.email}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div
                                                    className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                                                        isSelected
                                                            ? "bg-green-600 border-green-600"
                                                            : "border-gray-300"
                                                    }`}
                                                >
                                                    {isSelected && (
                                                        <Check
                                                            size={14}
                                                            className="stroke-white"
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-4">
                                <button
                                    onClick={() =>
                                        setIsDowngradeModalOpen(false)
                                    }
                                    className="flex-1 py-3 px-4 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() =>
                                        processFreePlanSwitch(
                                            selectedPlan,
                                            selectedStaffIds,
                                        )
                                    }
                                    disabled={
                                        downgradeLoading ||
                                        selectedStaffIds.length === 0
                                    }
                                    className="flex-1 py-3 px-4 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                                >
                                    {downgradeLoading ? (
                                        <Loader2 className="animate-spin stroke-white h-4 w-4" />
                                    ) : (
                                        "Confirm Downgrade"
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

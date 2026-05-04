"use client";

import { AppState } from "@/store";
import { setBusinessDetails } from "@/store/slices/businessDataSlice";
import { formatPhoneNumber } from "@/utils/formatPhoneNumber";
import { apiClient } from "@/utils/apiClient";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import PaymentModal from "@/components/modals/PaymentModal";
import DowngradeModal from "@/components/modals/DowngradeModal";
import { isTauri } from "@/utils/tauri";

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
    storeLimit: number;
};

type StaffMember = {
    id: string;
    name?: string;
    email: string;
    role: string;
    isOwner?: boolean;
    type: "USER" | "INVITE";
};

type StoreInfo = {
    id: string;
    name: string;
    isActive: boolean;
    address?: string | null;
};

const PLANS: Plan[] = [
    {
        id: "STARTER",
        name: "Starter",
        price: 0,
        description: "For side hustles just getting started",
        features: [
            { text: "Connect Your Own Paybill", included: true },
            { text: "1 Staff Account", included: true },
            { text: "1 Branch / Store", included: true },
            { text: "Max 100 Transactions/mo", included: true },
            { text: "Auto-Filing Only", included: true, highlight: "warning" },
            { text: "No Data Export", included: false },
        ],
        cta: "Start Free",
        popular: false,
        staffLimit: 1,
        storeLimit: 1,
    },
    {
        id: "STANDARD",
        name: "Standard",
        price: 1000,
        description: "For growing shops & hardware stores",
        features: [
            { text: "Unlimited Transactions", included: true },
            { text: "5 Staff Accounts", included: true },
            { text: "3 Branches / Stores", included: true },
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
        storeLimit: 3,
    },
    {
        id: "PREMIUM",
        name: "Premium",
        price: 1500,
        description: "For businesses that need full control",
        features: [
            { text: "Unlimited Staff & Transactions", included: true },
            { text: "Up to 10 Branches / Stores", included: true },
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
        storeLimit: 10,
    },
];

export default function PaymentPage() {
    const dispatch = useDispatch();
    const router = useRouter();
    const user = useSelector((state: AppState) => state.auth.user);
    const businessDetails = useSelector(
        (state: AppState) => state.businessData.businessDetails,
    );

    const [isFetching, setIsFetching] = useState(false);
    const [loadingLimits, setLoadingLimits] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isDowngradeModalOpen, setIsDowngradeModalOpen] = useState(false);
    const [downgradeStep, setDowngradeStep] = useState<"STAFF" | "STORES">(
        "STAFF",
    );

    const [staffList, setStaffList] = useState<StaffMember[]>([]);
    const [storeList, setStoreList] = useState<StoreInfo[]>([]);
    const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);
    const [selectedStoreIds, setSelectedStoreIds] = useState<string[]>([]);
    const [effectiveStaffLimit, setEffectiveStaffLimit] = useState(0);
    const [effectiveStoreLimit, setEffectiveStoreLimit] = useState(0);
    const [downgradeLoading, setDowngradeLoading] = useState(false);

    const [phoneNumber, setPhoneNumber] = useState("");
    const [paymentLoading, setPaymentLoading] = useState(false);

    const fetchAttempted = useRef(false);

    useEffect(() => {
        const rehydrateBusiness = async () => {
            if (user && !businessDetails && !fetchAttempted.current) {
                fetchAttempted.current = true;
                setIsFetching(true);
                try {
                    const response = await apiClient.get(
                        `/business/${user.businessId}`,
                    );
                    if (response.data) {
                        dispatch(setBusinessDetails(response.data));
                    }
                } catch (error: any) {
                    // Silent fail
                } finally {
                    setTimeout(() => setIsFetching(false), 100);
                }
            }
        };
        rehydrateBusiness();
    }, [user, businessDetails, dispatch]);

    if (isTauri()) return null;

    const currentPlanId = businessDetails?.subscription?.plan || null;
    const currentPlanLimit =
        PLANS.find((p) => p.id === currentPlanId) || PLANS[0];

    const checkLimitsForDowngrade = async (targetPlan: Plan) => {
        if (!user?.businessId) return true;

        setLoadingLimits(true);
        try {
            const [staffRes, storesRes] = await Promise.all([
                apiClient.get("/auth/invite/get"),
                apiClient.get(`/business/${user.businessId}/stores`),
            ]);

            const staffData = staffRes.data;
            const storesData = (storesRes.data as StoreInfo[]).filter(
                (s) => s.isActive !== false,
            );

            let allSeats: StaffMember[] = [];

            if (Array.isArray(staffData)) {
                allSeats = staffData.map((item: any) => ({
                    id: item.id,
                    email: item.email,
                    name: item.name || item.email,
                    role: item.role,
                    type: item.status === "accepted" ? "USER" : "INVITE",
                }));
            } else if (
                staffData &&
                (staffData.users || staffData.invitations)
            ) {
                const users = (staffData.users || [])
                    .filter((u: any) => u.status !== "inactive")
                    .map((u: any) => ({ ...u, type: "USER" }));
                const invites = (staffData.invitations || []).map((i: any) => ({
                    ...i,
                    type: "INVITE",
                }));
                allSeats = [...users, ...invites];
            }

            const isOwnerInList = allSeats.some((s) => s.email === user?.email);
            let totalHeadcount = allSeats.length;
            if (!isOwnerInList) totalHeadcount += 1;

            const slotsForList = isOwnerInList
                ? targetPlan.staffLimit
                : Math.max(0, targetPlan.staffLimit - 1);
            const staffLimitReached = totalHeadcount > targetPlan.staffLimit;
            const storeLimitReached = storesData.length > targetPlan.storeLimit;

            if (staffLimitReached || storeLimitReached) {
                setStaffList(allSeats);
                setEffectiveStaffLimit(slotsForList);
                setStoreList(storesData);
                setEffectiveStoreLimit(targetPlan.storeLimit);

                if (isOwnerInList) {
                    const owner = allSeats.find((s) => s.email === user?.email);
                    if (owner) setSelectedStaffIds([owner.id]);
                } else {
                    setSelectedStaffIds([]);
                }

                if (staffLimitReached) {
                    setDowngradeStep("STAFF");
                } else {
                    setDowngradeStep("STORES");
                    setSelectedStaffIds(allSeats.map((s) => s.id));
                }

                if (!storeLimitReached) {
                    setSelectedStoreIds(storesData.map((s) => s.id));
                } else {
                    setSelectedStoreIds([]);
                }

                setSelectedPlan(targetPlan);
                setIsDowngradeModalOpen(true);
                return false;
            }

            return true;
        } catch (error) {
            toast.error("Failed to verify limits.", { duration: 5000 });
            return false;
        } finally {
            setLoadingLimits(false);
        }
    };

    const handlePlanSelect = async (plan: Plan) => {
        if (plan.id === currentPlanId) {
            toast.info(`You are already on the ${plan.name} plan.`);
            return;
        }

        const isWithinLimits = await checkLimitsForDowngrade(plan);
        if (!isWithinLimits) return;

        if (plan.price === 0) {
            processFreePlanSwitch(plan);
        } else {
            setSelectedPlan(plan);
            setIsPaymentModalOpen(true);
        }
    };

    const handleDowngradeNextStep = () => {
        if (
            downgradeStep === "STAFF" &&
            storeList.length > (selectedPlan?.storeLimit || 0)
        ) {
            setDowngradeStep("STORES");
        } else {
            handleDowngradeConfirmation();
        }
    };

    const handleDowngradeConfirmation = () => {
        if (!selectedPlan) return;

        if (selectedPlan.price === 0) {
            processFreePlanSwitch(
                selectedPlan,
                selectedStaffIds,
                selectedStoreIds,
            );
        } else {
            setIsDowngradeModalOpen(false);
            setIsPaymentModalOpen(true);
        }
    };

    const processFreePlanSwitch = async (
        plan: Plan,
        staffToKeep?: string[],
        storesToKeep?: string[],
    ) => {
        setDowngradeLoading(true);

        const setupFreeAccount = async () => {
            if (!user?.businessId) {
                const formData = new FormData();
                const businessName = user?.firstName
                    ? `${user.firstName}'s Business`
                    : "My New Business";
                formData.append("name", businessName);

                const response = await apiClient.post("/business", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });

                const newBusiness = response.data;
                const formattedBusinessDetails = {
                    id: newBusiness.id,
                    name: newBusiness.name,
                    email: newBusiness.email || "",
                    address: newBusiness.address || "",
                    logo: newBusiness.logo || "",
                    phoneNumber: newBusiness.phoneNumber || "",
                    mpesaConsumerKey: newBusiness.mpesaConsumerKey || "",
                    mpesaConsumerSecret: newBusiness.mpesaConsumerSecret || "",
                    mpesaPassKey: newBusiness.mpesaPassKey || "",
                    mpesaShortCode: newBusiness.mpesaShortCode || "",
                    subscription: newBusiness.subscription || {
                        plan: "STARTER" as const,
                        status: "ACTIVE",
                        currentPeriodStart: new Date().toISOString(),
                        currentPeriodEnd: new Date(
                            new Date().setMonth(new Date().getMonth() + 1),
                        ).toISOString(),
                    },
                    usage: newBusiness.usage || {
                        transactionCount: 0,
                        staffCount: 1,
                        isLimitReached: false,
                        canExportData: false,
                        hasCustomBranding: false,
                    },
                    tenantMode: newBusiness.tenantMode || "SHARED",
                };

                dispatch(setBusinessDetails(formattedBusinessDetails));
                router.push("/products");
                return "Welcome to Salesense Starter!";
            } else {
                await apiClient.post("/subscription/downgrade", {
                    planId: plan.id,
                    activeStaffIds: staffToKeep,
                    activeStoreIds: storesToKeep,
                });

                const res = await apiClient.get(`/business/${user.businessId}`);
                dispatch(setBusinessDetails(res.data));

                setIsDowngradeModalOpen(false);
                router.push("/products");
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
            const response = await apiClient.post("/subscription/stk-push", {
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
            const message =
                error.response?.data?.error || "Payment request failed.";
            toast.error(message, { duration: 5000 });
        } finally {
            setPaymentLoading(false);
        }
    };

    const toggleStaffSelection = (staffId: string) => {
        if (selectedStaffIds.includes(staffId)) {
            setSelectedStaffIds((prev) => prev.filter((id) => id !== staffId));
        } else {
            if (
                selectedPlan &&
                selectedStaffIds.length >= effectiveStaffLimit
            ) {
                toast.warning(
                    `You can only select ${effectiveStaffLimit} member(s).`,
                );
                return;
            }
            setSelectedStaffIds((prev) => [...prev, staffId]);
        }
    };

    const toggleStoreSelection = (storeId: string) => {
        if (selectedStoreIds.includes(storeId)) {
            setSelectedStoreIds((prev) => prev.filter((id) => id !== storeId));
        } else {
            if (
                selectedPlan &&
                selectedStoreIds.length >= effectiveStoreLimit
            ) {
                toast.warning(
                    `You can only select ${effectiveStoreLimit} store(s).`,
                );
                return;
            }
            setSelectedStoreIds((prev) => [...prev, storeId]);
        }
    };

    if (isFetching || loadingLimits) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                    <p className="text-gray-500 animate-pulse text-sm font-medium">
                        {loadingLimits
                            ? "Verifying plan limits..."
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
                        <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-100 text-green-500 text-sm font-bold border border-green-200">
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
                                className={`relative bg-white rounded-lg shadow-sm border ${
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
                                              : "bg-white text-green-500 border border-green-600 hover:bg-green-50"
                                    }`}
                                >
                                    {isCurrent ? "Active Plan" : plan.cta}
                                </button>
                            </motion.div>
                        );
                    })}
                </div>

                <PaymentModal
                    isOpen={isPaymentModalOpen}
                    onClose={() => setIsPaymentModalOpen(false)}
                    plan={selectedPlan}
                    currentPlanId={currentPlanId}
                    phoneNumber={phoneNumber}
                    setPhoneNumber={setPhoneNumber}
                    handlePayment={handlePayment}
                    paymentLoading={paymentLoading}
                />

                <DowngradeModal
                    isOpen={isDowngradeModalOpen}
                    onClose={() => setIsDowngradeModalOpen(false)}
                    plan={selectedPlan}
                    staffList={staffList}
                    storeList={storeList}
                    effectiveStaffLimit={effectiveStaffLimit}
                    effectiveStoreLimit={effectiveStoreLimit}
                    selectedStaffIds={selectedStaffIds}
                    toggleStaffSelection={toggleStaffSelection}
                    selectedStoreIds={selectedStoreIds}
                    toggleStoreSelection={toggleStoreSelection}
                    downgradeStep={downgradeStep}
                    handleDowngradeNextStep={handleDowngradeNextStep}
                    downgradeLoading={downgradeLoading}
                    userEmail={user?.email}
                />
            </div>
        </div>
    );
}

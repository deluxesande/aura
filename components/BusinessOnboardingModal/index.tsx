"use client";
import React, { useState } from "react";
import { apiClient } from "@/utils/apiClient";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { AppState, AppDispatch } from "@/store";
import { setBusiness } from "@/store/slices/businessSlice";
import { setUser } from "@/store/slices/authSlice";
import { setBusinessDetails } from "@/store/slices/businessDataSlice";
import { fetchUser } from "@/store/auth/authThunks";
import {
    Building2,
    Loader2,
    Store,
    CheckCircle2,
    ChevronRight,
    ChevronLeft,
    Database,
    ShieldCheck,
    Globe,
    ExternalLink,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

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
    const [step, setStep] = useState(1);
    const [businessName, setBusinessName] = useState("");
    const [tenantMode, setTenantMode] = useState<"SHARED" | "BYODB">("SHARED");
    const [tenantDatabaseUrl, setTenantDatabaseUrl] = useState("");
    const [isTestingConnection, setIsTestingConnection] = useState(false);
    const [newStore, setNewStore] = useState({ name: "", address: "" });
    const [isLoading, setIsLoading] = useState(false);
    const [isFinished, setIsFinished] = useState(false);

    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();

    const user = useSelector(
        (state: AppState) => state.auth.user,
    ) as UserState | null;

    const shouldShowInitial =
        (user && !user.businessId) ||
        user?.Business?.name === "My New Business";

    if (!shouldShowInitial || isFinished) return null;

    const handleNextStep = async () => {
        if (step === 1 && !businessName.trim()) {
            toast.error("Please enter a business name");
            return;
        }
        if (step === 2 && tenantMode === "BYODB") {
            if (!tenantDatabaseUrl.trim()) {
                toast.error("Please enter your PostgreSQL connection string");
                return;
            }
            // Test connection before proceeding
            setIsTestingConnection(true);
            try {
                await apiClient.post("/business/test-connection", {
                    url: tenantDatabaseUrl,
                });
                toast.success("Database connection successful!");
            } catch (error: any) {
                toast.error(
                    error.response?.data?.error ||
                        "Failed to connect to database",
                );
                setIsTestingConnection(false);
                return;
            } finally {
                setIsTestingConnection(false);
            }
        }
        if (step === 6 && !newStore.name.trim()) {
            toast.error("Please enter a branch name");
            return;
        }
        setStep((prev) => prev + 1);
    };

    const handlePrevStep = () => {
        setStep((prev) => prev - 1);
    };

    const handleFinish = async () => {
        setIsLoading(true);
        try {
            const businessId = user?.businessId;
            if (!businessId) throw new Error("Business context not found. Please refresh.");

            // 1. Update business profile with onboarding details, including BYODB settings
            const response = await apiClient.put(
                `/business/${businessId}`,
                {
                    name: businessName,
                    tenantMode,
                    tenantDatabaseUrl:
                        tenantMode === "BYODB" ? tenantDatabaseUrl : undefined,
                },
                { headers: { "Content-Type": "application/json" } },
            );
            const updatedBusiness = response.data;

            // 2. Initialize the first branch (gracefully handling existing branches)
            try {
                await apiClient.post("/stores/create", newStore);
            } catch (storeError: any) {
                const errorMsg = storeError.response?.data?.error || "";
                if (errorMsg.includes("Limit reached") || errorMsg.includes("exists")) {
                    console.log("Branch already exists, skipping initial setup...");
                } else {
                    console.error("Branch initialization error:", storeError);
                }
            }

            // 3. Synchronize global state
            dispatch(
                setBusiness({
                    id: updatedBusiness.id,
                    name: updatedBusiness.name,
                    logo: updatedBusiness.logo,
                }),
            );

            await dispatch(fetchUser());
            
            try {
                const res = await apiClient.get(`/business/${businessId}`);
                dispatch(setBusinessDetails(res.data));
            } catch (e) {
                console.warn("Full business details sync failed", e);
            }

            toast.success("Welcome to SaleSense!");
            setIsFinished(true);
            router.refresh();
        } catch (error: any) {
            toast.error(
                error.response?.data?.error || "Failed to finalize business setup",
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg bg-white rounded-lg shadow-2xl border border-gray-100 overflow-hidden relative flex flex-col min-h-[500px]">
                {/* Background Pattern */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03] z-0">
                    <div className="absolute -top-[10%] -left-[10%] w-[80%] h-[40%] rounded-full bg-green-900/20 blur-[60px]" />
                    <svg
                        className="absolute inset-0 w-full h-full"
                        viewBox="0 0 100 100"
                        fill="none"
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

                {/* Progress Bar (Updated to 7 steps) */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gray-100 flex z-20">
                    {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                        <div
                            key={i}
                            className={`flex-1 h-full transition-all duration-500 ${i <= step ? "bg-green-500" : "bg-transparent"}`}
                        />
                    ))}
                </div>

                <div className="p-8 md:p-10 flex-grow flex flex-col justify-center relative z-10">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="flex flex-col items-center text-center w-full"
                        >
                            {step === 1 && (
                                <div className="flex flex-col items-center w-full">
                                    <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-5">
                                        <Building2 className="w-6 h-6 stroke-green-500" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                        Welcome, {user?.firstName || "there"}!
                                    </h2>
                                    <p className="text-sm text-gray-500 mb-8 max-w-sm">
                                        Let&apos;s start by giving your
                                        workspace a name. This will appear on
                                        your customer invoices.
                                    </p>
                                    <div className="w-full text-left">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                            Business Name
                                        </label>
                                        <input
                                            type="text"
                                            value={businessName}
                                            onChange={(e) =>
                                                setBusinessName(e.target.value)
                                            }
                                            placeholder="e.g. Acme Corp"
                                            className="w-full px-4 py-3 rounded-lg outline-none bg-slate-50 focus:bg-white border border-gray-200 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm font-medium"
                                            autoFocus
                                        />
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="flex flex-col items-center w-full">
                                    <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-5">
                                        <Database className="w-6 h-6 stroke-green-500" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                        Data Storage
                                    </h2>
                                    <p className="text-sm text-gray-500 mb-6 max-w-sm">
                                        Where would you like to store your
                                        operational data?
                                    </p>

                                    <div className="grid grid-cols-1 gap-3 w-full">
                                        <button
                                            onClick={() =>
                                                setTenantMode("SHARED")
                                            }
                                            className={`flex items-start gap-4 p-4 rounded-xl border transition-all text-left ${tenantMode === "SHARED" ? "bg-green-50 border-green-500 ring-1 ring-green-500" : "bg-white border-gray-200 hover:border-gray-300"}`}
                                        >
                                            <div
                                                className={`mt-1 w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${tenantMode === "SHARED" ? "border-green-500 bg-green-500" : "border-gray-300"}`}
                                            >
                                                {tenantMode === "SHARED" && (
                                                    <div className="w-2 h-2 rounded-full bg-white" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-bold text-gray-900">
                                                        Shared Cloud (Starter)
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 leading-relaxed">
                                                    Standard secure hosting on
                                                    SaleSense&apos;s global
                                                    infrastructure. Perfect for
                                                    most small to medium
                                                    businesses.
                                                </p>
                                            </div>
                                        </button>

                                        <button
                                            onClick={() =>
                                                setTenantMode("BYODB")
                                            }
                                            className={`flex items-start gap-4 p-4 rounded-xl border transition-all text-left ${tenantMode === "BYODB" ? "bg-green-50 border-green-500 ring-1 ring-green-500" : "bg-white border-gray-200 hover:border-gray-300"}`}
                                        >
                                            <div
                                                className={`mt-1 w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${tenantMode === "BYODB" ? "border-green-500 bg-green-500" : "border-gray-300"}`}
                                            >
                                                {tenantMode === "BYODB" && (
                                                    <div className="w-2 h-2 rounded-full bg-white" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-bold text-gray-900">
                                                        Bring Your Own DB
                                                        (Enterprise)
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 leading-relaxed">
                                                    Complete data sovereignty.
                                                    Store your proprietary ERP
                                                    data on your own private
                                                    PostgreSQL instance.
                                                </p>
                                            </div>
                                        </button>
                                    </div>

                                    {tenantMode === "BYODB" && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{
                                                opacity: 1,
                                                height: "auto",
                                            }}
                                            className="w-full mt-4 text-left"
                                        >
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                                PostgreSQL Connection URL
                                            </label>
                                            <input
                                                type="text"
                                                value={tenantDatabaseUrl}
                                                onChange={(e) =>
                                                    setTenantDatabaseUrl(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="postgresql://user:password@host:port/dbname"
                                                className="w-full px-4 py-3 rounded-lg outline-none bg-slate-50 focus:bg-white border border-gray-200 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-xs font-mono"
                                            />
                                            <p className="mt-2 text-[10px] text-gray-400 flex items-center gap-1">
                                                <ExternalLink className="w-3 h-3" />
                                                Ensure your database allows
                                                connections from SaleSense IPs.
                                            </p>
                                        </motion.div>
                                    )}
                                </div>
                            )}

                            {step === 3 && (
                                <div className="flex flex-col items-center w-full">
                                    <div className="mb-5">
                                        <Image
                                            src="/images/M-PESA-logo-2.png"
                                            alt="M-Pesa"
                                            width={180}
                                            height={72}
                                            className="h-auto w-auto object-contain"
                                        />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                        Seamless Payments
                                    </h2>
                                    <p className="text-sm text-gray-500 mb-8 max-w-sm">
                                        Integrated M-Pesa payments with
                                        automatic reconciliation. Funds settle
                                        directly to your Till or Paybill.
                                    </p>

                                    <div className="w-full bg-slate-50 rounded-lg p-3 border border-gray-200">
                                        <div className="space-y-2">
                                            {[1, 2].map((i) => (
                                                <div
                                                    key={i}
                                                    className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-100 shadow-sm"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-[10px] font-bold text-green-500">
                                                            MP
                                                        </div>
                                                        <div className="text-left">
                                                            <div className="h-2 w-16 bg-gray-200 rounded mb-1.5"></div>
                                                            <div className="h-1.5 w-10 bg-gray-100 rounded"></div>
                                                        </div>
                                                    </div>
                                                    <span className="text-xs font-bold text-green-500">
                                                        + KES 1,250
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 4 && (
                                <div className="flex flex-col items-center w-full">
                                    <div className="mb-5">
                                        <Image
                                            src="/images/kra-seeklogo.png"
                                            alt="KRA"
                                            width={180}
                                            height={72}
                                            className="h-auto w-auto object-contain"
                                        />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                        Tax & Compliance
                                    </h2>
                                    <p className="text-sm text-gray-500 mb-8 max-w-sm">
                                        We handle the heavy lifting of
                                        compliance by auto-calculating your
                                        taxes and preparing monthly TOT returns.
                                    </p>
                                    <div className="flex flex-col gap-2 w-full text-left">
                                        {[
                                            "Automatic TOT Calculation",
                                            "Audit-Ready Sales Reports",
                                            "Instant Invoice Generation",
                                        ].map((item, i) => (
                                            <div
                                                key={i}
                                                className="flex items-center gap-3 bg-white px-4 py-3 rounded-lg border border-gray-200 shadow-sm"
                                            >
                                                <CheckCircle2 className="w-4 h-4 text-gray-400 shrink-0" />
                                                <span className="text-sm font-medium text-gray-700">
                                                    {item}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {step === 5 && (
                                <div className="flex flex-col items-center w-full">
                                    <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-5">
                                        <Store className="w-6 h-6 stroke-green-500" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                        Multi-Branch Setup
                                    </h2>
                                    <p className="text-sm text-gray-500 mb-8 max-w-sm">
                                        Whether you have one shop or ten, manage
                                        stock levels and track performance
                                        across all locations.
                                    </p>
                                    <div className="flex items-center justify-center gap-4 w-full p-6 bg-slate-50 border border-gray-200 rounded-lg">
                                        <div className="flex flex-col items-center">
                                            <div className="w-12 h-12 bg-white border border-gray-300 rounded-lg flex items-center justify-center mb-2 shadow-sm">
                                                <Store className="w-5 h-5 stroke-green-500" />
                                            </div>
                                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                                HQ
                                            </span>
                                        </div>
                                        <div className="w-12 h-[2px] bg-gray-300 mb-5"></div>
                                        <div className="flex flex-col items-center">
                                            <div className="w-12 h-12 bg-white border border-gray-300 rounded-lg flex items-center justify-center mb-2 shadow-sm">
                                                <Store className="w-5 h-5 stroke-green-500" />
                                            </div>
                                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                                Branch
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* NEW STORE CREATION STEP */}
                            {step === 6 && (
                                <div className="flex flex-col items-center w-full">
                                    <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-5">
                                        <Store className="w-6 h-6 stroke-green-500" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                        Create Your First Branch
                                    </h2>
                                    <p className="text-sm text-gray-500 mb-8 max-w-sm">
                                        Set up your primary location to start
                                        managing inventory and tracking sales.
                                    </p>
                                    <div className="w-full text-left space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                                Branch Name
                                            </label>
                                            <input
                                                type="text"
                                                value={newStore.name}
                                                onChange={(e) =>
                                                    setNewStore({
                                                        ...newStore,
                                                        name: e.target.value,
                                                    })
                                                }
                                                placeholder="e.g. Main Shop, Westlands Branch"
                                                className="w-full px-4 py-3 rounded-lg outline-none bg-slate-50 focus:bg-white border border-gray-200 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm font-medium"
                                                autoFocus
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                                Address / Location
                                            </label>
                                            <input
                                                type="text"
                                                value={newStore.address}
                                                onChange={(e) =>
                                                    setNewStore({
                                                        ...newStore,
                                                        address: e.target.value,
                                                    })
                                                }
                                                placeholder="e.g. Kimathi Street, Nairobi"
                                                className="w-full px-4 py-3 rounded-lg outline-none bg-slate-50 focus:bg-white border border-gray-200 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm font-medium"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 7 && (
                                <div className="flex flex-col items-center w-full">
                                    <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-5">
                                        <CheckCircle2 className="w-6 h-6 stroke-green-500" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                        Ready to Grow
                                    </h2>
                                    <p className="text-sm text-gray-500 mb-8 max-w-sm">
                                        Your workspace{" "}
                                        <span className="font-bold text-gray-900">
                                            {businessName}
                                        </span>{" "}
                                        is ready. Let&apos;s head to your
                                        dashboard.
                                    </p>
                                    <div className="bg-slate-50 p-5 rounded-lg border border-gray-200 w-full text-left">
                                        <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">
                                            Next Steps
                                        </h4>
                                        <ul className="text-sm font-medium text-gray-600 space-y-2.5">
                                            <li className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                                                Add your first product
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                                                Record your first sale
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                                                Invite team members
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Footer Actions */}
                <div className="p-5 border-t border-gray-100 bg-gray-50/50 relative z-10 flex items-center justify-between">
                    {step > 1 ? (
                        <button
                            onClick={handlePrevStep}
                            className="px-4 py-2.5 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1.5"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Back
                        </button>
                    ) : (
                        <div /> // Placeholder to keep the layout balanced
                    )}

                    {step < 7 ? (
                        <button
                            onClick={handleNextStep}
                            disabled={isTestingConnection}
                            className="px-6 py-2.5 text-sm font-bold text-white bg-green-500 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-1.5 ml-auto disabled:opacity-50"
                        >
                            {isTestingConnection ? (
                                <>
                                    <Loader2 className="animate-spin w-4 h-4 stroke-white" />
                                    Testing Connection...
                                </>
                            ) : (
                                <>
                                    Continue
                                    <ChevronRight className="stroke-white w-4 h-4" />
                                </>
                            )}
                        </button>
                    ) : (
                        <button
                            onClick={handleFinish}
                            disabled={isLoading}
                            className="px-6 py-2.5 text-sm font-bold text-white bg-green-500 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 ml-auto disabled:opacity-50"
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin w-4 h-4 stroke-white" />
                            ) : (
                                <>
                                    Start Exploring
                                    <ChevronRight className="stroke-white w-4 h-4" />
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BusinessOnboardingModal;

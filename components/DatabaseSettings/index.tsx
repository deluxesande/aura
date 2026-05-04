"use client";
import { AppDispatch, AppState } from "@/store";
import { fetchUser } from "@/store/auth/authThunks";
import { setBusinessDetails } from "@/store/slices/businessDataSlice";
import { apiClient } from "@/utils/apiClient";
import {
    Activity,
    AlertTriangle,
    CheckCircle2,
    ExternalLink,
    Eye,
    EyeOff,
    Loader2,
    RotateCcw,
    Save,
    Trash2,
    XCircle,
    Lock,
} from "lucide-react";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import Link from "next/link";

interface DatabaseSettingsProps {
    businessId: string;
    currentMode: "SHARED" | "BYODB";
    databaseUrl?: string | null;
}

const DatabaseSettings: React.FC<DatabaseSettingsProps> = ({
    businessId,
    currentMode,
    databaseUrl,
}) => {
    const dispatch = useDispatch<AppDispatch>();
    const plan = useSelector((state: AppState) => state.businessData.businessDetails?.subscription?.plan);
    const isPaidPlan = plan === "STANDARD" || plan === "PREMIUM";

    const [selectedMode, setSelectedMode] = useState<"SHARED" | "BYODB">(
        currentMode,
    );
    const [liveMode, setLiveMode] = useState<"SHARED" | "BYODB">(currentMode);
    const [dbUrl, setDbUrl] = useState(databaseUrl || "");
    const [showUrl, setShowUrl] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isRollingBack, setIsRollingBack] = useState(false);
    const [connectionTested, setConnectionTested] = useState(false);
    const [testResult, setTestResult] = useState<"success" | "error" | null>(
        null,
    );
    const [confirmRemove, setConfirmRemove] = useState(false);

    // Sync local state when prop changes (e.g. after a re-fetch)
    React.useEffect(() => {
        setLiveMode(currentMode);
        setSelectedMode(currentMode);
        if (currentMode === "BYODB" && databaseUrl) {
            setDbUrl(databaseUrl);
        }
    }, [currentMode, databaseUrl]);

    const switchingToShared = selectedMode === "SHARED" && liveMode === "BYODB";
    const isAlreadyConfigured = liveMode === "BYODB" && selectedMode === "BYODB";
    const urlHasValue = dbUrl.trim().length > 0;

    const handleModeSelect = (mode: "SHARED" | "BYODB") => {
        if (mode === "BYODB" && !isPaidPlan) {
            toast.error("Bring Your Own DB is only available on paid plans.");
            return;
        }
        setSelectedMode(mode);
        setConnectionTested(false);
        setTestResult(null);
        setConfirmRemove(false);
    };

    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDbUrl(e.target.value);
        setConnectionTested(false);
        setTestResult(null);
    };

    const handleTestConnection = async () => {
        if (!dbUrl.trim()) return;
        setIsTesting(true);
        setTestResult(null);
        try {
            await apiClient.post("/business/test-url", {
                url: dbUrl,
            });
            setConnectionTested(true);
            setTestResult("success");
            toast.success("Database connection successful!");
        } catch (error: any) {
            setConnectionTested(false);
            setTestResult("error");
            toast.error(
                error.response?.data?.error || "Failed to connect to database",
            );
        } finally {
            setIsTesting(false);
        }
    };

    const handleSave = async () => {
        if (!connectionTested) return;
        setIsSaving(true);
        try {
            await apiClient.put(`/business/${businessId}`, {
                tenantMode: "BYODB",
                tenantDatabaseUrl: dbUrl,
            });
            setLiveMode("BYODB");
            setConnectionTested(false);
            setDbUrl("");
            setTestResult(null);
            
            // Fetch the fully populated business object including usage and subscriptions
            const freshRes = await apiClient.get(`/business/${businessId}`);
            dispatch(setBusinessDetails(freshRes.data));
            
            // Force re-fetch of user to update dynamic prisma clients in context if needed
            await dispatch(fetchUser());
            toast.success("BYODB configuration saved successfully. Your data is being synchronized.");
        } catch (error: any) {
            toast.error(
                error.response?.data?.error || "Failed to save configuration",
            );
        } finally {
            setIsSaving(false);
        }
    };

    const handleRollback = async () => {
        setIsRollingBack(true);
        try {
            await apiClient.put(`/business/${businessId}`, {
                tenantMode: "SHARED",
                tenantDatabaseUrl: null,
            });
            setLiveMode("SHARED");
            setSelectedMode("SHARED");
            setConfirmRemove(false);
            setDbUrl("");
            setTestResult(null);
            setConnectionTested(false);
            
            // Fetch the fully populated business object including usage and subscriptions
            const freshRes = await apiClient.get(`/business/${businessId}`);
            dispatch(setBusinessDetails(freshRes.data));
            
            await dispatch(fetchUser());
            toast.success("Rolled back to shared cloud successfully. Your data is being synchronized back.");
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Rollback failed");
        } finally {
            setIsRollingBack(false);
        }
    };

    return (
        <div className="bg-white p-4 sm:p-8 shadow sm:rounded-lg border border-gray-100">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-lg font-medium text-gray-900">
                        Database Configuration
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                        Manage where your business data is stored.
                    </p>
                </div>
                <div
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border flex items-center gap-1.5 ${
                        liveMode === "BYODB"
                            ? "bg-green-50 text-green-500 border-green-100"
                            : "bg-slate-50 text-slate-500 border-slate-100"
                    }`}
                >
                    <span
                        className={`w-1.5 h-1.5 rounded-full ${
                            liveMode === "BYODB"
                                ? "bg-green-500"
                                : "bg-slate-400"
                        }`}
                    />
                    {liveMode === "BYODB" ? "BYODB" : "Shared"}
                </div>
            </div>

            <div className="space-y-8">
                {/* Mode Selector */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                        onClick={() => handleModeSelect("SHARED")}
                        className={`flex items-start gap-4 p-4 rounded-xl border transition-all text-left ${
                            selectedMode === "SHARED"
                                ? "bg-green-50 border-green-500 ring-1 ring-green-500"
                                : "bg-white border-gray-200 hover:border-gray-300"
                        }`}
                    >
                        <div
                            className={`mt-1 w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                                selectedMode === "SHARED"
                                    ? "border-green-500 bg-green-500"
                                    : "border-gray-300"
                            }`}
                        >
                            {selectedMode === "SHARED" && (
                                <div className="w-2 h-2 rounded-full bg-white" />
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-gray-900 text-sm">
                                    Shared Cloud
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                Managed, secure infrastructure hosted by
                                Salesense. Zero configuration required.
                            </p>
                        </div>
                    </button>

                    <button
                        onClick={() => handleModeSelect("BYODB")}
                        className={`flex items-start gap-4 p-4 rounded-xl border transition-all text-left ${
                            selectedMode === "BYODB"
                                ? "bg-green-50 border-green-500 ring-1 ring-green-500"
                                : "bg-white border-gray-200 hover:border-gray-300"
                        } ${!isPaidPlan ? "opacity-60 cursor-not-allowed" : ""}`}
                    >
                        <div
                            className={`mt-1 w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                                selectedMode === "BYODB"
                                    ? "border-green-500 bg-green-500"
                                    : "border-gray-300"
                            }`}
                        >
                            {selectedMode === "BYODB" && (
                                <div className="w-2 h-2 rounded-full bg-white" />
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-gray-900 text-sm flex items-center gap-2">
                                    Bring Your Own DB
                                    {!isPaidPlan && <Lock className="w-3.5 h-3.5 text-gray-400" />}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed mb-2">
                                Connect your own PostgreSQL instance for
                                complete data sovereignty.
                            </p>
                            {!isPaidPlan && (
                                <Link
                                    href="/pricing"
                                    className="text-xs font-bold text-green-600 hover:text-green-700 hover:underline"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    Upgrade to unlock &rarr;
                                </Link>
                            )}
                        </div>
                    </button>
                </div>

                {/* BYODB URL Input */}
                {selectedMode === "BYODB" && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                PostgreSQL Connection URL
                            </label>
                            <div className="relative">
                                <input
                                    type={showUrl ? "text" : "password"}
                                    value={dbUrl}
                                    onChange={handleUrlChange}
                                    readOnly={isAlreadyConfigured}
                                    placeholder="postgresql://user:password@host:5432/dbname"
                                    className={`w-full px-4 py-3 pr-10 rounded-lg outline-none bg-slate-50 focus:bg-white border border-gray-200 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-xs font-mono ${isAlreadyConfigured ? "cursor-not-allowed opacity-75" : ""}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowUrl((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showUrl ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                            {!isAlreadyConfigured && (
                                <p className="mt-2 text-[11px] text-gray-400 flex items-center gap-1">
                                    <ExternalLink className="w-3 h-3 shrink-0" />
                                    Ensure your database allows inbound connections
                                    from Salesense&apos;s IPs before testing.
                                </p>
                            )}
                        </div>

                        {/* Test Result Banner */}
                        {testResult === "success" && !isAlreadyConfigured && (
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-100">
                                <CheckCircle2 className="w-4 h-4 stroke-green-500 shrink-0 mt-0.5" />
                                <p className="text-xs text-green-700 font-medium">
                                    Connection successful. Your database is
                                    reachable. You can now save the
                                    configuration.
                                </p>
                            </div>
                        )}
                        {testResult === "error" && !isAlreadyConfigured && (
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-100">
                                <XCircle className="w-4 h-4 stroke-red-500 shrink-0 mt-0.5" />
                                <p className="text-xs text-red-700 font-medium">
                                    Could not connect. Check your connection
                                    string and ensure the host is publicly
                                    accessible.
                                </p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        {!isAlreadyConfigured && (
                            <div className="pt-6 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <button
                                    onClick={handleTestConnection}
                                    disabled={isTesting || !urlHasValue}
                                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed w-full"
                                >
                                    {isTesting ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Activity size={18} />
                                    )}
                                    {isTesting ? "Testing..." : "Test Connection"}
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving || !connectionTested}
                                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-green-500 text-white text-sm font-bold rounded-lg hover:bg-green-700 transition-all shadow-md shadow-green-100 disabled:opacity-50 disabled:cursor-not-allowed w-full"
                                >
                                    {isSaving ? (
                                        <Loader2 className="w-4 h-4 animate-spin stroke-white" />
                                    ) : (
                                        <Save size={18} className="stroke-white" />
                                    )}
                                    {isSaving ? "Saving..." : "Save Configuration"}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Rollback warning when switching BYODB → Shared */}
                {switchingToShared && (
                    <div className="space-y-4">
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-50 border border-orange-100">
                            <AlertTriangle className="w-4 h-4 stroke-orange-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-orange-700 font-medium leading-relaxed">
                                Switching to Shared Cloud will remove your
                                custom database connection. Your data on the
                                external database will not be deleted, but will
                                no longer be accessible through Salesense.
                            </p>
                        </div>
                        <div className="pt-6 border-t border-gray-100">
                            <button
                                onClick={handleRollback}
                                disabled={isRollingBack}
                                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isRollingBack ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <RotateCcw size={18} />
                                )}
                                {isRollingBack
                                    ? "Rolling back..."
                                    : "Confirm Rollback to Shared"}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Danger Zone — only when actively on BYODB and not mid-switch */}
            {liveMode === "BYODB" && selectedMode === "BYODB" && (
                <div className="mt-12 pt-8 border-t border-gray-100">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900">
                            Danger Zone
                        </h3>
                        <p className="mb-4 text-sm text-gray-600">
                            Irreversible actions for your database
                            configuration.
                        </p>
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-red-100 bg-red-50/20">
                        <div className="p-5">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <p className="text-sm font-bold text-gray-900 mb-1">
                                        Remove BYODB Configuration
                                    </p>
                                    <p className="text-xs text-gray-500 leading-relaxed max-w-md">
                                        Disconnects your custom database and
                                        reverts your account to Salesense&apos;s
                                        shared infrastructure. Your data on the
                                        external database is not deleted.
                                    </p>
                                </div>
                                {!confirmRemove && (
                                    <button
                                        onClick={() => setConfirmRemove(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 text-xs font-bold rounded-lg hover:bg-red-50 transition-all shadow-sm shrink-0 w-full sm:w-auto justify-center"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        Remove
                                    </button>
                                )}
                            </div>

                            {confirmRemove && (
                                <div className="mt-4 pt-4 border-t border-red-100">
                                    <p className="text-xs font-bold text-red-700 mb-3 flex items-center gap-1.5">
                                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                        Are you sure? This cannot be undone from
                                        this panel.
                                    </p>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleRollback}
                                            disabled={isRollingBack}
                                            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 transition-all shadow-sm disabled:opacity-50"
                                        >
                                            {isRollingBack ? (
                                                <Loader2 className="w-3.5 h-3.5 animate-spin stroke-white" />
                                            ) : (
                                                <Trash2 className="w-3.5 h-3.5 stroke-white" />
                                            )}
                                            {isRollingBack
                                                ? "Removing..."
                                                : "Yes, Remove"}
                                        </button>
                                        <button
                                            onClick={() =>
                                                setConfirmRemove(false)
                                            }
                                            disabled={isRollingBack}
                                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DatabaseSettings;

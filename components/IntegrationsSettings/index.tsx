import { AppState } from "@/store";
import { apiClient } from "@/utils/apiClient";
import { AxiosError } from "axios";
import { AlertTriangle, Check, Eye, EyeOff, Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import useSWR from "swr";

type User = {
    id: string;
    name: string;
    clerkId: string;
    email: string;
    role: string;
    businessId: string;
    status: string;
    Business: {};
};

const fetcher = (url: string) =>
    apiClient.get(url.replace("/api", "")).then((res) => res.data);

const IntegrationsSettings: React.FC = () => {
    const [integrations, setIntegrations] = useState({ mpesa: false });
    const [showSecrets, setShowSecrets] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [mpesaConfig, setMpesaConfig] = useState({
        consumerKey: "",
        consumerSecret: "",
        passKey: "",
        shortCode: "",
        environment: "production",
    });

    const [savedConfig, setSavedConfig] = useState<typeof mpesaConfig | null>(
        null,
    );

    const user = useSelector(
        (state: AppState) => state.auth.user,
    ) as User | null;

    const { data, error, isLoading, mutate } = useSWR(
        user ? "/api/auth/mpesa" : null,
        fetcher,
        {
            revalidateOnFocus: true,
        },
    );

    useEffect(() => {
        if (data) {
            if (data.mpesaConsumerKey) {
                const config = {
                    consumerKey: data.mpesaConsumerKey,
                    consumerSecret: data.mpesaConsumerSecret,
                    passKey: data.mpesaPassKey,
                    shortCode: data.mpesaShortCode,
                    environment: "production",
                };
                setSavedConfig(config);
                setMpesaConfig(config);
                setIntegrations({ mpesa: true });
            }
        }
    }, [data]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        const { name, value } = e.target;
        setMpesaConfig((prev) => ({ ...prev, [name]: value }));
    };

    const handleSaveMpesa = async (e: React.FormEvent) => {
        e.preventDefault();

        if (
            !mpesaConfig.consumerKey.trim() ||
            !mpesaConfig.consumerSecret.trim() ||
            !mpesaConfig.passKey.trim() ||
            !mpesaConfig.shortCode.trim()
        ) {
            toast.error("All fields are required.");
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                mpesaConsumerKey: mpesaConfig.consumerKey,
                mpesaConsumerSecret: mpesaConfig.consumerSecret,
                mpesaPassKey: mpesaConfig.passKey,
                mpesaShortCode: mpesaConfig.shortCode,
            };

            const response = await apiClient.put(
                `/business/${user?.businessId}`,
                payload,
            );

            if (response.status === 200) {
                toast.success("M-PESA credentials saved!");
                mutate();
            }
        } catch (error) {
            const axiosError = error as AxiosError;
            const errorMessage =
                (axiosError.response?.data as { error?: string })?.error ||
                "Failed to save credentials.";
            toast.error(errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDisconnect = async () => {
        if (!confirm("Are you sure you want to disconnect M-PESA?")) return;

        try {
            const payload = {
                mpesaConsumerKey: null,
                mpesaConsumerSecret: null,
                mpesaPassKey: null,
                mpesaShortCode: null,
            };

            await apiClient.put(`/business/${user?.businessId}`, payload);
            setIntegrations({ mpesa: false });
            setSavedConfig(null);
            setMpesaConfig({
                consumerKey: "",
                consumerSecret: "",
                passKey: "",
                shortCode: "",
                environment: "production",
            });
            toast.info("M-PESA has been disconnected.");
            mutate();
        } catch (error) {
            toast.error("Failed to disconnect service.");
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            M-PESA Daraja Integration
                            {integrations.mpesa && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-500 border border-green-200 animate-pulse">
                                    Connected
                                </span>
                            )}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Link your Live Daraja App to trigger real-time STK
                            Push payments.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSaveMpesa} className="space-y-5">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 stroke-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="text-amber-800 text-xs leading-relaxed">
                            <p className="font-bold mb-0.5 text-amber-600">
                                Production Mode Required
                            </p>
                            <p>
                                Ensure you use credentials from your{" "}
                                <strong>Go Live</strong> app on Safaricom Daraja
                                Portal. Sandbox credentials will not work here.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                Business Short Code (Paybill/Till)
                            </label>
                            <input
                                type="text"
                                name="shortCode"
                                value={mpesaConfig.shortCode}
                                onChange={(e) =>
                                    setMpesaConfig((prev) => ({
                                        ...prev,
                                        shortCode: e.target.value.replace(
                                            /\D/g,
                                            "",
                                        ),
                                    }))
                                }
                                placeholder="e.g. 174379"
                                className="w-full outline-none bg-gray-50 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all font-medium"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                Consumer Key
                            </label>
                            <input
                                type="text"
                                name="consumerKey"
                                value={mpesaConfig.consumerKey}
                                onChange={handleChange}
                                placeholder="Enter Consumer Key"
                                className="w-full outline-none bg-gray-50 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all font-medium"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Consumer Secret
                            </label>
                            <button
                                type="button"
                                onClick={() => setShowSecrets(!showSecrets)}
                                className="text-[10px] font-bold text-green-500 hover:text-green-500 flex items-center gap-1 uppercase tracking-widest"
                            >
                                {showSecrets ? (
                                    <>
                                        <EyeOff size={12} /> Hide
                                    </>
                                ) : (
                                    <>
                                        <Eye size={12} /> Show
                                    </>
                                )}
                            </button>
                        </div>
                        <input
                            type={showSecrets ? "text" : "password"}
                            name="consumerSecret"
                            value={mpesaConfig.consumerSecret}
                            onChange={handleChange}
                            className="w-full outline-none bg-gray-50 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all font-mono"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                            Online Pass Key
                        </label>
                        <input
                            type={showSecrets ? "text" : "password"}
                            name="passKey"
                            value={mpesaConfig.passKey}
                            onChange={handleChange}
                            className="w-full outline-none bg-gray-50 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all font-mono"
                            required
                        />
                    </div>

                    <div className="flex items-center gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex-1 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                        >
                            {isSaving && (
                                <Loader2 className="animate-spin w-4 h-4" />
                            )}
                            {integrations.mpesa
                                ? "Update Connection"
                                : "Connect M-PESA"}
                        </button>
                        {integrations.mpesa && (
                            <button
                                type="button"
                                onClick={handleDisconnect}
                                className="px-6 py-3 text-red-600 font-bold border border-red-100 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                            >
                                Disconnect
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default IntegrationsSettings;

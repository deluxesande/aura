import { AppState } from "@/store";
import axios, { AxiosError } from "axios";
import { AlertTriangle, Check, Eye, EyeOff, X } from "lucide-react";
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

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

const IntegrationsSettings: React.FC = () => {
    const [integrations, setIntegrations] = useState({ mpesa: false });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeService, setActiveService] = useState<string | null>(null);
    const [showSecrets, setShowSecrets] = useState(false);

    const [mpesaConfig, setMpesaConfig] = useState({
        consumerKey: "",
        consumerSecret: "",
        passKey: "",
        shortCode: "",
        environment: "production",
    });

    const [savedConfig, setSavedConfig] = useState<typeof mpesaConfig | null>(
        null
    );

    const user = useSelector(
        (state: AppState) => state.auth.user
    ) as User | null;

    // Use SWR for caching and background updates
    const { data, error, isLoading } = useSWR(
        user ? "/api/auth/mpesa" : null,
        fetcher,
        {
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
            dedupingInterval: 5000,
            refreshInterval: 60000, // Optional: refresh every 60 seconds
        }
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
                setIntegrations({ mpesa: true });
            }
        }
    }, [data]);

    useEffect(() => {
        if (error) {
            console.error("Error fetching integration status:", error);
            toast.error("Failed to load integration status");
        }
    }, [error]);

    const integrationsList = [
        {
            id: "mpesa",
            name: "M-PESA Daraja (Live)",
            description:
                "Link your Live Daraja App to trigger real payments directly to your Paybill or Till.",
            popular: true,
        },
    ];

    const handleOpenModal = (serviceId: string) => {
        setActiveService(serviceId);
        // If we have saved/masked config, populate the form so the user sees it's active
        if (serviceId === "mpesa" && savedConfig) {
            setMpesaConfig(savedConfig);
        }
        setIsModalOpen(true);
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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
            toast.error(
                "All fields are required to enable Live Daraja integration."
            );
            return;
        }

        try {
            const payload = {
                mpesaConsumerKey: mpesaConfig.consumerKey,
                mpesaConsumerSecret: mpesaConfig.consumerSecret,
                mpesaPassKey: mpesaConfig.passKey,
                mpesaShortCode: mpesaConfig.shortCode,
            };

            const response = await axios.put(
                `/api/business/${user?.businessId}`,
                payload
            );

            if (response.status === 200) {
                // Update local state with masked values to represent saved state
                const maskedConfig = {
                    ...mpesaConfig,
                    consumerKey: "***********",
                    consumerSecret: "***********",
                    passKey: "***********",
                };
                setSavedConfig(maskedConfig);
                setIntegrations((prev) => ({ ...prev, mpesa: true }));
                setIsModalOpen(false);
                toast.success("Live M-PESA credentials saved successfully!");
            }
        } catch (error) {
            const axiosError = error as AxiosError;
            const errorMessage =
                (axiosError.response?.data as { error?: string })?.error ||
                "Failed to save credentials.";
            toast.error(errorMessage);
        }
    };

    const handleDisconnect = async () => {
        if (
            !confirm(
                "Are you sure you want to disconnect M-PESA? This will stop all live payments."
            )
        )
            return;

        try {
            const payload = {
                mpesaConsumerKey: null,
                mpesaConsumerSecret: null,
                mpesaPassKey: null,
                mpesaShortCode: null,
            };

            const response = await axios.put(
                `/api/business/${user?.businessId}`,
                payload
            );

            if (response.status === 200) {
                setIntegrations((prev) => ({ ...prev, mpesa: false }));
                setSavedConfig(null);
                setMpesaConfig({
                    consumerKey: "",
                    consumerSecret: "",
                    passKey: "",
                    shortCode: "",
                    environment: "production",
                });
                setIsModalOpen(false);
                toast.info("M-PESA integration disconnected.");
            }
        } catch (error) {
            const axiosError = error as AxiosError;
            toast.error("Failed to disconnect service.");
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center p-12">
                <div className="flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                </div>
            </div>
        );
    }

    return (
        <section className="bg-white p-6 rounded-lg shadow-md w-full relative">
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    Payment Integrations
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                    Connect your live payment gateways to process real customer
                    transactions.
                </p>
            </header>

            <div className="mt-6 space-y-4">
                {integrationsList.map((integration) => (
                    <div
                        key={integration.id}
                        className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow gap-4 sm:gap-0"
                    >
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-1 sm:space-y-0">
                                <h3 className="text-sm font-medium text-gray-900">
                                    {integration.name}
                                </h3>
                                {integration.popular && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 w-fit">
                                        Popular
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                                {integration.description}
                            </p>

                            {/* Status Indicator - Fixes hydration error by using div */}
                            {integrations[
                                integration.id as keyof typeof integrations
                            ] && (
                                <div className="text-xs text-green-500 mt-2 font-medium flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                    <span>
                                        Live Connected: {savedConfig?.shortCode}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-end sm:justify-start space-x-3 flex-shrink-0">
                            {integrations[
                                integration.id as keyof typeof integrations
                            ] ? (
                                <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        <Check size={12} className="mr-1" />{" "}
                                        Connected
                                    </span>
                                    <button
                                        onClick={() =>
                                            handleOpenModal(integration.id)
                                        }
                                        className="px-3 py-1 text-xs font-medium text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 whitespace-nowrap"
                                    >
                                        Configure
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() =>
                                        handleOpenModal(integration.id)
                                    }
                                    className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600 whitespace-nowrap"
                                >
                                    Connect
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal remains the same but uses mpesaConfig populated from savedConfig */}
            {isModalOpen && activeService === "mpesa" && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center p-5 border-b border-gray-100">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Live M-PESA Configuration
                                </h3>
                                <p className="text-xs text-gray-500 mt-1">
                                    Enter credentials from your{" "}
                                    <strong>Production</strong> App.
                                </p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form
                            onSubmit={handleSaveMpesa}
                            className="p-6 space-y-5 overflow-y-auto"
                        >
                            <div className="bg-amber-50 border border-amber-200 rounded-md p-3 flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                <div className="text-amber-800 text-xs">
                                    <p className="font-medium">
                                        Production Environment
                                    </p>
                                    <p>
                                        Ensure you have &quot;Gone Live&quot; on
                                        Daraja. Do not use Sandbox credentials.
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Business Short Code
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
                                                ""
                                            ),
                                        }))
                                    }
                                    placeholder="e.g. 174379"
                                    className="w-full outline-none bg-slate-50 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 transition-all"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Consumer Key
                                </label>
                                <input
                                    type="text"
                                    name="consumerKey"
                                    value={mpesaConfig.consumerKey}
                                    onChange={handleChange}
                                    placeholder="Consumer Key"
                                    className="w-full outline-none bg-slate-50 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 transition-all"
                                    required
                                />
                            </div>

                            <div className="space-y-5 border-t border-gray-100 pt-4">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-sm font-semibold text-gray-900">
                                        Production Secrets
                                    </h4>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowSecrets(!showSecrets)
                                        }
                                        className="text-xs text-green-500 font-medium flex items-center gap-1"
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

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Consumer Secret
                                    </label>
                                    <input
                                        type={showSecrets ? "text" : "password"}
                                        name="consumerSecret"
                                        value={mpesaConfig.consumerSecret}
                                        onChange={handleChange}
                                        className="w-full outline-none bg-slate-50 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 font-mono text-sm"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Pass Key
                                    </label>
                                    <input
                                        type={showSecrets ? "text" : "password"}
                                        name="passKey"
                                        value={mpesaConfig.passKey}
                                        onChange={handleChange}
                                        className="w-full outline-none bg-slate-50 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 font-mono text-sm"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-gray-100">
                                {integrations.mpesa && (
                                    <button
                                        type="button"
                                        onClick={handleDisconnect}
                                        className="flex-1 px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100"
                                    >
                                        Disconnect
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-green-500 rounded-lg hover:bg-green-700 shadow-sm"
                                >
                                    {integrations.mpesa
                                        ? "Update Credentials"
                                        : "Save & Connect"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
};

export default IntegrationsSettings;

import { AppState } from "@/store";
import { FloatingPortal } from "@floating-ui/react";
import axios, { AxiosError } from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Check, Eye, EyeOff, Loader2, X } from "lucide-react";
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
        null,
    );

    const user = useSelector(
        (state: AppState) => state.auth.user,
    ) as User | null;

    const { data, error, isLoading } = useSWR(
        user ? "/api/auth/mpesa" : null,
        fetcher,
        {
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
            dedupingInterval: 5000,
            refreshInterval: 60000,
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
        if (serviceId === "mpesa" && savedConfig) {
            setMpesaConfig(savedConfig);
        }
        setIsModalOpen(true);
    };

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
            toast.error(
                "All fields are required to enable Live Daraja integration.",
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
                payload,
            );

            if (response.status === 200) {
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
                "Are you sure you want to disconnect M-PESA? This will stop all live payments.",
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
                payload,
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
            toast.error("Failed to disconnect service.");
        }
    };

    return (
        <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 w-full relative min-h-[200px]">
            {isLoading && (
                <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center rounded-lg backdrop-blur-sm">
                    <Loader2 className="animate-spin h-8 w-8 text-green-600" />
                </div>
            )}

            <header>
                <h2 className="text-lg font-bold text-gray-900">
                    Payment Integrations
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                    Connect your live payment gateways to process real customer
                    transactions.
                </p>
            </header>

            <div className="mt-6 space-y-4">
                {integrationsList.map((integration) => (
                    <div
                        key={integration.id}
                        className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between p-5 bg-white border border-gray-200 rounded-lg transition-all gap-4 sm:gap-0 group"
                    >
                        <div className="flex-1 min-w-0 flex items-center  gap-2">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-1 sm:space-y-0">
                                <h3 className="text-sm font-bold text-gray-900">
                                    {integration.name}
                                </h3>
                                {/* {integration.popular && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-500 w-fit">
                                        Popular
                                    </span>
                                )} */}
                            </div>
                            {/* {!integrations[
                                integration.id as keyof typeof integrations
                            ] && (
                                <p className="text-xs text-gray-500 mt-1 leading-relaxed max-w-lg">
                                    {integration.description}
                                </p>
                            )} */}

                            {integrations[
                                integration.id as keyof typeof integrations
                            ] && (
                                <div className="text-xs font-medium flex items-center gap-1.5 bg-green-50 w-fit px-2 py-1 rounded-md border border-green-100">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                    <span className="text-green-500">
                                        {savedConfig?.shortCode}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-end sm:justify-start space-x-3 flex-shrink-0">
                            {integrations[
                                integration.id as keyof typeof integrations
                            ] ? (
                                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-500 border border-green-200">
                                        <Check
                                            size={12}
                                            className="mr-1 stroke-green-500"
                                            strokeWidth={3}
                                        />
                                        Connected
                                    </span>
                                    <button
                                        onClick={() =>
                                            handleOpenModal(integration.id)
                                        }
                                        className="px-3 py-1.5 text-xs font-bold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
                                    >
                                        Configure
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() =>
                                        handleOpenModal(integration.id)
                                    }
                                    className="px-4 py-2 text-sm font-bold text-white bg-green-500 rounded-lg hover:bg-green-600transition-all hover:-translate-y-0.5"
                                >
                                    Connect
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <AnimatePresence>
                {isModalOpen && activeService === "mpesa" && (
                    <FloatingPortal>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                transition={{ duration: 0.2 }}
                                className="bg-white rounded-lg shadow-2xl border border-gray-100 w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden relative"
                            >
                                {/* --- Background Line Pattern --- */}
                                <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03] z-0">
                                    <div className="absolute -top-[10%] -left-[10%] w-[80%] h-[40%] rounded-full bg-green-900/20 blur-[60px]" />
                                    <svg
                                        className="absolute inset-0 w-full h-full"
                                        viewBox="0 0 100 100"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
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

                                {/* Header */}
                                <div className="flex justify-between items-start p-6 border-b border-gray-100 relative z-10 bg-white/50 backdrop-blur-sm">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">
                                            Live M-PESA Configuration
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Enter credentials from your{" "}
                                            <strong className="text-green-500">
                                                Production
                                            </strong>{" "}
                                            App on Daraja.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                {/* Form */}
                                <form
                                    onSubmit={handleSaveMpesa}
                                    className="p-6 space-y-5 overflow-y-auto relative z-10"
                                >
                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                                        <AlertTriangle className="w-5 h-5 stroke-amber-600 flex-shrink-0 mt-0.5" />
                                        <div className="text-amber-800 text-xs leading-relaxed">
                                            <p className="font-bold mb-0.5 text-amber-600">
                                                Production Environment
                                            </p>
                                            <p className="text-amber-800">
                                                Ensure you have &quot;Gone
                                                Live&quot; on Daraja. Do not use
                                                Sandbox credentials.
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                            Business Short Code
                                        </label>
                                        <input
                                            type="text"
                                            name="shortCode"
                                            value={mpesaConfig.shortCode}
                                            onChange={(e) =>
                                                setMpesaConfig((prev) => ({
                                                    ...prev,
                                                    shortCode:
                                                        e.target.value.replace(
                                                            /\D/g,
                                                            "",
                                                        ),
                                                }))
                                            }
                                            placeholder="e.g. 174379"
                                            className="w-full outline-none bg-slate-50 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm font-medium"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                            Consumer Key
                                        </label>
                                        <input
                                            type="text"
                                            name="consumerKey"
                                            value={mpesaConfig.consumerKey}
                                            onChange={handleChange}
                                            placeholder="Consumer Key"
                                            className="w-full outline-none bg-slate-50 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm font-medium"
                                            required
                                        />
                                    </div>

                                    <div className="pt-2">
                                        <div className="flex justify-between items-center mb-1.5">
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                Consumer Secret
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowSecrets(!showSecrets)
                                                }
                                                className="text-[10px] font-bold text-green-500 hover:text-green-600 flex items-center gap-1 uppercase tracking-wider"
                                            >
                                                {showSecrets ? (
                                                    <>
                                                        <EyeOff size={12} />{" "}
                                                        Hide Secrets
                                                    </>
                                                ) : (
                                                    <>
                                                        <Eye size={12} /> Show
                                                        Secrets
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                        <input
                                            type={
                                                showSecrets
                                                    ? "text"
                                                    : "password"
                                            }
                                            name="consumerSecret"
                                            value={mpesaConfig.consumerSecret}
                                            onChange={handleChange}
                                            className="w-full outline-none bg-slate-50 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm font-mono"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                            Pass Key
                                        </label>
                                        <input
                                            type={
                                                showSecrets
                                                    ? "text"
                                                    : "password"
                                            }
                                            name="passKey"
                                            value={mpesaConfig.passKey}
                                            onChange={handleChange}
                                            className="w-full outline-none bg-slate-50 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm font-mono"
                                            required
                                        />
                                    </div>

                                    <div className="flex gap-3 pt-6 border-t border-gray-100">
                                        {integrations.mpesa && (
                                            <button
                                                type="button"
                                                onClick={handleDisconnect}
                                                className="flex-1 px-4 py-3 text-sm font-bold text-red-600 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition-colors"
                                            >
                                                Disconnect
                                            </button>
                                        )}
                                        <button
                                            type="submit"
                                            className="flex-1 px-4 py-3 text-sm font-bold text-white bg-green-500 rounded-lg hover:bg-green-600 transition-all"
                                        >
                                            {integrations.mpesa
                                                ? "Update Credentials"
                                                : "Save & Connect"}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </motion.div>
                    </FloatingPortal>
                )}
            </AnimatePresence>
        </section>
    );
};

export default IntegrationsSettings;

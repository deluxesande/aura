import React, { useState } from "react";
import { toast } from "sonner";
import { X, Check } from "lucide-react";

const IntegrationsSettings: React.FC = () => {
    // State for integration status
    const [integrations, setIntegrations] = useState({
        mpesa: false,
    });

    // State for Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeService, setActiveService] = useState<string | null>(null);

    // State for M-PESA Data
    const [mpesaShortCode, setMpesaShortCode] = useState("");
    const [savedShortCode, setSavedShortCode] = useState(""); // Stores the actual saved code

    const integrationsList = [
        {
            id: "mpesa",
            name: "M-PESA",
            description:
                "Accept mobile money payments via Paybill or Till Number",
            popular: true,
        },
    ];

    const handleOpenModal = (serviceId: string) => {
        setActiveService(serviceId);
        // If opening settings for an already connected service, pre-fill the input
        if (serviceId === "mpesa") {
            setMpesaShortCode(savedShortCode);
        }
        setIsModalOpen(true);
    };

    const handleSaveMpesa = (e: React.FormEvent) => {
        e.preventDefault();

        if (!mpesaShortCode.trim()) {
            toast.error("Please enter a valid Short Code");
            return;
        }

        // Simulate API Save
        setSavedShortCode(mpesaShortCode);
        setIntegrations((prev) => ({ ...prev, mpesa: true }));

        setIsModalOpen(false);
        toast.success("M-PESA Short Code saved successfully!");
    };

    const handleDisconnect = () => {
        setIntegrations((prev) => ({ ...prev, mpesa: false }));
        setSavedShortCode("");
        setMpesaShortCode("");
        setIsModalOpen(false);
        toast.info("M-PESA disconnected");
    };

    return (
        <section className="bg-white p-6 rounded-lg shadow-md w-full max-w-3xl relative">
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    Integrations
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                    Connect external services to accept payments and manage your
                    business.
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
                            {/* Show saved code if connected */}
                            {integrations[
                                integration.id as keyof typeof integrations
                            ] && (
                                <p className="text-xs text-green-600 mt-2 font-medium">
                                    Active Short Code: {savedShortCode}
                                </p>
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
                                        Settings
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() =>
                                        handleOpenModal(integration.id)
                                    }
                                    className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 whitespace-nowrap"
                                >
                                    Connect
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* M-PESA Configuration Modal */}
            {isModalOpen && activeService === "mpesa" && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                        <div className="flex justify-between items-center p-4 border-b border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Configure M-PESA
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form
                            onSubmit={handleSaveMpesa}
                            className="p-6 space-y-4"
                        >
                            <div>
                                <label
                                    htmlFor="shortcode"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Short Code (Paybill or Till Number)
                                </label>
                                <input
                                    type="text" // using text to allow leading zeros if necessary
                                    id="shortcode"
                                    value={mpesaShortCode}
                                    onChange={(e) =>
                                        setMpesaShortCode(
                                            e.target.value.replace(/\D/g, "")
                                        )
                                    } // Only allow numbers
                                    placeholder="e.g. 174379"
                                    className="w-full outline-none bg-slate-50 appearance-none px-3 py-2 border border-gray-300 rounded-md focus:border-green-500 "
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Enter the Paybill or Buy Goods number
                                    customers will use to pay.
                                </p>
                            </div>

                            <div className="flex gap-3 pt-2">
                                {integrations.mpesa && (
                                    <button
                                        type="button"
                                        onClick={handleDisconnect}
                                        className="flex-1 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 focus:outline-none"
                                    >
                                        Disconnect
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                >
                                    {integrations.mpesa
                                        ? "Update"
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

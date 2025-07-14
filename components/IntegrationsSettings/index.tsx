import React, { useState } from "react";
import { toast } from "sonner";

const IntegrationsSettings: React.FC = () => {
    const [integrations, setIntegrations] = useState({
        mpesa: false,
    });

    const handleToggle = (service: string) => {
        setIntegrations((prev) => ({
            ...prev,
            [service]: !prev[service as keyof typeof prev],
        }));
    };

    const handleConnect = (service: string) => {
        toast.warning(`${service} integration setup not implemented yet!`);
    };

    const integrationsList = [
        {
            id: "mpesa",
            name: "M-PESA",
            description: "Accept mobile money payments from your customers",
            icon: "📱",
            popular: true,
        },
    ];

    return (
        <section>
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    Integrations
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                    Connect external services to accept payments and manage your
                    business better.
                </p>
            </header>

            <div className="mt-6 space-y-4">
                {integrationsList.map((integration) => (
                    <div
                        key={integration.id}
                        className="relative flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center space-x-4">
                            <div className="text-2xl">{integration.icon}</div>
                            <div>
                                <div className="flex items-center space-x-2">
                                    <h3 className="text-sm font-medium text-gray-900">
                                        {integration.name}
                                    </h3>
                                    {integration.popular && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            Popular
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-600">
                                    {integration.description}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            {integrations[
                                integration.id as keyof typeof integrations
                            ] ? (
                                <div className="flex items-center space-x-2">
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        ✓ Connected
                                    </span>
                                    <button
                                        onClick={() =>
                                            handleConnect(integration.name)
                                        }
                                        className="px-3 py-1 text-xs font-medium text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                                    >
                                        Settings
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => {
                                        handleToggle(integration.id);
                                        handleConnect(integration.name);
                                    }}
                                    className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                                >
                                    Connect
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default IntegrationsSettings;

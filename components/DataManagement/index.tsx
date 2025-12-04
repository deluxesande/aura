import { Download, X } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import axios from "axios";

const DataManagement: React.FC = () => {
    const [selectedDataTypes, setSelectedDataTypes] = useState<string[]>([]);
    const [isDownloading, setIsDownloading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const dataOptions = [
        {
            id: "products",
            label: "Products",
        },
        {
            id: "invoices",
            label: "Invoices",
        },
        {
            id: "customers",
            label: "Customers",
        },
        {
            id: "categories",
            label: "Categories",
        },
    ];

    const handleCheckboxChange = (dataType: string) => {
        setSelectedDataTypes((prev) =>
            prev.includes(dataType)
                ? prev.filter((type) => type !== dataType)
                : [...prev, dataType]
        );
    };

    const handleDownloadClick = async () => {
        if (selectedDataTypes.length === 0) {
            toast.error("Please select at least one data type to download");
            return;
        }

        setIsDownloading(true);

        try {
            // TODO: Implement actual download logic
            // Example: const response = await axios.post('/api/download', { dataTypes: selectedDataTypes });

            await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulated delay

            toast.success(
                `Downloaded ${selectedDataTypes
                    .map(
                        (id) => dataOptions.find((opt) => opt.id === id)?.label
                    )
                    .join(", ")} successfully`
            );
            setSelectedDataTypes([]);
            setShowModal(false);
        } catch (error) {
            toast.error("Failed to download data");
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <section>
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    Data Management
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                    Download your business data for backup or analysis.
                </p>
            </header>

            <div className="mt-6 w-full">
                <button
                    onClick={() => setShowModal(true)}
                    className="btn btn-md btn-ghost text-black flex items-center bg-green-400 w-full mt-8"
                >
                    Download Data
                </button>
            </div>

            {/* Modal */}
            {showModal && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setShowModal(false);
                        }
                    }}
                >
                    <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">
                                Select Data to Download
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto flex-1">
                            <div className="space-y-4">
                                {dataOptions.map((option) => (
                                    <label
                                        key={option.id}
                                        className="flex items-start space-x-3 p-3 rounded-md hover:bg-gray-50 cursor-pointer transition-colors border border-gray-200"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedDataTypes.includes(
                                                option.id
                                            )}
                                            onChange={() =>
                                                handleCheckboxChange(option.id)
                                            }
                                            className="mt-1 h-4 w-4 accent-green-500 bg-transparent border border-gray-300 rounded cursor-pointer focus:ring-2 focus:ring-green-500"
                                        />
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-900">
                                                {option.label}
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-gray-200 bg-gray-50">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-600">
                                    {selectedDataTypes.length} item
                                    {selectedDataTypes.length !== 1
                                        ? "s"
                                        : ""}{" "}
                                    selected
                                </p>
                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => {
                                            setShowModal(false);
                                            setSelectedDataTypes([]);
                                        }}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleDownloadClick}
                                        disabled={
                                            selectedDataTypes.length === 0 ||
                                            isDownloading
                                        }
                                        className="flex items-center justify-center px-6 py-2 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {isDownloading ? (
                                            <>
                                                <span className="loading loading-spinner loading-sm mr-2"></span>
                                                Downloading...
                                            </>
                                        ) : (
                                            <>
                                                <Download className="mr-2 h-4 w-4" />
                                                Download
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default DataManagement;

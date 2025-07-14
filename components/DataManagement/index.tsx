import { Download } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

const DataManagement: React.FC = () => {
    const [showFormatModal, setShowFormatModal] = useState(false);
    const [selectedDataType, setSelectedDataType] = useState("");

    const handleDownloadClick = (dataType: string) => {
        setSelectedDataType(dataType);
        setShowFormatModal(true);
    };

    const handleDownloadData = (format: string) => {
        toast.success(
            `${selectedDataType} data downloaded as ${format.toUpperCase()}`
        );
        setShowFormatModal(false);
        setSelectedDataType("");
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

            <div className="mt-6">
                <div className="bg-white ">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button
                            onClick={() => handleDownloadClick("Products")}
                            className="flex items-center justify-center px-4 py-3 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        >
                            <Download className="mr-2 stroke-green-500" />
                            Download Products
                        </button>

                        <button
                            onClick={() => handleDownloadClick("Invoices")}
                            className="flex items-center justify-center px-4 py-3 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        >
                            <Download className="mr-2 stroke-green-500" />
                            Download Invoices
                        </button>

                        <button
                            onClick={() =>
                                handleDownloadClick("Customer Details")
                            }
                            className="flex items-center justify-center px-4 py-3 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        >
                            <Download className="mr-2 stroke-green-500" />
                            Download Customers
                        </button>
                    </div>
                </div>
            </div>

            {/* Format Selection Modal */}
            {showFormatModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Select Download Format
                        </h3>

                        <p className="text-sm text-gray-600 mb-6">
                            Choose the format to download your{" "}
                            <strong>{selectedDataType}</strong> data:
                        </p>

                        <div className="flex items-center justify-evenly">
                            <button
                                onClick={() => handleDownloadData("excel")}
                                className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                                Excel (.xlsx)
                            </button>

                            <button
                                onClick={() => handleDownloadData("csv")}
                                className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                                CSV (.csv)
                            </button>

                            <button
                                onClick={() => handleDownloadData("pdf")}
                                className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                                PDF (.pdf)
                            </button>
                        </div>

                        <div className="flex justify-end mt-6">
                            <button
                                onClick={() => {
                                    setShowFormatModal(false);
                                    setSelectedDataType("");
                                }}
                                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default DataManagement;

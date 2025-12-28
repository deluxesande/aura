import axios from "axios";
import { Download, X, FileSpreadsheet } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
// import axios from "axios"; // Uncomment when connecting API

const DataManagement: React.FC = () => {
    const [isDownloading, setIsDownloading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    // Inside DataManagement.tsx

    const handleDownloadConfirm = async () => {
        setIsDownloading(true);

        try {
            // Fetch the file as a blob
            const response = await axios.get("/api/download/excel", {
                responseType: "blob",
            });

            // Create a URL for the blob
            const url = window.URL.createObjectURL(new Blob([response.data]));

            // Create a temporary link element to trigger the download
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute(
                "download",
                `business_data_${new Date().toISOString().split("T")[0]}.xlsx`
            );

            // Append to body, click, and cleanup
            document.body.appendChild(link);
            link.click();

            // Clean up
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success("Data downloaded successfully.");
            setShowModal(false);
        } catch (error) {
            console.error(error);
            toast.error("Failed to download data");
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <section className="bg-white p-6 rounded-lg shadow-md w-full">
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    Data Management
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                    Download a complete backup of your business data.
                </p>
            </header>

            <div className="mt-6 w-full">
                <button
                    onClick={() => setShowModal(true)}
                    className="btn btn-md btn-ghost flex items-center bg-green-500 text-white hover:bg-green-600 w-full mt-8"
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
                    <div className="bg-white rounded-lg w-full max-w-md overflow-hidden flex flex-col shadow-xl">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">
                                Export Data
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            <div className="flex items-start space-x-4">
                                <div className="p-3 bg-green-100 rounded-full flex-shrink-0">
                                    <FileSpreadsheet className="w-6 h-6 stroke-green-600" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900">
                                        Download as Excel
                                    </h4>
                                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                                        You are about to download a
                                        comprehensive report containing:
                                    </p>
                                    <p>
                                        All Products, Inventory Invoices,
                                        Transactions, Customer Database &
                                        Categories
                                    </p>
                                    <p className="text-xs text-gray-400 mt-3 italic">
                                        The file will be saved in{" "}
                                        <strong>.xlsx</strong> format.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                            <button
                                onClick={handleDownloadConfirm}
                                disabled={isDownloading}
                                className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[120px]"
                            >
                                {isDownloading ? (
                                    <>Processing...</>
                                ) : (
                                    <>Download</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default DataManagement;

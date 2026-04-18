import { apiClient } from "@/utils/apiClient";
import {
    Download,
    Upload,
    X,
    FileSpreadsheet,
    AlertTriangle,
    Info,
    History,
} from "lucide-react";
import React, { useState, useRef } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const DataManagement: React.FC = () => {
    const router = useRouter();
    // State for Export
    const [isDownloading, setIsDownloading] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);

    // State for Import
    const [isImporting, setIsImporting] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [importFile, setImportFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- EXPORT LOGIC ---
    const handleDownloadConfirm = async () => {
        setIsDownloading(true);
        try {
            const response = await apiClient.get("/download/excel", {
                responseType: "blob",
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute(
                "download",
                `business_data_${new Date().toISOString().split("T")[0]}.xlsx`,
            );
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success("Data downloaded successfully.");
            setShowExportModal(false);
        } catch (error) {
            console.error(error);
            toast.error("Failed to download data");
        } finally {
            setIsDownloading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImportFile(e.target.files[0]);
        }
    };

    const handleImportConfirm = async () => {
        if (!importFile) {
            toast.error("Please select a file to import");
            return;
        }

        setIsImporting(true);
        const formData = new FormData();
        formData.append("file", importFile);

        try {
            await apiClient.post("/import/excel", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            toast.success("Data imported successfully!");
            setShowImportModal(false);
            setImportFile(null);
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.error || "Failed to import data");
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <section className="bg-white p-6 rounded-lg shadow-md w-full">
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    Data Management
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                    Export your data for backup or import external data to your
                    system.
                </p>
            </header>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                    onClick={() => setShowExportModal(true)}
                    className="btn btn-md btn-ghost flex items-center justify-center bg-green-500 text-white hover:bg-green-600 w-full"
                >
                    <Download className="w-4 h-4 mr-2 stroke-white" />
                    Export Data
                </button>

                <button
                    onClick={() => setShowImportModal(true)}
                    className="btn btn-md btn-ghost flex items-center justify-center border border-gray-300 text-gray-700 hover:bg-gray-50 w-full"
                >
                    <Upload className="w-4 h-4 mr-2" />
                    Import Data
                </button>

                <button
                    onClick={() => router.push("/settings/audit-logs")}
                    className="btn btn-md btn-ghost flex items-center justify-center border border-gray-300 text-gray-700 hover:bg-gray-50 w-full"
                >
                    <History className="w-4 h-4 mr-2" />
                    Audit Logs
                </button>
            </div>

            {/* --- EXPORT MODAL --- */}
            {showExportModal && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    onClick={(e) =>
                        e.target === e.currentTarget &&
                        setShowExportModal(false)
                    }
                >
                    <div className="bg-white rounded-lg w-full max-w-md overflow-hidden flex flex-col shadow-xl">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">
                                Export Data
                            </h3>
                            <button
                                onClick={() => setShowExportModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="flex items-start space-x-4">
                                <div className="p-3 bg-green-100 rounded-full flex-shrink-0">
                                    <FileSpreadsheet className="w-6 h-6 stroke-green-500" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900">
                                        Download as Excel
                                    </h4>
                                    <p className="text-sm text-gray-600 mt-2">
                                        You are about to download a
                                        comprehensive report containing all
                                        Products, Invoices, Customers, and
                                        Categories.
                                    </p>
                                    <p className="text-xs text-gray-400 mt-3 italic">
                                        File format: <strong>.xlsx</strong>
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                            <button
                                onClick={handleDownloadConfirm}
                                disabled={isDownloading}
                                className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600 disabled:opacity-50"
                            >
                                {isDownloading ? "Processing..." : "Download"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- IMPORT MODAL --- */}
            {showImportModal && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    onClick={(e) =>
                        e.target === e.currentTarget &&
                        setShowImportModal(false)
                    }
                >
                    <div className="bg-white rounded-lg w-full max-w-md overflow-visible flex flex-col shadow-xl">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Import Data
                                </h3>

                                {/* TOOLTIP CONTAINER */}
                                <div className="relative group">
                                    <Info className="w-4 h-4 text-gray-400 cursor-help" />
                                    {/* Tooltip Content */}
                                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-3 bg-white text-black text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                        <p className="font-semibold mb-1">
                                            Required Excel Structure:
                                        </p>
                                        <ul className="list-disc pl-3 space-y-1 text-gray-300">
                                            <li>
                                                Sheets must be named:{" "}
                                                <strong>
                                                    Products, Invoices,
                                                    Customers, Categories
                                                </strong>
                                            </li>
                                            <li>
                                                Headers must match the export
                                                format exactly.
                                            </li>
                                            <li>
                                                Dates should be formatted as
                                                text or Excel date.
                                            </li>
                                        </ul>
                                        {/* Arrow */}
                                        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-gray-900"></div>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowImportModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Warning Box */}
                            <div className="flex items-start space-x-3 p-3 bg-yellow-50 text-yellow-800 rounded-md border border-yellow-200 text-sm">
                                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <p>
                                    Please ensure your Excel file matches the
                                    required format. Importing data will create
                                    new records.
                                </p>
                            </div>

                            {/* File Upload Area */}
                            <div
                                className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept=".xlsx, .xls"
                                    onChange={handleFileChange}
                                />
                                <div className="p-3 bg-green-100 rounded-full flex-shrink-0">
                                    <Upload className="w-8 h-8 stroke-green-500 mb-3" />
                                </div>
                                {importFile ? (
                                    <div className="text-sm">
                                        <p className="font-semibold text-gray-900">
                                            {importFile.name}
                                        </p>
                                        <p className="text-gray-500">
                                            {(importFile.size / 1024).toFixed(
                                                2,
                                            )}{" "}
                                            KB
                                        </p>
                                    </div>
                                ) : (
                                    <div className="text-sm text-gray-500">
                                        <p className="font-medium text-gray-700">
                                            Click to upload
                                        </p>
                                        <p>or drag and drop Excel file here</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 rounded-b-lg">
                            <button
                                onClick={() => {
                                    setShowImportModal(false);
                                    setImportFile(null);
                                }}
                                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-white"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleImportConfirm}
                                disabled={isImporting || !importFile}
                                className="w-32 flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isImporting ? (
                                    <>
                                        <span className="loading loading-spinner text-white loading-xs mr-2"></span>
                                        Importing
                                    </>
                                ) : (
                                    "Start Import"
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

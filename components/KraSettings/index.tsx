import axios from "axios";
import { AlertCircle, Loader2, RefreshCw, Search } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

interface KraResponse {
    ResponseCode: string;
    Message: string;
    Status: string;
    PINDATA?: {
        KRAPIN: string;
        TypeOfTaxpayer: string;
        Name: string;
        StatusOfPIN: string;
        Station?: string;
    };
}

const fetcher = async ([url, pin]: [string, string]) => {
    try {
        const response = await axios.post(url, { kraPin: pin });
        const data = response.data;

        if (!data?.PINDATA) {
            throw new Error(
                data?.Message ||
                    data?.error ||
                    data?.details?.ErrorMessage ||
                    "Invalid KRA PIN or Data Not Found",
            );
        }

        return data as KraResponse;
    } catch (error: any) {
        const message =
            error.response?.data?.error ||
            error.response?.data?.Message ||
            error.message ||
            "Failed to validate PIN";

        throw new Error(message);
    }
};

const KraSettings = () => {
    const [inputPin, setInputPin] = useState("");
    const [searchPin, setSearchPin] = useState<string | null>(null);

    const { data, error, isLoading, mutate } = useSWR(
        searchPin ? ["/api/kra/validate-kra", searchPin] : null,
        fetcher,
        {
            revalidateOnFocus: false,
            shouldRetryOnError: false,
            onSuccess: (data) => {
                if (data.PINDATA) {
                    toast.success("PIN Validated Successfully");
                }
            },
            onError: (err) => {
                toast.error(err.message);
            },
        },
    );

    const handleValidate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputPin) return;
        setSearchPin(inputPin);
    };

    // Helper to determine status color
    const getStatusColor = (status?: string) => {
        if (status === "Active") return "bg-green-100 text-green-800";
        if (!status) return "bg-gray-100 text-gray-500"; // Default for N/A
        return "bg-yellow-100 text-yellow-800";
    };

    return (
        <section className="bg-white p-6 rounded-lg shadow-md w-full mt-6">
            <header className="mb-6">
                <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                    KRA PIN Validator
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                    Verify taxpayer details before processing invoices or
                    payments.
                </p>
            </header>

            <form
                onSubmit={handleValidate}
                className="flex gap-3 items-start mb-6"
            >
                <div className="flex-1">
                    <div className="relative">
                        <input
                            type="text"
                            value={inputPin}
                            onChange={(e) =>
                                setInputPin(e.target.value.toUpperCase())
                            }
                            placeholder="Enter KRA PIN (e.g. A001234567Z)"
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent uppercase transition-all"
                        />
                        <Search
                            className="absolute left-3 top-2.5 stroke-green-500"
                            size={20}
                        />
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={isLoading || !inputPin}
                    className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
                >
                    {isLoading ? "Checking..." : "Validate"}
                </button>
            </form>

            <div className="bg-slate-50 rounded-lg border-2 border-dashed border-gray-200 p-4 flex flex-col justify-center animate-in fade-in slide-in-from-top-2 duration-200 min-h-[160px]">
                {/* STATE 1: LOADING */}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center text-gray-400 py-[68px]">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                    </div>
                )}

                {/* STATE 3: CONTENT AREA (Always Visible when not Loading) */}
                {!isLoading && (
                    <div>
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2 mb-2">
                                {error ? (
                                    <span className="text-lg font-semibold text-red-600">
                                        Invalid Taxpayer
                                    </span>
                                ) : data?.PINDATA ? (
                                    <span className="text-lg font-semibold text-green-600">
                                        Valid Taxpayer
                                    </span>
                                ) : (
                                    <span className="text-lg font-semibold text-gray-800">
                                        Taxpayer Details
                                    </span>
                                )}
                            </div>

                            <button
                                onClick={() => mutate()}
                                className="text-xs text-gray-500 flex items-center gap-1 hover:text-green-500 transition-colors"
                                title="Refresh Data"
                            >
                                <RefreshCw
                                    size={16}
                                    className="hover:stroke-green-500"
                                />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white p-3 rounded border border-gray-100 shadow-sm">
                                <p className="text-xs text-gray-500 uppercase font-semibold">
                                    Taxpayer Name
                                </p>
                                <p className="text-gray-900 font-medium truncate">
                                    {data?.PINDATA?.Name || "N/A"}
                                </p>
                            </div>

                            <div className="bg-white p-3 rounded border border-gray-100 shadow-sm">
                                <p className="text-xs text-gray-500 uppercase font-semibold">
                                    PIN Status
                                </p>
                                <div
                                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1 ${getStatusColor(
                                        data?.PINDATA?.StatusOfPIN,
                                    )}`}
                                >
                                    {data?.PINDATA?.StatusOfPIN || "Not Set"}
                                </div>
                            </div>

                            <div className="bg-white p-3 rounded border border-gray-100 shadow-sm">
                                <p className="text-xs text-gray-500 uppercase font-semibold">
                                    Taxpayer Type
                                </p>
                                <p className="text-gray-900 font-medium">
                                    {data?.PINDATA?.TypeOfTaxpayer || "N/A"}
                                </p>
                            </div>

                            <div className="bg-white p-3 rounded border border-gray-100 shadow-sm">
                                <p className="text-xs text-gray-500 uppercase font-semibold">
                                    PIN Number
                                </p>
                                <p className="text-gray-900 font-medium font-mono">
                                    {data?.PINDATA?.KRAPIN || "N/A"}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default KraSettings;

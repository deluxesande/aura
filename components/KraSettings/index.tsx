import axios from "axios";
import { AlertCircle, RefreshCw, Search } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

const getFetcher = (url: string) => axios.get(url).then((res) => res.data);

const KraSettings = () => {
    const [inputPin, setInputPin] = useState("");
    const [isValidating, setIsValidating] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);

    const {
        data: storedDetails,
        isLoading: isFetching,
        mutate,
    } = useSWR("/api/kra", getFetcher);

    const handleValidate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputPin) return;

        setIsValidating(true);
        setValidationError(null);

        try {
            const response = await axios.post("/api/kra/validate-kra", {
                kraPin: inputPin,
            });

            if (response.data?.PINDATA) {
                toast.success("PIN Validated & Saved");
                await mutate();
                setInputPin("");
            }
        } catch (error: any) {
            const msg =
                error.response?.data?.error ||
                error.response?.data?.Message ||
                "Validation Failed";
            setValidationError(msg);
            toast.error(msg);
        } finally {
            setIsValidating(false);
        }
    };

    const normalizeData = () => {
        if (!storedDetails) return null;

        if ("kraPin" in storedDetails) {
            return {
                pin: storedDetails.kraPin,
                name: storedDetails.taxpayerName,
                status: storedDetails.pinStatus,
                type: storedDetails.taxpayerType,
            };
        }

        return {
            pin: storedDetails.KRAPIN,
            name: storedDetails.Name,
            status: storedDetails.StatusOfPIN,
            type: storedDetails.TypeOfTaxpayer,
        };
    };

    const displayData = normalizeData();
    const isLoading = isFetching || isValidating;

    const getStatusColor = (status?: string) => {
        if (status === "Active") return "bg-green-100 text-green-800";
        if (!status) return "bg-gray-100 text-gray-500";
        return "bg-yellow-100 text-yellow-800";
    };

    return (
        <section className="bg-white p-6 rounded-lg shadow-md w-full mt-6">
            <header className="mb-4">
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
                className="flex gap-3 items-start mb-4"
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

            <div className="bg-slate-50 rounded-lg border-2 border-dashed border-gray-200 p-4 flex flex-col justify-center min-h-[160px]">
                {/* STATE 1: LOADING */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center text-gray-400 py-[51px]">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-2"></div>
                        <p>
                            {isValidating
                                ? "Validating..."
                                : "Loading Stored Data..."}
                        </p>
                    </div>
                ) : (
                    <div>
                        {/* STATE 2: ERROR */}
                        {/* {validationError && (
                            <div className="flex items-center gap-3 text-red-500 bg-red-50 p-4 rounded-md border border-red-100 w-full mb-4">
                                <AlertCircle
                                    size={24}
                                    className="flex-shrink-0"
                                />
                                <div>
                                    <p className="font-semibold">
                                        Validation Failed
                                    </p>
                                    <p className="text-sm opacity-90">
                                        {validationError}
                                    </p>
                                </div>
                            </div>
                        )} */}

                        {/* STATE 3: CONTENT AREA */}
                        <div>
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2 mb-2">
                                    {validationError ? (
                                        <span className="text-lg font-semibold text-red-500">
                                            Invalid Taxpayer
                                        </span>
                                    ) : displayData ? (
                                        <span className="text-lg font-semibold text-green-500">
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
                                        {displayData?.name || "N/A"}
                                    </p>
                                </div>

                                <div className="bg-white p-3 rounded border border-gray-100 shadow-sm">
                                    <p className="text-xs text-gray-500 uppercase font-semibold">
                                        PIN Status
                                    </p>
                                    <div
                                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1 ${getStatusColor(
                                            displayData?.status,
                                        )}`}
                                    >
                                        {displayData?.status || "Not Set"}
                                    </div>
                                </div>

                                <div className="bg-white p-3 rounded border border-gray-100 shadow-sm">
                                    <p className="text-xs text-gray-500 uppercase font-semibold">
                                        Taxpayer Type
                                    </p>
                                    <p className="text-gray-900 font-medium">
                                        {displayData?.type || "N/A"}
                                    </p>
                                </div>

                                <div className="bg-white p-3 rounded border border-gray-100 shadow-sm">
                                    <p className="text-xs text-gray-500 uppercase font-semibold">
                                        PIN Number
                                    </p>
                                    <p className="text-gray-900 font-medium font-mono">
                                        {displayData?.pin || "N/A"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default KraSettings;

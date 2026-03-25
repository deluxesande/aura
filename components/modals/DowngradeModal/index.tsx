"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";

interface DowngradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    plan: any;
    staffList: any[];
    storeList: any[];
    effectiveStaffLimit: number;
    effectiveStoreLimit: number;
    selectedStaffIds: string[];
    toggleStaffSelection: (id: string) => void;
    selectedStoreIds: string[];
    toggleStoreSelection: (id: string) => void;
    downgradeStep: "STAFF" | "STORES";
    handleDowngradeNextStep: () => void;
    downgradeLoading: boolean;
    userEmail?: string;
}

export default function DowngradeModal({
    isOpen,
    onClose,
    plan,
    staffList,
    storeList,
    effectiveStaffLimit,
    effectiveStoreLimit,
    selectedStaffIds,
    toggleStaffSelection,
    selectedStoreIds,
    toggleStoreSelection,
    downgradeStep,
    handleDowngradeNextStep,
    downgradeLoading,
    userEmail,
}: DowngradeModalProps) {
    if (!isOpen || !plan) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="relative bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden z-10"
                >
                    <div className="p-6 bg-red-50 border-b border-red-100">
                        <h3 className="text-xl font-bold text-red-600 mb-2">
                            Limit Reached
                        </h3>

                        {downgradeStep === "STAFF" && (
                            <>
                                <p className="text-gray-700 text-sm">
                                    The <strong>{plan.name}</strong> plan allows{" "}
                                    <strong>{plan.staffLimit}</strong> total
                                    seat(s).
                                    <br />
                                    You currently have{" "}
                                    <strong>
                                        {staffList.length +
                                            (staffList.some(
                                                (s) => s.email === userEmail,
                                            )
                                                ? 0
                                                : 1)}
                                    </strong>{" "}
                                    (You + active users + pending invites).
                                </p>
                                <p className="text-xs text-red-500 mt-3 font-semibold bg-red-100/50 p-2 rounded-lg">
                                    Please select exactly {effectiveStaffLimit}{" "}
                                    person(s) from this list to keep active.
                                </p>
                            </>
                        )}

                        {downgradeStep === "STORES" && (
                            <>
                                <p className="text-gray-700 text-sm">
                                    The <strong>{plan.name}</strong> plan allows{" "}
                                    <strong>{plan.storeLimit}</strong> total
                                    branch(es).
                                    <br />
                                    You currently have{" "}
                                    <strong>{storeList.length}</strong> active
                                    branches.
                                </p>
                                <p className="text-xs text-red-500 mt-3 font-semibold bg-red-100/50 p-2 rounded-lg">
                                    Please select exactly {effectiveStoreLimit}{" "}
                                    branch(es) to keep active. Unselected
                                    branches will be suspended.
                                </p>
                            </>
                        )}
                    </div>

                    <div className="p-6 max-h-[300px] overflow-y-auto">
                        <div className="space-y-3">
                            {downgradeStep === "STAFF" &&
                                staffList.map((staff) => {
                                    const isSelected =
                                        selectedStaffIds.includes(staff.id);
                                    const isInvite = staff.type === "INVITE";
                                    const isMaxReached =
                                        selectedStaffIds.length >=
                                        effectiveStaffLimit;
                                    const isDisabled =
                                        isInvite ||
                                        (isMaxReached && !isSelected);

                                    return (
                                        <div
                                            key={staff.id}
                                            onClick={() =>
                                                !isDisabled &&
                                                toggleStaffSelection(staff.id)
                                            }
                                            className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
                                                isSelected
                                                    ? "border-green-500 bg-green-50 ring-1 ring-green-500"
                                                    : "border-gray-200 hover:border-gray-300"
                                            } ${isDisabled ? "opacity-50 cursor-not-allowed grayscale-[0.5]" : ""}`}
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-semibold text-gray-900">
                                                        {staff.name ||
                                                            "Staff Member"}
                                                    </p>
                                                    {isInvite && (
                                                        <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full font-bold">
                                                            INVITE
                                                        </span>
                                                    )}
                                                    {staff.email ===
                                                        userEmail && (
                                                        <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full font-bold">
                                                            YOU
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-500">
                                                    {staff.email}
                                                </p>
                                            </div>
                                            <div
                                                className={`w-6 h-6 rounded-full border flex items-center justify-center ${isSelected ? "bg-green-600 border-green-600" : "border-gray-300"}`}
                                            >
                                                {isSelected && (
                                                    <Check
                                                        size={14}
                                                        className="stroke-white"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}

                            {downgradeStep === "STORES" &&
                                storeList.map((store) => {
                                    const isSelected =
                                        selectedStoreIds.includes(store.id);
                                    const isMaxReached =
                                        selectedStoreIds.length >=
                                        effectiveStoreLimit;
                                    const isDisabled =
                                        isMaxReached && !isSelected;

                                    return (
                                        <div
                                            key={store.id}
                                            onClick={() =>
                                                !isDisabled &&
                                                toggleStoreSelection(store.id)
                                            }
                                            className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
                                                isSelected
                                                    ? "border-green-500 bg-green-50 ring-1 ring-green-500"
                                                    : "border-gray-200 hover:border-gray-300"
                                            } ${isDisabled ? "opacity-50 cursor-not-allowed grayscale-[0.5]" : ""}`}
                                        >
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-900">
                                                    {store.name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {store.address ||
                                                        "No address provided"}
                                                </p>
                                            </div>
                                            <div
                                                className={`w-6 h-6 rounded-full border flex items-center justify-center ${isSelected ? "bg-green-600 border-green-600" : "border-gray-300"}`}
                                            >
                                                {isSelected && (
                                                    <Check
                                                        size={14}
                                                        className="stroke-white"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>

                    <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-4">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 px-4 rounded-lg border border-gray-300 text-gray-700 font-bold hover:bg-gray-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDowngradeNextStep}
                            disabled={
                                downgradeLoading ||
                                (downgradeStep === "STAFF" &&
                                    effectiveStaffLimit > 0 &&
                                    selectedStaffIds.length === 0) ||
                                (downgradeStep === "STORES" &&
                                    effectiveStoreLimit > 0 &&
                                    selectedStoreIds.length === 0)
                            }
                            className="flex-1 py-3 px-4 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                        >
                            {downgradeLoading ? (
                                <Loader2 className="animate-spin h-4 w-4 stroke-white" />
                            ) : downgradeStep === "STAFF" &&
                              storeList.length > (plan?.storeLimit || 0) ? (
                                "Next: Select Branches"
                            ) : (
                                "Confirm & Continue"
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

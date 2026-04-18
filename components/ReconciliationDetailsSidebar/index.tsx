"use client";

import { apiClient } from "@/utils/apiClient";
import { Loader2, ClipboardCheck, AlertCircle } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import SidePanel from "../SidePanel";

interface ReconciliationDetailsSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    reconciliationId: string | null;
}

export default function ReconciliationDetailsSidebar({
    isOpen,
    onClose,
    reconciliationId,
}: ReconciliationDetailsSidebarProps) {
    const [reconciliation, setReconciliation] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            try {
                const res = await apiClient.get("/inventory/reconciliation");
                // Since the GET /reconciliation returns all, we find the specific one
                // Usually we'd have a GET /reconciliation/:id, but I'll find it from the list
                const found = res.data.find(
                    (r: any) => r.id === reconciliationId,
                );
                if (found) {
                    setReconciliation(found);
                } else {
                    toast.error("Reconciliation not found");
                    onClose();
                }
            } catch (error) {
                toast.error("Failed to load details");
                onClose();
            } finally {
                setLoading(false);
            }
        };

        if (isOpen && reconciliationId) {
            fetchDetails();
        } else if (!isOpen) {
            setReconciliation(null);
        }
    }, [isOpen, reconciliationId, onClose]);

    const totalDiscrepancies =
        reconciliation?.items?.filter((i: any) => i.discrepancy !== 0).length ||
        0;

    return (
        <SidePanel
            isOpen={isOpen}
            onClose={onClose}
            title={
                reconciliation
                    ? `Reconciliation: ${reconciliation.reference || "Record"}`
                    : "Stocktake Details"
            }
            maxWidth="max-w-3xl"
        >
            {loading ? (
                <div className="h-64 flex items-center justify-center">
                    <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                    </div>
                </div>
            ) : reconciliation ? (
                <div className="p-4 md:p-6 space-y-6">
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row justify-between gap-4">
                            <div>
                                <h1 className="text-xl font-black text-gray-900 uppercase tracking-tight">
                                    {reconciliation.reference ||
                                        "UNNAMED RECORD"}
                                </h1>
                                <div className="flex flex-wrap gap-4 mt-2">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                            Branch
                                        </span>
                                        <span className="text-sm font-bold text-gray-700">
                                            {reconciliation.Store?.name}
                                        </span>
                                    </div>
                                    <div className="flex flex-col border-l border-gray-100 pl-4">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                            User
                                        </span>
                                        <span className="text-sm font-bold text-gray-700">
                                            {reconciliation.User?.firstName}{" "}
                                            {reconciliation.User?.lastName}
                                        </span>
                                    </div>
                                    <div className="flex flex-col border-l border-gray-100 pl-4">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                            Date
                                        </span>
                                        <span className="text-sm font-bold text-gray-700">
                                            {new Date(
                                                reconciliation.createdAt,
                                            ).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-left md:text-right">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-green-50 text-green-500 border border-green-100">
                                    {reconciliation.status}
                                </span>
                            </div>
                        </div>

                        {reconciliation.notes && (
                            <div className="p-6 bg-gray-50/50 border-b border-gray-50">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">
                                    Internal Notes
                                </span>
                                <p className="text-sm text-gray-600 leading-relaxed italic">
                                    &quot;{reconciliation.notes}&quot;
                                </p>
                            </div>
                        )}

                        <div className="p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">
                                    Itemized Breakdown
                                </h3>
                                {totalDiscrepancies > 0 && (
                                    <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-1 rounded-lg border border-red-100">
                                        <span className="text-[10px] font-black uppercase tracking-widest">
                                            {totalDiscrepancies} Discrepancies
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="overflow-x-auto border border-gray-100 rounded-xl">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-gray-50/80 border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                                Product
                                            </th>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">
                                                System
                                            </th>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">
                                                Physical
                                            </th>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">
                                                Diff
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {reconciliation.items?.map(
                                            (item: any) => (
                                                <tr
                                                    key={item.id}
                                                    className="hover:bg-gray-50/30 transition-colors"
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold text-gray-900">
                                                                {
                                                                    item.Product
                                                                        ?.name
                                                                }
                                                            </span>
                                                            <span className="text-[10px] font-medium text-gray-400 font-mono uppercase">
                                                                {
                                                                    item.Product
                                                                        ?.sku
                                                                }
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="text-sm font-bold text-gray-500">
                                                            {
                                                                item.systemQuantity
                                                            }
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="text-sm font-bold text-gray-900">
                                                            {
                                                                item.physicalQuantity
                                                            }
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span
                                                            className={`text-sm font-black ${
                                                                item.discrepancy >
                                                                0
                                                                    ? "text-green-500"
                                                                    : item.discrepancy <
                                                                        0
                                                                      ? "text-red-600"
                                                                      : "text-gray-300"
                                                            }`}
                                                        >
                                                            {item.discrepancy >
                                                            0
                                                                ? "+"
                                                                : ""}
                                                            {item.discrepancy}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ),
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="p-6 bg-gray-50/30 border-t border-gray-100">
                            <div className="flex items-center gap-3 text-gray-500 italic">
                                <p className="text-[11px] leading-relaxed">
                                    This record serves as a permanent
                                    point-in-time snapshot. Completing this
                                    reconciliation adjusted the system inventory
                                    to match the physical counts listed above.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}
        </SidePanel>
    );
}

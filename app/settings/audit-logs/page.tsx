"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { apiClient } from "@/utils/apiClient";
import {
    Search,
    Calendar,
    User as UserIcon,
    Activity,
    ChevronLeft,
    ChevronRight,
    ArrowLeft,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { useDispatch, useSelector } from "react-redux";
import { AppState } from "@/store";
import {
    setAuditLogs,
    setLoading as setAuditLoading,
} from "@/store/slices/auditLogSlice";

export default function AuditLogsPage() {
    const dispatch = useDispatch();
    const router = useRouter();
    const {
        logs,
        lastFetched,
        loading: reduxLoading,
    } = useSelector((state: AppState) => state.auditLog);
    const [loading, setLoading] = useState(!lastFetched);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    useEffect(() => {
        const fetchLogs = async () => {
            // Use cache if fresh (5 mins)
            const CACHE_STALE_TIME = 5 * 60 * 1000;
            if (lastFetched && Date.now() - lastFetched < CACHE_STALE_TIME) {
                setLoading(false);
                return;
            }

            try {
                const res = await apiClient.get("/audit-logs");
                dispatch(setAuditLogs(res.data || []));
            } catch (error: any) {
                if (error.response?.status === 403) {
                    toast.error("Access denied. Admins only.");
                    router.push("/settings");
                } else {
                    toast.error("Failed to load audit logs");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, [dispatch, lastFetched, router]);

    const filteredLogs = logs.filter((log) => {
        const searchLower = searchQuery.toLowerCase();
        const userName =
            `${log.User?.firstName} ${log.User?.lastName}`.toLowerCase();
        return (
            log.action?.toLowerCase().includes(searchLower) ||
            log.entityType?.toLowerCase().includes(searchLower) ||
            userName.includes(searchLower) ||
            log.details?.toLowerCase().includes(searchLower)
        );
    });

    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedLogs = filteredLogs.slice(
        startIndex,
        startIndex + itemsPerPage,
    );

    const renderDetails = (log: any) => {
        if (!log.details) return <span className="text-gray-400">--</span>;

        try {
            const details = JSON.parse(log.details);

            switch (log.action) {
                case "CREATE_PRODUCT":
                    return (
                        <div className="flex flex-col text-[11px] leading-tight">
                            <span className="font-bold text-green-500">
                                {details.name}
                            </span>
                            <span className="text-gray-500">
                                SKU: {details.sku}
                            </span>
                        </div>
                    );
                case "CREATE_PRODUCTS_BATCH":
                    return (
                        <span className="text-[11px] font-bold text-green-500">
                            Batch upload: {details.count} items
                        </span>
                    );
                case "ARCHIVE_PRODUCT":
                    return (
                        <div className="flex flex-col text-[11px] leading-tight">
                            <span className="font-bold text-red-600">
                                {details.name}
                            </span>
                            <span className="text-gray-500 font-medium">
                                Product archived
                            </span>
                        </div>
                    );
                case "UPDATE_PRODUCT":
                    return (
                        <div className="flex flex-col text-[11px] leading-tight">
                            <span className="font-bold text-gray-700">
                                {details.name}
                            </span>
                            <span className="text-gray-400">
                                Price/Qty updated
                            </span>
                        </div>
                    );
                case "CREATE_INVOICE":
                    return (
                        <div className="flex flex-col text-[11px] leading-tight">
                            <span className="font-bold text-gray-700">
                                {details.invoiceName}
                            </span>
                            <span className="text-green-500 font-black">
                                KSH {details.totalAmount}
                            </span>
                        </div>
                    );
                case "VOID_INVOICE":
                    return (
                        <div className="flex flex-col text-[11px] leading-tight">
                            <span className="font-bold text-gray-700">
                                {details.invoiceName}
                            </span>
                            <span className="text-red-600 font-bold tracking-tight">
                                Invoice Voided
                            </span>
                        </div>
                    );
                case "INVENTORY_RECONCILIATION":
                    return (
                        <span className="text-[11px] font-medium text-gray-600">
                            {details.itemsCount} items reconciled
                        </span>
                    );
                case "UPDATE_BUSINESS_SETTINGS":
                    return (
                        <span className="text-[11px] font-medium text-gray-600 italic">
                            Modified: {details.changedFields?.join(", ")}
                        </span>
                    );
                case "UPDATE_STAFF":
                    return (
                        <div className="flex flex-col text-[11px] leading-tight">
                            <span className="font-bold text-gray-700">
                                {details.targetEmail}
                            </span>
                            <span className="text-gray-500 font-medium tracking-tight uppercase">
                                New Role: {details.role}
                            </span>
                        </div>
                    );
                default:
                    return (
                        <span className="text-[10px] text-gray-500 font-mono truncate max-w-[200px] block">
                            {log.details}
                        </span>
                    );
            }
        } catch (e) {
            return (
                <span className="text-[10px] text-gray-400 italic">
                    Unparseable details
                </span>
            );
        }
    };

    if (loading) {
        return (
            <Navbar>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                </div>
            </Navbar>
        );
    }

    return (
        <Navbar>
            <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push("/settings")}
                            className="shrink-0 p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors mt-0.5"
                        >
                            <ArrowLeft size={20} className="text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Audit Logs
                            </h1>
                        </div>
                    </div>

                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search logs..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-sm shadow-sm"
                        />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        Action
                                    </th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        Entity
                                    </th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        Details
                                    </th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        Date & Time
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {paginatedLogs.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="px-6 py-12 text-center text-gray-500 text-sm"
                                        >
                                            No audit logs found.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedLogs.map((log, index) => (
                                        <motion.tr
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.03 }}
                                            key={log.id}
                                            className="hover:bg-gray-50/50 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-bold text-gray-900 tracking-tight uppercase">
                                                    {log.action.replace(
                                                        /_/g,
                                                        " ",
                                                    )}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-gray-100 text-gray-500 uppercase tracking-widest">
                                                    {log.entityType}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {renderDetails(log)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-gray-700">
                                                        {log.User?.firstName}{" "}
                                                        {log.User?.lastName}
                                                    </span>
                                                    <span className="text-[10px] font-medium text-gray-400 uppercase tracking-tight">
                                                        {log.User?.email}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-gray-700">
                                                        {new Date(
                                                            log.createdAt,
                                                        ).toLocaleDateString()}
                                                    </span>
                                                    <span className="text-[10px] font-medium text-gray-400 uppercase tracking-tight">
                                                        {new Date(
                                                            log.createdAt,
                                                        ).toLocaleTimeString()}
                                                    </span>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                            <p className="text-xs text-gray-500">
                                Showing {startIndex + 1} to{" "}
                                {Math.min(
                                    startIndex + itemsPerPage,
                                    filteredLogs.length,
                                )}{" "}
                                of {filteredLogs.length} logs
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() =>
                                        setCurrentPage((prev) =>
                                            Math.max(prev - 1, 1),
                                        )
                                    }
                                    disabled={currentPage === 1}
                                    className="p-1.5 rounded-lg hover:bg-white border border-transparent hover:border-gray-200 disabled:opacity-30 transition-all"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button
                                    onClick={() =>
                                        setCurrentPage((prev) =>
                                            Math.min(prev + 1, totalPages),
                                        )
                                    }
                                    disabled={currentPage === totalPages}
                                    className="p-1.5 rounded-lg hover:bg-white border border-transparent hover:border-gray-200 disabled:opacity-30 transition-all"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Navbar>
    );
}

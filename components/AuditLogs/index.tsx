"use client";

import React, { useEffect, useState } from "react";
import { apiClient } from "@/utils/apiClient";
import {
    Search,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { AppState } from "@/store";
import {
    setAuditLogs,
} from "@/store/slices/auditLogSlice";

const AuditLogs: React.FC = () => {
    const dispatch = useDispatch();
    const {
        logs,
        lastFetched,
    } = useSelector((state: AppState) => state.auditLog);
    const [loading, setLoading] = useState(!lastFetched);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    useEffect(() => {
        const fetchLogs = async () => {
            const CACHE_STALE_TIME = 5 * 60 * 1000;
            if (lastFetched && Date.now() - lastFetched < CACHE_STALE_TIME) {
                setLoading(false);
                return;
            }

            try {
                const res = await apiClient.get("/audit-logs");
                dispatch(setAuditLogs(res.data || []));
            } catch (error: any) {
                toast.error("Failed to load audit logs");
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, [dispatch, lastFetched]);

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
                            <span className="font-bold text-green-500">{details.name}</span>
                            <span className="text-gray-500 text-[10px]">SKU: {details.sku}</span>
                        </div>
                    );
                case "UPDATE_PRODUCT":
                    return (
                        <div className="flex flex-col text-[11px] leading-tight">
                            <span className="font-bold text-gray-700">{details.name}</span>
                            <span className="text-gray-400 text-[10px]">Updated</span>
                        </div>
                    );
                case "CREATE_INVOICE":
                    return (
                        <div className="flex flex-col text-[11px] leading-tight">
                            <span className="font-bold text-gray-700">{details.invoiceName}</span>
                            <span className="text-green-500 font-black">KSH {details.totalAmount}</span>
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
            return <span className="text-[10px] text-gray-400 italic">Unparseable details</span>;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-gray-900">Audit Logs</h2>
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search activity logs..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-sm"
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Entity</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Details</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {paginatedLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 text-sm">No activity found.</td>
                                </tr>
                            ) : (
                                paginatedLogs.map((log, index) => (
                                    <motion.tr
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.02 }}
                                        key={log.id}
                                        className="hover:bg-gray-50/50 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-bold text-gray-900 tracking-tight uppercase">
                                                {log.action.replace(/_/g, " ")}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black bg-gray-100 text-gray-500 uppercase tracking-widest">
                                                {log.entityType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">{renderDetails(log)}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-700">{log.User?.firstName} {log.User?.lastName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-500">
                                            {new Date(log.createdAt).toLocaleString()}
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
                            Page {currentPage} of {totalPages}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="p-1.5 rounded-lg hover:bg-white border border-transparent hover:border-gray-200 disabled:opacity-30 transition-all"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
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
    );
};

export default AuditLogs;

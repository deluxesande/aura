"use client";

import { apiClient } from "@/utils/apiClient";
import { Loader2, Truck } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import SidePanel from "../SidePanel";

interface OrderDetailsSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    orderId: string | null;
}

export default function OrderDetailsSidebar({
    isOpen,
    onClose,
    orderId,
}: OrderDetailsSidebarProps) {
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            setLoading(true);
            try {
                const res = await apiClient.get(`/purchase-orders/${orderId}`);
                setOrder(res.data);
            } catch (error) {
                toast.error("Failed to load order details");
                onClose();
            } finally {
                setLoading(false);
            }
        };

        if (isOpen && orderId) {
            fetchOrder();
        } else if (!isOpen) {
            setOrder(null);
        }
    }, [isOpen, orderId, onClose]);

    // Animation Stage Logic
    const getStageIndex = () => {
        if (!order) return 1;
        if (order.status === "DELIVERED") return 3;
        if (order.status === "IN_TRANSIT") return 2;
        return 1; // PENDING
    };
    const stageIndex = getStageIndex();

    return (
        <SidePanel
            isOpen={isOpen}
            onClose={onClose}
            title={order ? `Order ${order.reference}` : "Order Details"}
            maxWidth="max-w-3xl"
        >
            {loading ? (
                <div className="h-64 flex items-center justify-center">
                    <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                    </div>
                </div>
            ) : order ? (
                <div className="p-4 md:p-6 space-y-6 font-sans">
                    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
                        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-10">
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">
                                    {order.reference}
                                </h1>
                                <p className="text-sm text-gray-500 mt-1">
                                    Supplier:{" "}
                                    <span className="font-bold text-gray-900">
                                        {order.Supplier?.name}
                                    </span>
                                </p>
                            </div>
                            <div className="text-left sm:text-right flex flex-col justify-center">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                    Order Status
                                </p>
                                <p className="text-lg font-bold text-green-500 mt-0.5">
                                    {order.status}
                                </p>
                            </div>
                        </div>

                        {/* --- Minimal 3-Stage Progress Animation --- */}
                        <div className="relative py-12 px-4 border-y border-gray-50 bg-gray-50/30 overflow-hidden rounded-lg">
                            <div className="max-w-md mx-auto relative px-6">
                                {/* Background Track Line */}
                                <div className="absolute left-0 right-0 top-1/2 h-1 bg-gray-200 -translate-y-1/2 z-0" />

                                {/* Animated Progress Fill */}
                                <motion.div
                                    className="absolute left-0 top-1/2 h-1 bg-green-500 -translate-y-1/2 z-0"
                                    initial={{ width: "0%" }}
                                    animate={{
                                        width:
                                            stageIndex === 1
                                                ? "0%"
                                                : stageIndex === 2
                                                  ? "50%"
                                                  : "100%",
                                    }}
                                    transition={{
                                        duration: 1,
                                        ease: "easeInOut",
                                    }}
                                />

                                {/* Stage Nodes */}
                                <div className="flex justify-between relative z-10">
                                    {/* Stage 1: Pending */}
                                    <div className="flex flex-col items-center relative">
                                        <div
                                            className={`w-5 h-5 rounded-full border-4 bg-white transition-colors duration-500 ${stageIndex >= 1 ? "border-green-500" : "border-gray-300"}`}
                                        />
                                        <p
                                            className={`absolute top-8 text-[10px] font-bold uppercase tracking-wider ${stageIndex >= 1 ? "text-green-500" : "text-gray-400"}`}
                                        >
                                            Pending
                                        </p>
                                    </div>

                                    {/* Stage 2: In Transit */}
                                    <div className="flex flex-col items-center relative">
                                        <div
                                            className={`w-5 h-5 rounded-full border-4 bg-white transition-colors duration-500 delay-300 ${stageIndex >= 2 ? "border-green-500" : "border-gray-300"}`}
                                        />
                                        <p
                                            className={`absolute top-8 text-[10px] font-bold uppercase tracking-wider ${stageIndex >= 2 ? "text-green-500" : "text-gray-400"}`}
                                        >
                                            Transit
                                        </p>
                                    </div>

                                    {/* Stage 3: Delivered */}
                                    <div className="flex flex-col items-center relative">
                                        <div
                                            className={`w-5 h-5 rounded-full border-4 bg-white transition-colors duration-500 delay-700 ${stageIndex >= 3 ? "border-green-500" : "border-gray-300"}`}
                                        />
                                        <p
                                            className={`absolute top-8 text-[10px] font-bold uppercase tracking-wider ${stageIndex >= 3 ? "text-green-500" : "text-gray-400"}`}
                                        >
                                            Delivered
                                        </p>
                                    </div>
                                </div>

                                {/* Moving Truck Icon */}
                                <motion.div
                                    className="absolute top-1/2 -mt-4 -ml-4 w-8 h-8 bg-white border-2 border-green-500 rounded-full flex items-center justify-center shadow-md z-20"
                                    initial={{ left: "0%" }}
                                    animate={{
                                        left:
                                            stageIndex === 1
                                                ? "0%"
                                                : stageIndex === 2
                                                  ? "50%"
                                                  : "100%",
                                    }}
                                    transition={{
                                        duration: 1,
                                        ease: "easeInOut",
                                    }}
                                >
                                    <Truck className="w-4 h-4 stroke-green-500" />
                                </motion.div>
                            </div>
                        </div>

                        {/* --- Order Contents View --- */}
                        <div className="mt-10">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                                <h3 className="text-lg font-bold text-gray-900">
                                    Order Contents
                                </h3>
                                <p className="text-xs font-bold text-gray-500 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg">
                                    Total Items: {order.items?.length || 0}
                                </p>
                            </div>

                            <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50/50">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">
                                                Product
                                            </th>
                                            <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">
                                                Quantity
                                            </th>
                                            <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">
                                                Unit Cost
                                            </th>
                                            <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">
                                                Subtotal
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {order.items &&
                                        order.items.length > 0 ? (
                                            order.items.map((item: any) => (
                                                <tr key={item.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                                        {item.Product?.name ||
                                                            "Unknown Product"}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-gray-700">
                                                        {item.quantity}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                                                        KSh{" "}
                                                        {(
                                                            item.unitCost || 0
                                                        ).toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-gray-900">
                                                        KSh{" "}
                                                        {(
                                                            (item.quantity ||
                                                                0) *
                                                            (item.unitCost || 0)
                                                        ).toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={4}
                                                    className="px-6 py-12 text-center text-sm text-gray-500"
                                                >
                                                    No items found in this
                                                    order.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {order.status !== "DELIVERED" && (
                                <div className="mt-6 flex justify-end">
                                    <p className="text-xs text-gray-500">
                                        Use the Delivery History page to
                                        formally log the receipt of these items.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : null}
        </SidePanel>
    );
}

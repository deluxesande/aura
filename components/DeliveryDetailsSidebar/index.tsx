"use client";

import { apiClient } from "@/utils/apiClient";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import DownloadDeliveryButton from "@/components/pdf/DownloadDeliveryButton";
import SidePanel from "../SidePanel";

interface DeliveryDetailsSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    deliveryId: string | null;
}

export default function DeliveryDetailsSidebar({
    isOpen,
    onClose,
    deliveryId,
}: DeliveryDetailsSidebarProps) {
    const [delivery, setDelivery] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchDelivery = async () => {
            setLoading(true);
            try {
                const res = await apiClient.get(
                    `/inventory/deliveries/${deliveryId}`,
                );
                setDelivery(res.data);
            } catch (error) {
                toast.error("Failed to load delivery details");
                onClose();
            } finally {
                setLoading(false);
            }
        };

        if (isOpen && deliveryId) {
            fetchDelivery();
        } else if (!isOpen) {
            setDelivery(null);
        }
    }, [isOpen, deliveryId, onClose]);

    if (!isOpen && !delivery) return null;

    const totalItems =
        delivery?.receipts?.reduce(
            (sum: number, r: any) => sum + (r.quantity || 0),
            0,
        ) || 0;

    return (
        <SidePanel
            isOpen={isOpen}
            onClose={onClose}
            title={
                delivery
                    ? `Delivery ${delivery.reference || "Receipt"}`
                    : "Delivery Details"
            }
            maxWidth="max-w-4xl"
        >
            {loading ? (
                <div className="h-64 flex items-center justify-center">
                    <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                    </div>
                </div>
            ) : delivery ? (
                <div className="p-4 md:p-6 space-y-6 font-sans">
                    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
                        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-8">
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">
                                    Delivery Receipt
                                </h1>
                                <p className="text-sm text-gray-500 mt-1">
                                    Reference:{" "}
                                    <span className="font-bold text-gray-900">
                                        {delivery.reference || "N/A"}
                                    </span>
                                </p>
                                {delivery.PurchaseOrder && (
                                    <p className="text-xs text-gray-500 mt-1 italic">
                                        Linked PO:{" "}
                                        {delivery.PurchaseOrder.reference}
                                    </p>
                                )}
                            </div>
                            <div className="flex flex-col sm:flex-row items-center gap-3">
                                <div className="text-left sm:text-right flex flex-col justify-center">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        Status
                                    </p>
                                    <p className="text-lg font-bold text-green-500 mt-0.5 uppercase tracking-wider">
                                        {delivery.status}
                                    </p>
                                    <DownloadDeliveryButton
                                        delivery={delivery}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 border-y border-gray-100 mb-8 bg-gray-50/30 px-6 rounded-lg">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                                    Supplier
                                </p>
                                <p className="text-sm font-bold text-gray-900">
                                    {delivery.Supplier?.name || "Direct / Cash"}
                                </p>
                                {delivery.Supplier?.email && (
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        {delivery.Supplier.email}
                                    </p>
                                )}
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                                    Destination Store
                                </p>
                                <p className="text-sm font-semibold text-gray-900">
                                    {delivery.Store?.name || "Unknown Branch"}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {new Date(
                                        delivery.createdAt,
                                    ).toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                                    Logged By
                                </p>
                                {delivery.creator ? (
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 bg-gray-200">
                                            <Image
                                                src={
                                                    delivery.creator.imageUrl ||
                                                    "/images/user.png"
                                                }
                                                alt="User"
                                                className="w-full h-full object-cover"
                                                width={24}
                                                height={24}
                                            />
                                        </div>
                                        <p className="text-sm font-bold text-gray-900">
                                            {delivery.creator.firstName}{" "}
                                            {delivery.creator.lastName}
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 italic">
                                        System
                                    </p>
                                )}
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-end mb-4">
                                <h3 className="text-lg font-bold text-gray-900">
                                    Received Items
                                </h3>
                                <p className="text-xs font-semibold text-gray-500 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg">
                                    Total Qty: {totalItems}
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
                                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-widest">
                                                Unit Cost
                                            </th>
                                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-widest">
                                                Subtotal
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {delivery.receipts &&
                                        delivery.receipts.length > 0 ? (
                                            delivery.receipts.map(
                                                (item: any) => (
                                                    <tr key={item.id}>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <p className="text-sm font-bold text-gray-900">
                                                                {item.Product
                                                                    ?.name ||
                                                                    "Unknown Product"}
                                                            </p>
                                                            <p className="text-xs text-gray-500 mt-0.5">
                                                                SKU:{" "}
                                                                {item.Product
                                                                    ?.sku ||
                                                                    "N/A"}
                                                            </p>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-gray-700">
                                                            {item.quantity}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-600">
                                                            KSh{" "}
                                                            {(
                                                                item.unitCost ||
                                                                0
                                                            ).toLocaleString()}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                                                            KSh{" "}
                                                            {(
                                                                item.totalCost ||
                                                                0
                                                            ).toLocaleString()}
                                                        </td>
                                                    </tr>
                                                ),
                                            )
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={4}
                                                    className="px-6 py-12 text-center text-sm text-gray-500"
                                                >
                                                    No items found in this
                                                    delivery.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-8 flex justify-end">
                                <div className="w-full sm:w-64 bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <div className="flex justify-between items-center text-sm mb-2">
                                        <span className="text-gray-500 font-bold">
                                            Total Items:
                                        </span>
                                        <span className="text-gray-900 font-bold">
                                            {totalItems}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center border-t border-gray-200 pt-2 mt-2">
                                        <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">
                                            Total Value:
                                        </span>
                                        <span className="text-lg font-black text-gray-900">
                                            KSh{" "}
                                            {(
                                                delivery.totalCost || 0
                                            ).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}
        </SidePanel>
    );
}

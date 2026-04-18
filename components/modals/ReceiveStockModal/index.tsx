"use client";

import React, { useState, useEffect } from "react";
import { apiClient } from "@/utils/apiClient";
import { toast } from "sonner";
import { FloatingPortal } from "@floating-ui/react";
import { motion } from "framer-motion";
import { Loader2, ChevronDown, X, Plus, Trash2 } from "lucide-react";
import { useSelector } from "react-redux";
import { AppState } from "@/store";
import { useBarcodeScanner } from "@/hooks/useBarcodeScanner";

interface ReceiveStockModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    suppliers: any[];
    delivery?: any; // If provided, we are in EDIT mode
}

export default function ReceiveStockModal({
    isOpen,
    onClose,
    onSuccess,
    suppliers,
    delivery,
}: ReceiveStockModalProps) {
    const businessDetails = useSelector(
        (state: AppState) => state.businessData?.businessDetails,
    );

    const [products, setProducts] = useState<any[]>([]);
    const [stores, setStores] = useState<any[]>([]);
    const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Group-level details
    const [deliveryDetails, setDeliveryDetails] = useState({
        storeId: "",
        supplierId: "",
        purchaseOrderId: "",
        reference: "",
    });

    // Dynamic line items
    const [items, setItems] = useState([
        { productId: "", quantity: "", unitCost: "" },
    ]);

    useEffect(() => {
        if (isOpen && businessDetails?.id) {
            Promise.all([
                apiClient.get("/product"),
                apiClient.get(`/business/${businessDetails.id}/stores`),
                apiClient.get("/purchase-orders"),
            ])
                .then(([prodRes, storeRes, poRes]) => {
                    setProducts(
                        Array.isArray(prodRes.data)
                            ? prodRes.data.filter(
                                  (p: any) => p.type !== "TEMPLATE",
                              )
                            : [],
                    );
                    setStores(
                        storeRes.data.filter(
                            (s: any) => s.isActive !== false,
                        ) || [],
                    );
                    setPurchaseOrders(
                        Array.isArray(poRes.data)
                            ? poRes.data.filter(
                                  (po: any) =>
                                      po.status === "DELIVERED" ||
                                      po.status === "PENDING" ||
                                      po.status === "IN_TRANSIT",
                              )
                            : [],
                    );

                    if (delivery) {
                        setDeliveryDetails({
                            storeId: delivery.storeId || "",
                            supplierId: delivery.supplierId || "",
                            purchaseOrderId: delivery.purchaseOrderId || "",
                            reference: delivery.reference || "",
                        });
                        if (delivery.receipts && delivery.receipts.length > 0) {
                            setItems(
                                delivery.receipts.map((r: any) => ({
                                    productId: r.productId,
                                    quantity: r.quantity.toString(),
                                    unitCost: r.unitCost.toString(),
                                })),
                            );
                        }
                    } else {
                        // Reset if not editing
                        setDeliveryDetails({
                            storeId: "",
                            supplierId: "",
                            purchaseOrderId: "",
                            reference: "",
                        });
                        setItems([
                            { productId: "", quantity: "", unitCost: "" },
                        ]);
                    }

                    setLoadingData(false);
                })
                .catch(() => {
                    toast.error("Failed to load inventory data");
                    setLoadingData(false);
                });
        }
    }, [isOpen, businessDetails?.id, delivery]);

    const handlePOSelection = (poId: string) => {
        const selectedPO = purchaseOrders.find((po) => po.id === poId);
        if (selectedPO) {
            setDeliveryDetails({
                ...deliveryDetails,
                purchaseOrderId: poId,
                supplierId: selectedPO.supplierId || "",
                reference: selectedPO.reference || deliveryDetails.reference,
            });

            const poItems = selectedPO.items.map((item: any) => ({
                productId: item.productId,
                quantity: item.quantity.toString(),
                unitCost: item.unitCost.toString(),
            }));

            if (poItems.length > 0) {
                setItems(poItems);
            }
        } else {
            setDeliveryDetails({
                ...deliveryDetails,
                purchaseOrderId: "",
            });
        }
    };

    useBarcodeScanner((barcode) => {
        const foundProduct = products.find(
            (p) => p.sku === barcode || p.barcode === barcode,
        );

        if (foundProduct) {
            setItems((prevItems) => {
                const newItems = [...prevItems];
                const existingIndex = newItems.findIndex(
                    (item) => item.productId === foundProduct.id,
                );

                if (existingIndex >= 0) {
                    const currentQty =
                        parseInt(newItems[existingIndex].quantity) || 0;
                    newItems[existingIndex].quantity = (
                        currentQty + 1
                    ).toString();
                    toast.success(`Increased qty: ${foundProduct.name}`);
                } else {
                    if (
                        newItems.length === 1 &&
                        !newItems[0].productId &&
                        !newItems[0].quantity &&
                        !newItems[0].unitCost
                    ) {
                        newItems[0] = {
                            productId: foundProduct.id,
                            quantity: "1",
                            unitCost: foundProduct.costPrice?.toString() || "",
                        };
                    } else {
                        newItems.push({
                            productId: foundProduct.id,
                            quantity: "1",
                            unitCost: foundProduct.costPrice?.toString() || "",
                        });
                    }
                    toast.success(`Added: ${foundProduct.name}`);
                }
                return newItems;
            });
        }
    });

    if (!isOpen) return null;

    const handleAddItem = () => {
        setItems([...items, { productId: "", quantity: "", unitCost: "" }]);
    };

    const handleRemoveItem = (index: number) => {
        if (items.length > 1) {
            const newItems = [...items];
            newItems.splice(index, 1);
            setItems(newItems);
        }
    };

    const handleItemChange = (index: number, field: string, value: string) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const grandTotal = items.reduce((sum, item) => {
        const q = Number(item.quantity) || 0;
        const c = Number(item.unitCost) || 0;
        return sum + q * c;
    }, 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const invalidItems = items.some(
            (item) =>
                !item.productId ||
                Number(item.quantity) <= 0 ||
                Number(item.unitCost) < 0,
        );
        if (invalidItems) {
            toast.error(
                "Please ensure all items have a product, valid quantity, and cost.",
            );
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                storeId: deliveryDetails.storeId,
                supplierId: deliveryDetails.supplierId || null,
                purchaseOrderId: deliveryDetails.purchaseOrderId || null,
                reference: deliveryDetails.reference,
                items: items.map((item) => ({
                    productId: item.productId,
                    quantity: Number(item.quantity),
                    unitCost: Number(item.unitCost),
                })),
            };

            if (delivery) {
                await apiClient.patch(
                    `/inventory/deliveries/${delivery.id}`,
                    payload,
                );
                toast.success("Delivery updated and inventory reconciled.");
            } else {
                await apiClient.post("/inventory/receipt", payload);
                toast.success("Stock received and inventory updated.");
            }

            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(
                error.response?.data?.error || "Failed to save delivery",
            );
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <FloatingPortal>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="bg-white rounded-lg w-full max-w-3xl shadow-2xl border border-gray-100 overflow-hidden relative flex flex-col max-h-[90vh]"
                >
                    <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white/50 backdrop-blur-sm flex-shrink-0">
                        <div>
                            <h3 className="font-bold text-lg text-gray-900">
                                {delivery
                                    ? "Edit Delivery"
                                    : "Log Incoming Delivery"}
                            </h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {delivery
                                    ? "Modify items and update inventory."
                                    : "Receive multiple products under a single invoice. (Barcode scanning active)"}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {loadingData ? (
                        <div className="p-20 flex justify-center">
                            <div className="flex flex-col items-center justify-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                            </div>
                        </div>
                    ) : (
                        <form
                            onSubmit={handleSubmit}
                            className="flex flex-col flex-1 overflow-hidden"
                        >
                            <div className="p-6 overflow-y-auto flex-1 space-y-8 bg-gray-50/30">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                            Destination Branch
                                        </label>
                                        <div className="relative">
                                            <select
                                                required
                                                value={deliveryDetails.storeId}
                                                onChange={(e) =>
                                                    setDeliveryDetails({
                                                        ...deliveryDetails,
                                                        storeId: e.target.value,
                                                    })
                                                }
                                                className="w-full pl-4 pr-10 py-2.5 bg-slate-50 outline-none border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm appearance-none cursor-pointer"
                                            >
                                                <option value="" disabled>
                                                    Select Branch...
                                                </option>
                                                {stores.map((s, idx) => (
                                                    <option
                                                        key={`rec-store-${s.id || idx}`}
                                                        value={s.id}
                                                    >
                                                        {s.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                            Purchase Order
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={
                                                    deliveryDetails.purchaseOrderId
                                                }
                                                onChange={(e) =>
                                                    handlePOSelection(
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full pl-4 pr-10 py-2.5 bg-slate-50 outline-none border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm appearance-none cursor-pointer"
                                            >
                                                <option value="">
                                                    Manual / No PO
                                                </option>
                                                {purchaseOrders.map(
                                                    (po, idx) => (
                                                        <option
                                                            key={`rec-po-${po.id || idx}`}
                                                            value={po.id}
                                                        >
                                                            {po.reference} (
                                                            {po.Supplier?.name})
                                                        </option>
                                                    ),
                                                )}
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                            Supplier
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={
                                                    deliveryDetails.supplierId
                                                }
                                                onChange={(e) =>
                                                    setDeliveryDetails({
                                                        ...deliveryDetails,
                                                        supplierId:
                                                            e.target.value,
                                                    })
                                                }
                                                className="w-full pl-4 pr-10 py-2.5 bg-slate-50 outline-none border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm appearance-none cursor-pointer"
                                            >
                                                <option value="">
                                                    None (Direct/Cash)
                                                </option>
                                                {suppliers.map((s, idx) => (
                                                    <option
                                                        key={`rec-supp-${s.id || idx}`}
                                                        value={s.id}
                                                    >
                                                        {s.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                            Invoice / Ref No.
                                        </label>
                                        <input
                                            type="text"
                                            value={deliveryDetails.reference}
                                            onChange={(e) =>
                                                setDeliveryDetails({
                                                    ...deliveryDetails,
                                                    reference: e.target.value,
                                                })
                                            }
                                            className="w-full px-4 py-2.5 bg-slate-50 outline-none border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm"
                                            placeholder="e.g. INV-2026-001"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                                            Line Items
                                        </h4>
                                        <button
                                            type="button"
                                            onClick={handleAddItem}
                                            className="flex items-center gap-1.5 text-xs font-bold text-green-500 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors"
                                        >
                                            <Plus
                                                size={14}
                                                className="stroke-green-600"
                                            />{" "}
                                            Add Product
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {items.map((item, index) => (
                                            <div
                                                key={`line-item-${index}`}
                                                className="flex flex-col md:flex-row items-start md:items-center gap-3 bg-white p-3 rounded-xl border border-gray-200 shadow-sm relative group"
                                            >
                                                <div className="w-full md:flex-1 relative">
                                                    <select
                                                        required
                                                        value={item.productId}
                                                        onChange={(e) =>
                                                            handleItemChange(
                                                                index,
                                                                "productId",
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="w-full pl-4 pr-10 py-2 bg-slate-50 outline-none border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm appearance-none cursor-pointer"
                                                    >
                                                        <option
                                                            value=""
                                                            disabled
                                                        >
                                                            Select Product...
                                                        </option>
                                                        {products.map(
                                                            (p, idx) => (
                                                                <option
                                                                    key={`prod-opt-${p.id || idx}`}
                                                                    value={p.id}
                                                                >
                                                                    {p.name}
                                                                </option>
                                                            ),
                                                        )}
                                                    </select>
                                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                                                </div>

                                                <div className="w-full md:w-32">
                                                    <input
                                                        required
                                                        type="number"
                                                        min="1"
                                                        value={item.quantity}
                                                        onChange={(e) =>
                                                            handleItemChange(
                                                                index,
                                                                "quantity",
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="no-spinner w-full px-3 py-2 bg-slate-50 outline-none border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm"
                                                        placeholder="Qty"
                                                    />
                                                </div>

                                                <div className="w-full md:w-40 relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                                                        KSh
                                                    </span>
                                                    <input
                                                        required
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={item.unitCost}
                                                        onChange={(e) =>
                                                            handleItemChange(
                                                                index,
                                                                "unitCost",
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="no-spinner w-full pl-10 pr-3 py-2 bg-slate-50 outline-none border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm"
                                                        placeholder="Unit Cost"
                                                    />
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleRemoveItem(index)
                                                    }
                                                    disabled={
                                                        items.length === 1
                                                    }
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 border-t border-gray-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-4 flex-shrink-0">
                                <div className="text-left w-full sm:w-auto bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        Invoice Total
                                    </p>
                                    <p className="text-xl font-semibold text-gray-900">
                                        KSh {grandTotal.toLocaleString()}
                                    </p>
                                </div>
                                <div className="flex gap-3 w-full sm:w-auto">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        disabled={isSaving}
                                        className="flex-1 sm:flex-none py-2.5 px-6 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="flex-1 sm:flex-none py-2.5 px-6 text-sm font-bold text-white bg-green-500 rounded-lg hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                                    >
                                        {isSaving ? (
                                            <Loader2 className="animate-spin w-4 h-4 stroke-white" />
                                        ) : delivery ? (
                                            "Update Delivery"
                                        ) : (
                                            "Save Delivery"
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}
                </motion.div>
            </motion.div>
        </FloatingPortal>
    );
}

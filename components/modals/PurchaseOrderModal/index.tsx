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

interface PurchaseOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    order?: any | null;
}

export default function PurchaseOrderModal({
    isOpen,
    onClose,
    onSuccess,
    order,
}: PurchaseOrderModalProps) {
    const businessDetails = useSelector(
        (state: AppState) => state.businessData?.businessDetails,
    );

    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [stores, setStores] = useState<any[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Group-level details
    const [formData, setFormData] = useState({
        supplierId: "",
        storeId: "",
        reference: "",
        status: "PENDING",
    });

    // Dynamic line items
    const [items, setItems] = useState([
        { productId: "", quantity: "", unitCost: "" },
    ]);

    useEffect(() => {
        if (isOpen && businessDetails?.id) {
            Promise.all([
                apiClient.get("/suppliers"),
                apiClient.get("/product"),
                apiClient.get(`/business/${businessDetails.id}/stores`),
            ])
                .then(([suppRes, prodRes, storeRes]) => {
                    setSuppliers(suppRes.data || []);
                    setStores(storeRes.data || []);
                    
                    const rawProducts = Array.isArray(prodRes.data) ? prodRes.data : [];
                    const flattened = [];

                    // Only process top-level products (those that aren't themselves variants)
                    // to avoid duplicates, as variants are also returned nested under their templates.
                    const topLevelProducts = rawProducts.filter(p => !p.parentId);

                    for (const p of topLevelProducts) {
                        if (p.type === "TEMPLATE" && p.variants && p.variants.length > 0) {
                            for (const v of p.variants) {
                                const attributes = v.attributeValues
                                    ?.map((av: any) => `${av.attributeOption?.attribute?.name}: ${av.attributeOption?.value}`)
                                    .join(", ");
                                
                                flattened.push({
                                    ...v,
                                    displayName: `${p.name} (${attributes || v.sku})`,
                                });
                            }
                        } else if (p.type !== "TEMPLATE") {
                            // SIMPLE products
                            flattened.push({
                                ...p,
                                displayName: p.name,
                            });
                        }
                    }

                    setProducts(flattened);
                    setLoadingData(false);
                })
                .catch(() => {
                    toast.error("Failed to load necessary data");
                    setLoadingData(false);
                });

            if (order) {
                setFormData({
                    supplierId: order.supplierId || "",
                    storeId: order.storeId || "",
                    reference: order.reference || "",
                    status: order.status || "PENDING",
                });

                if (order.items && order.items.length > 0) {
                    setItems(
                        order.items.map((i: any) => ({
                            productId: i.productId,
                            quantity: i.quantity.toString(),
                            unitCost: i.unitCost.toString(),
                        })),
                    );
                } else {
                    setItems([{ productId: "", quantity: "", unitCost: "" }]);
                }
            } else {
                setFormData({
                    supplierId: "",
                    storeId: "",
                    reference: "",
                    status: "PENDING",
                });
                setItems([{ productId: "", quantity: "", unitCost: "" }]);
            }
        }
    }, [isOpen, order, businessDetails?.id]);

    // Barcode Scanner Integration
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
                    // Item already in list, increment quantity
                    const currentQty =
                        parseInt(newItems[existingIndex].quantity) || 0;
                    newItems[existingIndex].quantity = (
                        currentQty + 1
                    ).toString();
                    toast.success(`Increased qty: ${foundProduct.name}`);
                } else {
                    // Check if the very first row is completely empty, overwrite it if so
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
                        // Otherwise, add a new row
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
        } else {
            toast.error(`Product not found for barcode: ${barcode}`);
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

        // Validation
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
                ...formData,
                totalAmount: grandTotal,
                items: items.map((item) => ({
                    productId: item.productId,
                    quantity: Number(item.quantity),
                    unitCost: Number(item.unitCost),
                })),
            };

            if (order?.id) {
                await apiClient.patch(`/purchase-orders/${order.id}`, payload);
                toast.success("Purchase order updated.");
            } else {
                await apiClient.post("/purchase-orders", payload);
                toast.success("Purchase order created.");
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to save order");
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
                                {order
                                    ? "Edit Purchase Order"
                                    : "Create Purchase Order"}
                            </h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Draft an order with actual line items and costs.
                                (Barcode scanning active)
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
                                {/* 1. Order Details */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                            Supplier
                                        </label>
                                        <div className="relative">
                                            <select
                                                required
                                                value={formData.supplierId}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        supplierId:
                                                            e.target.value,
                                                    })
                                                }
                                                className="w-full pl-4 pr-10 py-2.5 bg-slate-50 outline-none border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm appearance-none cursor-pointer"
                                            >
                                                <option value="" disabled>
                                                    Select Supplier...
                                                </option>
                                                {suppliers.map((s, idx) => (
                                                    <option
                                                        key={`po-supp-${s.id || idx}`}
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
                                            Target Store / Branch
                                        </label>
                                        <div className="relative">
                                            <select
                                                required
                                                value={formData.storeId}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        storeId:
                                                            e.target.value,
                                                    })
                                                }
                                                className="w-full pl-4 pr-10 py-2.5 bg-slate-50 outline-none border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm appearance-none cursor-pointer"
                                            >
                                                <option value="" disabled>
                                                    Select Store...
                                                </option>
                                                {stores.map((s, idx) => (
                                                    <option
                                                        key={`po-store-${s.id || idx}`}
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
                                            PO Reference / Number
                                        </label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.reference}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    reference: e.target.value,
                                                })
                                            }
                                            className="w-full px-4 py-2.5 bg-slate-50 outline-none border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm"
                                            placeholder="e.g. PO-2026-001"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                            Status
                                        </label>
                                        <div className="relative">
                                            <select
                                                required
                                                value={formData.status}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        status: e.target.value,
                                                    })
                                                }
                                                className="w-full pl-4 pr-10 py-2.5 bg-slate-50 outline-none border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm appearance-none cursor-pointer"
                                            >
                                                <option value="PENDING">
                                                    Pending
                                                </option>
                                                <option value="IN_TRANSIT">
                                                    In Transit
                                                </option>
                                                <option value="CANCELLED">
                                                    Cancelled
                                                </option>
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                {/* 2. Line Items */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                                            Order Items
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
                                                key={`po-line-item-${index}`}
                                                className="flex flex-col md:flex-row items-start md:items-center gap-3 bg-white p-3 rounded-lg border border-gray-200 shadow-sm relative group"
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
                                                                    {p.displayName}
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

                            {/* 3. Footer & Submission */}
                            <div className="p-5 border-t border-gray-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-4 flex-shrink-0">
                                <div className="text-left w-full sm:w-auto bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        Calculated Total
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
                                        ) : (
                                            "Save Order"
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

"use client";

import Navbar from "@/components/Navbar";
import ReconciliationDetailsSidebar from "@/components/ReconciliationDetailsSidebar";
import { AppState } from "@/store";
import { setReconciliationHistory } from "@/store/slices/reconciliationSlice";
import { apiClient } from "@/utils/apiClient";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Plus, Search, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

export default function ReconciliationPage() {
    const dispatch = useDispatch();
    const router = useRouter();
    const businessDetails = useSelector(
        (state: AppState) => state.businessData?.businessDetails,
    );
    const { history, lastFetched } = useSelector(
        (state: any) => state.reconciliation,
    );

    const [activeTab, setActiveTab] = useState<"new" | "history">("new");
    const [stores, setStores] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);

    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Reconciliation State
    const [selectedStoreId, setSelectedStoreId] = useState("");
    const [reference, setReference] = useState("");
    const [notes, setNotes] = useState("");
    const [items, setItems] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    const [showDetailsSidebar, setShowDetailsSidebar] = useState(false);
    const [selectedRecId, setSelectedRecId] = useState<string | null>(null);

    const fetchInitialData = useCallback(async () => {
        if (!businessDetails?.id) return;
        setLoading(true);
        try {
            const [storesRes, productsRes] = await Promise.all([
                apiClient.get(`/business/${businessDetails.id}/stores`),
                apiClient.get("/product"),
            ]);

            setStores(storesRes.data || []);

            // Safely handle the paginated product response
            const fetchedProducts = Array.isArray(productsRes.data?.data)
                ? productsRes.data.data
                : Array.isArray(productsRes.data)
                  ? productsRes.data
                  : [];

            setProducts(
                fetchedProducts.filter((p: any) => p.type !== "TEMPLATE"),
            );

            // Fetch history if cache is stale (older than 5 minutes)
            const CACHE_STALE_TIME = 5 * 60 * 1000;
            if (!lastFetched || Date.now() - lastFetched > CACHE_STALE_TIME) {
                const historyRes = await apiClient.get(
                    "/inventory/reconciliation",
                );
                dispatch(setReconciliationHistory(historyRes.data || []));
            }

            if (storesRes.data?.length > 0) {
                setSelectedStoreId(storesRes.data[0].id);
            }
        } catch (error) {
            toast.error("Failed to load inventory data");
        } finally {
            setLoading(false);
        }
    }, [businessDetails?.id, dispatch, lastFetched]);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    const addProductToItems = (product: any) => {
        if (items.find((item) => item.productId === product.id)) {
            toast.error("Product already added to list");
            return;
        }

        // Use the quantity calculated by the backend which now includes PO items
        const systemQuantity = product.quantity || 0;

        setItems([
            ...items,
            {
                productId: product.id,
                name: product.name,
                sku: product.sku,
                systemQuantity,
                physicalQuantity: systemQuantity, // Default to system quantity
                discrepancy: 0,
            },
        ]);
        setSearchQuery("");
    };

    const updatePhysicalQuantity = (index: number, value: string) => {
        const qty = parseInt(value) || 0;
        const newItems = [...items];
        newItems[index].physicalQuantity = qty;
        newItems[index].discrepancy = qty - newItems[index].systemQuantity;
        setItems(newItems);
    };

    const removeItem = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    const handleComplete = async () => {
        if (!selectedStoreId) {
            toast.error("Please select a branch");
            return;
        }
        if (items.length === 0) {
            toast.error("Please add at least one product");
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                storeId: selectedStoreId,
                reference,
                notes,
                items: items.map((item) => ({
                    productId: item.productId,
                    physicalQuantity: item.physicalQuantity,
                })),
            };

            await apiClient.post("/inventory/reconciliation", payload);
            toast.success("Inventory reconciled successfully");

            // Reset form
            setItems([]);
            setReference("");
            setNotes("");

            // Refresh history in background and update Redux
            const historyRes = await apiClient.get("/inventory/reconciliation");
            dispatch(setReconciliationHistory(historyRes.data || []));

            setActiveTab("history");
        } catch (error) {
            toast.error("Failed to save reconciliation");
        } finally {
            setIsSaving(false);
        }
    };

    const filteredProductSearch = products
        .filter(
            (p) =>
                (p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    p.sku.toLowerCase().includes(searchQuery.toLowerCase())) &&
                !items.find((item) => item.productId === p.id),
        )
        .slice(0, 5);

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
            <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 pb-24">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Inventory Reconciliation
                        </h1>
                        <p className="text-sm text-gray-500">
                            Conduct formal stocktakes and adjust system counts
                        </p>
                    </div>

                    <div className="flex bg-gray-100 p-1 rounded-lg self-start">
                        <button
                            onClick={() => setActiveTab("new")}
                            className={`px-6 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === "new" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                        >
                            New Stocktake
                        </button>
                        <button
                            onClick={() => setActiveTab("history")}
                            className={`px-6 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === "history" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                        >
                            History
                        </button>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === "new" ? (
                        <motion.div
                            key="new-tab"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                        >
                            {/* Left Panel: Items List */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="p-4 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
                                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                                            Products to Reconcile
                                        </h3>
                                        <div className="relative w-64">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Search products by SKU or name..."
                                                value={searchQuery}
                                                onChange={(e) =>
                                                    setSearchQuery(
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            />

                                            {searchQuery && (
                                                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden">
                                                    {filteredProductSearch.length >
                                                    0 ? (
                                                        filteredProductSearch.map(
                                                            (product) => (
                                                                <button
                                                                    key={
                                                                        product.id
                                                                    }
                                                                    onClick={() =>
                                                                        addProductToItems(
                                                                            product,
                                                                        )
                                                                    }
                                                                    className="w-full p-3 text-left hover:bg-gray-50 flex items-center justify-between border-b border-gray-50 last:border-0"
                                                                >
                                                                    <div className="flex flex-col">
                                                                        <span className="text-sm font-semibold text-gray-900">
                                                                            {
                                                                                product.name
                                                                            }
                                                                        </span>
                                                                        <span className="text-xs text-gray-500">
                                                                            {
                                                                                product.sku
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                    <Plus
                                                                        size={
                                                                            16
                                                                        }
                                                                        className="text-green-500"
                                                                    />
                                                                </button>
                                                            ),
                                                        )
                                                    ) : (
                                                        <div className="p-4 text-center text-sm text-gray-500">
                                                            No products found
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-gray-50/50">
                                                <tr>
                                                    <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                        Product
                                                    </th>
                                                    <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">
                                                        System Qty
                                                    </th>
                                                    <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">
                                                        Physical Qty
                                                    </th>
                                                    <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">
                                                        Discrepancy
                                                    </th>
                                                    <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {items.length === 0 ? (
                                                    <tr>
                                                        <td
                                                            colSpan={5}
                                                            className="px-6 py-12 text-center text-gray-500 text-sm"
                                                        >
                                                            Search and add
                                                            products to start
                                                            reconciliation
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    items.map((item, index) => (
                                                        <tr
                                                            key={item.productId}
                                                            className="hover:bg-gray-50/50 transition-colors"
                                                        >
                                                            <td className="px-6 py-4">
                                                                <div className="flex flex-col">
                                                                    <span className="text-sm font-semibold text-gray-900">
                                                                        {
                                                                            item.name
                                                                        }
                                                                    </span>
                                                                    <span className="text-xs text-gray-500">
                                                                        {
                                                                            item.sku
                                                                        }
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-center">
                                                                <span className="text-sm font-medium text-gray-600">
                                                                    {
                                                                        item.systemQuantity
                                                                    }
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex justify-center">
                                                                    <input
                                                                        type="number"
                                                                        value={
                                                                            item.physicalQuantity
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            updatePhysicalQuantity(
                                                                                index,
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            )
                                                                        }
                                                                        className="w-20 px-2 py-1 text-center bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-green-500"
                                                                    />
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-center">
                                                                <span
                                                                    className={`text-sm font-bold ${
                                                                        item.discrepancy >
                                                                        0
                                                                            ? "text-green-500"
                                                                            : item.discrepancy <
                                                                                0
                                                                              ? "text-red-600"
                                                                              : "text-gray-400"
                                                                    }`}
                                                                >
                                                                    {item.discrepancy >
                                                                    0
                                                                        ? "+"
                                                                        : ""}
                                                                    {
                                                                        item.discrepancy
                                                                    }
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <button
                                                                    onClick={() =>
                                                                        removeItem(
                                                                            index,
                                                                        )
                                                                    }
                                                                    className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                                                                >
                                                                    <Trash2
                                                                        size={
                                                                            16
                                                                        }
                                                                    />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* Right Panel: Settings & Summary */}
                            <div className="space-y-6">
                                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-6">
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                                        Settings
                                    </h3>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                                Target Branch
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={selectedStoreId}
                                                    onChange={(e) =>
                                                        setSelectedStoreId(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm appearance-none outline-none focus:ring-2 focus:ring-green-500/20"
                                                >
                                                    {stores.map((s) => (
                                                        <option
                                                            key={s.id}
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
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                                Reference (Optional)
                                            </label>
                                            <input
                                                type="text"
                                                value={reference}
                                                onChange={(e) =>
                                                    setReference(e.target.value)
                                                }
                                                placeholder="e.g. Q1_STOCKTAKE_2026"
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500/20"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                                Notes
                                            </label>
                                            <textarea
                                                rows={3}
                                                value={notes}
                                                onChange={(e) =>
                                                    setNotes(e.target.value)
                                                }
                                                placeholder="Add any internal notes about this reconciliation..."
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500/20 resize-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-gray-100 space-y-4">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-500">
                                                Products Checked
                                            </span>
                                            <span className="font-bold text-gray-900">
                                                {items.length}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-500">
                                                Discrepancies Found
                                            </span>
                                            <span className="font-bold text-red-600">
                                                {
                                                    items.filter(
                                                        (i) =>
                                                            i.discrepancy !== 0,
                                                    ).length
                                                }
                                            </span>
                                        </div>

                                        <button
                                            onClick={handleComplete}
                                            disabled={
                                                isSaving || items.length === 0
                                            }
                                            className="w-full py-3 bg-[#22c55e] hover:bg-[#16a34a] text-white text-xs font-black uppercase tracking-widest rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isSaving ? (
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            ) : (
                                                "Complete Stocktake"
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="history-tab"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
                        >
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50/50">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                Reference
                                            </th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                Branch
                                            </th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                Items
                                            </th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                Created By
                                            </th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                Date
                                            </th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {history.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={6}
                                                    className="px-6 py-12 text-center text-gray-500 text-sm"
                                                >
                                                    No reconciliation history
                                                    found
                                                </td>
                                            </tr>
                                        ) : (
                                            history.map((rec: any) => (
                                                <tr
                                                    key={rec.id}
                                                    className="hover:bg-gray-50/50 transition-colors"
                                                >
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm font-bold text-gray-900">
                                                            {rec.reference ||
                                                                "No Reference"}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm text-gray-600">
                                                            {rec.Store?.name}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm text-gray-600">
                                                            {rec.items
                                                                ?.length ||
                                                                0}{" "}
                                                            products
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm text-gray-600">
                                                            {
                                                                rec.User
                                                                    ?.firstName
                                                            }{" "}
                                                            {rec.User?.lastName}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm text-gray-600">
                                                            {new Date(
                                                                rec.createdAt,
                                                            ).toLocaleDateString()}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedRecId(
                                                                    rec.id,
                                                                );
                                                                setShowDetailsSidebar(
                                                                    true,
                                                                );
                                                            }}
                                                            className="text-green-500 hover:text-green-500 font-bold text-xs uppercase tracking-wider"
                                                        >
                                                            Details
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <ReconciliationDetailsSidebar
                    isOpen={showDetailsSidebar}
                    onClose={() => {
                        setShowDetailsSidebar(false);
                        setSelectedRecId(null);
                    }}
                    reconciliationId={selectedRecId}
                />
            </div>
        </Navbar>
    );
}

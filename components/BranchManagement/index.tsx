"use client";
import React, { useState, useEffect } from "react";
import { apiClient } from "@/utils/apiClient";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { AppState } from "@/store";
import { FloatingPortal } from "@floating-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, PlusCircle, X } from "lucide-react";

const BranchManagement: React.FC = () => {
    const user = useSelector((state: AppState) => state.auth.user);
    const businessDetails = useSelector(
        (state: AppState) => state.businessData?.businessDetails,
    );

    const [stores, setStores] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [activeStoreId, setActiveStoreId] = useState<string | null>(null);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    const [newStore, setNewStore] = useState({ name: "", address: "" });
    const [editStore, setEditStore] = useState({
        id: "",
        name: "",
        address: "",
    });

    const fetchStores = async () => {
        if (!user?.businessId) return;
        try {
            const res = await apiClient.get(
                `/business/${user.businessId}/stores`,
            );
            setStores(res.data || []);
        } catch (error) {
            console.error("Error fetching stores:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStores();
        if (typeof window !== "undefined") {
            setActiveStoreId(localStorage.getItem("activeStoreId"));
        }
    }, [user?.businessId]);

    const handleCreateStore = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);
        try {
            await apiClient.post("/stores/create", newStore);
            toast.success("Branch created successfully.");
            setShowCreateModal(false);
            setNewStore({ name: "", address: "" });
            fetchStores();
        } catch (error: any) {
            toast.error(
                error.response?.data?.error || "Failed to create branch",
            );
        } finally {
            setIsCreating(false);
        }
    };

    const handleEditStore = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsEditing(true);
        try {
            await apiClient.put(`/stores/${editStore.id}`, {
                name: editStore.name,
                address: editStore.address,
            });
            toast.success("Branch updated successfully.");
            setShowEditModal(false);
            fetchStores();

            if (activeStoreId === editStore.id) {
                window.location.reload();
            }
        } catch (error: any) {
            toast.error(
                error.response?.data?.error || "Failed to update branch",
            );
        } finally {
            setIsEditing(false);
        }
    };

    const openEditModal = (store: any) => {
        setEditStore({
            id: store.id,
            name: store.name,
            address: store.address || "",
        });
        setShowEditModal(true);
    };

    const maxStores =
        businessDetails?.subscription?.plan === "PREMIUM"
            ? 10
            : businessDetails?.subscription?.plan === "STANDARD"
              ? 3
              : 1;

    const currentCount = stores.length;
    const canCreate = currentCount < maxStores;

    return (
        <section className="w-full">
            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                        Branch Management
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage your operational locations and physical outlets.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="text-sm text-gray-600 bg-white px-3 py-1.5 rounded border border-gray-200 shadow-sm">
                        Plan Usage:{" "}
                        <span className="font-semibold text-gray-900">
                            {currentCount} / {maxStores}
                        </span>
                    </div>

                    {user?.role === "admin" &&
                        (canCreate ? (
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-green-600 transition-all shadow-lg shadow-green-100 whitespace-nowrap"
                            >
                                <PlusCircle
                                    size={18}
                                    className="stroke-white"
                                />
                                Create Branch
                            </button>
                        ) : (
                            <div className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded whitespace-nowrap shadow-sm">
                                Plan Limit Reached
                            </div>
                        ))}
                </div>
            </header>

            {/* Table Layout */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Branch Name
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Address
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Date Added
                                </th>
                                {user?.role === "admin" && (
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Actions
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 relative">
                            {loading && (
                                <tr>
                                    <td
                                        colSpan={user?.role === "admin" ? 4 : 3}
                                        className="px-6 py-8 text-center"
                                    >
                                        <div className="flex flex-col items-center justify-center my-10">
                                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {!loading && stores.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={user?.role === "admin" ? 4 : 3}
                                        className="px-6 py-8 text-center text-sm text-gray-500"
                                    >
                                        No branches found. Create one to get
                                        started.
                                    </td>
                                </tr>
                            )}

                            {!loading &&
                                stores.map((store) => {
                                    const isSelectedStore =
                                        store.id === activeStoreId;
                                    return (
                                        <tr
                                            key={store.id}
                                            className={
                                                isSelectedStore
                                                    ? "bg-green-50/30"
                                                    : "hover:bg-gray-50"
                                            }
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {store.name}
                                                    </span>
                                                    {!store.isActive && (
                                                        <span className="ml-3 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                                                            Suspended
                                                        </span>
                                                    )}
                                                    {isSelectedStore &&
                                                        store.isActive && (
                                                            <span className="ml-3 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-500">
                                                                Active
                                                            </span>
                                                        )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {store.address || "—"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(
                                                    store.createdAt,
                                                ).toLocaleDateString()}
                                            </td>
                                            {user?.role === "admin" && (
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button
                                                        onClick={() =>
                                                            openEditModal(store)
                                                        }
                                                        className="text-green-500 hover:text-green-600"
                                                    >
                                                        Edit
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <FloatingPortal>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                transition={{ duration: 0.2 }}
                                className="bg-white w-full max-w-md rounded-lg shadow-2xl border border-gray-100 overflow-hidden relative"
                            >
                                {/* Background Line Pattern */}
                                <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03] z-0">
                                    <div className="absolute -top-[10%] -left-[10%] w-[80%] h-[40%] rounded-full bg-green-900/20 blur-[60px]" />
                                    <svg
                                        className="absolute inset-0 w-full h-full"
                                        viewBox="0 0 100 100"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        preserveAspectRatio="none"
                                    >
                                        <path
                                            d="M0 100 C 20 0 50 0 100 100 Z"
                                            stroke="black"
                                            strokeWidth="0.5"
                                            className="opacity-20"
                                        />
                                    </svg>
                                </div>

                                {/* Header */}
                                <div className="p-5 border-b border-gray-100 flex items-center justify-between relative z-10 bg-white/50 backdrop-blur-sm">
                                    <h3 className="font-bold text-lg text-gray-900">
                                        Create New Branch
                                    </h3>
                                    <button
                                        onClick={() =>
                                            setShowCreateModal(false)
                                        }
                                        className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                {/* Form Content */}
                                <form
                                    onSubmit={handleCreateStore}
                                    className="relative z-10"
                                >
                                    <div className="p-6 space-y-5">
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                Branch Name
                                            </label>
                                            <input
                                                required
                                                className="w-full px-4 py-2.5 rounded-lg outline-none bg-slate-50 focus:bg-white border border-gray-200 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm"
                                                placeholder="e.g. Westlands Branch"
                                                value={newStore.name}
                                                onChange={(e) =>
                                                    setNewStore({
                                                        ...newStore,
                                                        name: e.target.value,
                                                    })
                                                }
                                                autoFocus
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                Address / Location
                                            </label>
                                            <input
                                                className="w-full px-4 py-2.5 rounded-lg outline-none bg-slate-50 focus:bg-white border border-gray-200 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm"
                                                placeholder="e.g. Kimathi Street, Nairobi"
                                                value={newStore.address}
                                                onChange={(e) =>
                                                    setNewStore({
                                                        ...newStore,
                                                        address: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="p-5 border-t border-gray-100 bg-gray-50/50 backdrop-blur-sm flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowCreateModal(false)
                                            }
                                            className="flex-1 py-2.5 px-4 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isCreating}
                                            className="flex-1 py-2.5 px-4 text-sm font-bold text-white bg-green-500 rounded-lg hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                                        >
                                            {isCreating ? (
                                                <Loader2 className="animate-spin h-4 w-4 stroke-white" />
                                            ) : (
                                                "Save Branch"
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </motion.div>
                    </FloatingPortal>
                )}
            </AnimatePresence>

            {/* Edit Modal */}
            <AnimatePresence>
                {showEditModal && (
                    <FloatingPortal>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                transition={{ duration: 0.2 }}
                                className="bg-white w-full max-w-md rounded-lg shadow-2xl border border-gray-100 overflow-hidden relative"
                            >
                                {/* Background Line Pattern */}
                                <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03] z-0">
                                    <div className="absolute -top-[10%] -left-[10%] w-[80%] h-[40%] rounded-full bg-green-900/20 blur-[60px]" />
                                    <svg
                                        className="absolute inset-0 w-full h-full"
                                        viewBox="0 0 100 100"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        preserveAspectRatio="none"
                                    >
                                        <path
                                            d="M0 100 C 20 0 50 0 100 100 Z"
                                            stroke="black"
                                            strokeWidth="0.5"
                                            className="opacity-20"
                                        />
                                    </svg>
                                </div>

                                {/* Header */}
                                <div className="p-5 border-b border-gray-100 flex items-center justify-between relative z-10 bg-white/50 backdrop-blur-sm">
                                    <h3 className="font-bold text-lg text-gray-900">
                                        Edit Branch
                                    </h3>
                                    <button
                                        onClick={() => setShowEditModal(false)}
                                        className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                {/* Form Content */}
                                <form
                                    onSubmit={handleEditStore}
                                    className="relative z-10"
                                >
                                    <div className="p-6 space-y-5">
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                Branch Name
                                            </label>
                                            <input
                                                required
                                                className="w-full px-4 py-2.5 rounded-lg outline-none bg-slate-50 focus:bg-white border border-gray-200 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm"
                                                value={editStore.name}
                                                onChange={(e) =>
                                                    setEditStore({
                                                        ...editStore,
                                                        name: e.target.value,
                                                    })
                                                }
                                                autoFocus
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                Address / Location
                                            </label>
                                            <input
                                                className="w-full px-4 py-2.5 rounded-lg outline-none bg-slate-50 focus:bg-white border border-gray-200 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm"
                                                value={editStore.address}
                                                onChange={(e) =>
                                                    setEditStore({
                                                        ...editStore,
                                                        address: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="p-5 border-t border-gray-100 bg-gray-50/50 backdrop-blur-sm flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowEditModal(false)
                                            }
                                            className="flex-1 py-2.5 px-4 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isEditing}
                                            className="flex-1 py-2.5 px-4 text-sm font-bold text-white bg-green-500 rounded-lg hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                                        >
                                            {isEditing ? (
                                                <Loader2 className="animate-spin h-4 w-4 stroke-white" />
                                            ) : (
                                                "Update Branch"
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </motion.div>
                    </FloatingPortal>
                )}
            </AnimatePresence>
        </section>
    );
};

export default BranchManagement;

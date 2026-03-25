"use client";

import React, { useState, useEffect } from "react";
import { apiClient } from "@/utils/apiClient";
import { toast } from "sonner";
import { FloatingPortal } from "@floating-ui/react";
import { motion } from "framer-motion";
import { Loader2, ChevronDown } from "lucide-react";

interface EditMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    member: any;
    stores: any[];
    onSuccess: (updatedMember: any) => void;
}

export default function EditMemberModal({
    isOpen,
    onClose,
    member,
    stores,
    onSuccess,
}: EditMemberModalProps) {
    const [editRole, setEditRole] = useState("user");
    const [editStoreId, setEditStoreId] = useState("All");
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        if (member) {
            setEditRole(member.role.toLowerCase());
            setEditStoreId(member.Store?.id || "All");
        }
    }, [member]);

    if (!isOpen || !member) return null;

    const handleUpdateMember = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdating(true);

        try {
            const response = await apiClient.patch(`/users/${member.clerkId}`, {
                role: editRole,
                storeId: editStoreId === "All" ? null : editStoreId,
            });

            toast.success("User updated successfully");
            onSuccess(response.data);
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to update user");
        } finally {
            setIsUpdating(false);
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
                    transition={{ duration: 0.2 }}
                    className="bg-white rounded-lg w-full max-w-md shadow-2xl border border-gray-100 overflow-hidden relative"
                >
                    <div className="p-6 pb-0 relative z-10 text-center">
                        <h3 className="text-xl font-bold text-gray-900">
                            Edit Team Member
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            {member.firstName} {member.lastName} ({member.email}
                            )
                        </p>
                    </div>

                    <div className="p-6 relative z-10">
                        <form
                            onSubmit={handleUpdateMember}
                            className="space-y-5"
                        >
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                    Role Permission
                                </label>
                                <div className="relative">
                                    <select
                                        value={editRole}
                                        onChange={(e) =>
                                            setEditRole(e.target.value)
                                        }
                                        className="block w-full pl-4 pr-10 py-3 bg-slate-50 outline-none border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm appearance-none cursor-pointer"
                                    >
                                        <option value="user">
                                            User (Basic Access)
                                        </option>
                                        <option value="manager">
                                            Manager (Edit Access)
                                        </option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none h-4 w-4" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                    Assigned Branch
                                </label>
                                <div className="relative">
                                    <select
                                        value={editStoreId}
                                        onChange={(e) =>
                                            setEditStoreId(e.target.value)
                                        }
                                        className="block w-full pl-4 pr-10 py-3 bg-slate-50 outline-none border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm appearance-none cursor-pointer"
                                    >
                                        <option value="" disabled>
                                            Select Branch
                                        </option>
                                        {stores.map((store) => (
                                            <option
                                                key={store.id}
                                                value={store.id}
                                            >
                                                {store.name}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none h-4 w-4" />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={isUpdating}
                                    className="flex-1 px-4 py-3 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUpdating}
                                    className="flex-1 px-4 py-3 text-sm font-bold text-white bg-green-500 rounded-lg hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                                >
                                    {isUpdating ? (
                                        <Loader2 className="animate-spin h-4 w-4 stroke-white" />
                                    ) : (
                                        "Save Changes"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </motion.div>
        </FloatingPortal>
    );
}

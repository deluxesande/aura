"use client";

import React, { useState } from "react";
import { apiClient } from "@/utils/apiClient";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { AppState } from "@/store";
import { setInvitations } from "@/store/slices/invitationSlice";
import { addInvitation } from "@/store/slices/invitationsDataSlice";
import { FloatingPortal } from "@floating-ui/react";
import { motion } from "framer-motion";
import { Users, Loader2, X, ChevronDown } from "lucide-react";

interface InviteMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    canInviteMore: boolean;
    plan: string;
    teamLimit: number;
    staffCount: number;
    stores: any[];
}

export default function InviteMemberModal({
    isOpen,
    onClose,
    canInviteMore,
    plan,
    teamLimit,
    staffCount,
    stores,
}: InviteMemberModalProps) {
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState("user");
    const [inviteStoreId, setInviteStoreId] = useState("");
    const [isSending, setIsSending] = useState(false);

    const dispatch = useDispatch();
    const invitations = useSelector(
        (state: AppState) => state.invitations.invitations,
    ) as any[];
    const businessDetails = useSelector(
        (state: AppState) => state.businessData?.businessDetails,
    );

    if (!isOpen) return null;

    const handleInviteUser = async (e: React.FormEvent) => {
        e.preventDefault();

        if (businessDetails?.subscription?.status !== "ACTIVE") {
            toast.error(
                "Cannot invite users: Your subscription plan is not active.",
            );
            return;
        }

        if (!canInviteMore) {
            toast.error(
                `Team limit reached. Your ${plan} plan allows only ${teamLimit} member(s).`,
            );
            return;
        }

        if (!inviteEmail) {
            toast.error("Please enter an email address");
            return;
        }

        if (inviteRole === "admin") {
            toast.error("Cannot invite users with Admin role.");
            return;
        }

        if (inviteRole !== "admin" && !inviteStoreId) {
            toast.error("Please select a branch to assign this user.");
            return;
        }

        setIsSending(true);

        const sendInvitation = async () => {
            const response = await apiClient.post("/auth/invite/post", {
                email: inviteEmail,
                role: inviteRole,
                storeId: inviteStoreId || undefined,
            });
            const newInvitation = response.data.invitation;
            dispatch(setInvitations([...invitations, newInvitation]));
            dispatch(addInvitation({ ...newInvitation, imageUrl: undefined }));
        };

        toast.promise(sendInvitation(), {
            loading: "Sending Invitation...",
            success: () => {
                setInviteEmail("");
                setInviteRole("user");
                setInviteStoreId("");
                onClose();
                setIsSending(false);
                return "Invitation sent successfully.";
            },
            error: (err: any) => {
                setIsSending(false);
                return (
                    err?.response?.data?.error || "Sending Invitation Failed."
                );
            },
        });
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
                    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03]">
                        <div className="absolute -top-[10%] -left-[10%] w-[80%] h-[40%] rounded-full bg-green-900/20 blur-[60px]" />
                        <svg
                            className="absolute inset-0 w-full h-full"
                            viewBox="0 0 100 100"
                            fill="none"
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

                    <div className="p-6 pb-0 relative z-10 text-center">
                        <div className="flex justify-end absolute right-4 top-4">
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">
                            Invite Team Member
                        </h3>
                        <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-xs font-medium text-slate-600 border border-slate-200">
                            <Users size={12} />
                            {staffCount} / {teamLimit} seats occupied
                        </div>
                    </div>

                    <div className="p-6 relative z-10">
                        <form onSubmit={handleInviteUser} className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={inviteEmail}
                                    onChange={(e) =>
                                        setInviteEmail(e.target.value)
                                    }
                                    className="block w-full pl-4 pr-4 py-3 bg-slate-50 outline-none border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm"
                                    placeholder="colleague@company.com"
                                    required
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                    Role Permission
                                </label>
                                <div className="relative">
                                    <select
                                        value={inviteRole}
                                        onChange={(e) =>
                                            setInviteRole(e.target.value)
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
                                <div className="mt-2 flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                    <p className="text-xs text-blue-700 leading-relaxed">
                                        {inviteRole === "manager" &&
                                            "Managers can view and edit data but cannot change billing or delete the business."}
                                        {inviteRole === "user" &&
                                            "Users can record transactions and view basic reports. Suitable for team members who need limited access."}
                                    </p>
                                </div>
                            </div>

                            {inviteRole !== "admin" && (
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                        Assign to Branch
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={inviteStoreId}
                                            onChange={(e) =>
                                                setInviteStoreId(e.target.value)
                                            }
                                            className="block w-full pl-4 pr-10 py-3 bg-slate-50 outline-none border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm appearance-none cursor-pointer"
                                            required
                                        >
                                            <option value="" disabled>
                                                Select a branch...
                                            </option>
                                            {stores
                                                .filter(
                                                    (s) => s.isActive !== false,
                                                )
                                                .map((store) => (
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
                            )}

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={isSending}
                                    className="flex-1 px-4 py-3 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSending}
                                    className="flex-1 px-4 py-3 text-sm font-bold text-white bg-green-500 rounded-lg hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                                >
                                    {isSending ? (
                                        <Loader2 className="animate-spin h-4 w-4 stroke-white" />
                                    ) : (
                                        "Send Invitation"
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

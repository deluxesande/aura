"use client";
import { AppState } from "@/store";
import { setInvitations } from "@/store/slices/invitationSlice";
import {
    addInvitation,
    removeInvitation,
    setInvitationsWithImages,
    updateInvitation,
} from "@/store/slices/invitationsDataSlice";
import { FloatingPortal } from "@floating-ui/react";
import axios, { AxiosError } from "axios";
import { AnimatePresence, motion } from "framer-motion";
import {
    Trash,
    Users,
    AlertCircle,
    UserX,
    ChevronDown,
    Loader2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import useSWR from "swr";

interface User {
    id: string;
    email: string;
    role: string;
    status: "pending" | "accepted" | "declined" | "expired";
    businessId: string;
    invitedBy: string;
    createdAt: string;
    updatedAt: string;
    expiresAt: string;
    clerkInvitationId: string;
    Business: {
        name: string;
    };
    inviter: {
        firstName: string;
        lastName: string;
    };
    clerkUserId: string | null;
}

interface Invitation extends User {
    imageUrl?: string;
}

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

const UserManagement: React.FC = () => {
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState("user");
    const [isSending, setIsSending] = useState(false);

    const dispatch = useDispatch();

    // Selectors
    const invitations = useSelector(
        (state: AppState) => state.invitations.invitations,
    ) as User[];

    const userInvitations = useSelector(
        (state: AppState) => state.invitationsData.invitationsWithImages,
    ) as Invitation[];

    // Fetch Business Data from Redux for the limit check
    const businessDetails = useSelector(
        (state: AppState) => state.businessData?.businessDetails,
    );

    // Use SWR for caching and background updates
    const {
        data: invitationsData,
        error,
        isLoading,
    } = useSWR("/api/auth/invite/get", fetcher, {
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        dedupingInterval: 5000,
        refreshInterval: 60000, // Optional: refresh every 60 seconds
    });

    // Process fetched data and fetch images
    useEffect(() => {
        if (invitationsData?.invitations) {
            const rawInvitations = invitationsData.invitations;

            dispatch(setInvitations(rawInvitations));
            const imagePromises = rawInvitations.map(async (user: User) => {
                try {
                    const imageResponse = await axios.get(
                        "/api/auth/user/image",
                        {
                            params: { userId: user.id },
                        },
                    );
                    return {
                        ...user,
                        imageUrl:
                            imageResponse.data.imageUrl || "/images/user.png",
                    } as Invitation;
                } catch (error) {
                    return {
                        ...user,
                        imageUrl: "/images/user.png",
                    } as Invitation;
                }
            });

            const processImages = async () => {
                const results = await Promise.allSettled(imagePromises);
                const usersWithImages = results.map((result, index) => {
                    if (result.status === "fulfilled") return result.value;
                    return {
                        ...rawInvitations[index],
                        imageUrl: null,
                    } as Invitation;
                });
                dispatch(setInvitationsWithImages(usersWithImages));
            };

            processImages();
        }
    }, [invitationsData, dispatch]);

    // Handle fetch errors
    useEffect(() => {
        if (error) {
            console.error("Failed to fetch invitations:", error);
            toast.error("Failed to load invitations");
        }
    }, [error]);

    // --- Limit Calculation Logic ---
    const plan = businessDetails?.subscription?.plan || "STARTER";
    const staffCount = businessDetails?.usage?.staffCount || 0;

    // Calculate if they can invite more
    const teamLimit =
        plan === "STARTER" ? 1 : plan === "STANDARD" ? 5 : Infinity;
    const canInvite = staffCount < teamLimit;

    const handleInviteUser = async (e: React.FormEvent) => {
        e.preventDefault();

        if (businessDetails?.subscription?.status !== "ACTIVE") {
            toast.error(
                "Cannot invite users: Your subscription plan is not active.",
            );
            return;
        }

        if (!canInvite) {
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

        setIsSending(true);

        const sendInvitation = async () => {
            const response = await axios.post("/api/auth/invite/post", {
                email: inviteEmail,
                role: inviteRole,
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
                setShowInviteModal(false);
                setIsSending(false);
                return "Invitation sent successfully.";
            },
            error: (err) => {
                setIsSending(false);
                return (
                    err.response?.data?.error || "Sending Invitation Failed."
                );
            },
        });
    };

    const handleRoleChange = (userId: string, newRole: string) => {
        const updateRole = async () => {
            const response = await axios.put("/api/auth/invite/update", {
                userId,
                role: newRole,
            });

            if (response.status === 200) {
                dispatch(
                    setInvitations(
                        invitations.map((user) =>
                            user.id === userId
                                ? { ...user, role: newRole }
                                : user,
                        ),
                    ),
                );

                dispatch(
                    updateInvitation({
                        id: userId,
                        updates: { role: newRole },
                    }),
                );
            }
        };
        toast.promise(updateRole(), {
            loading: "Updating role.",
            success: "Role updated successfully.",
            error: (err: AxiosError) =>
                (err.response?.data as { error?: string })?.error ||
                "Failed to update role.",
        });
    };

    const handleDeleteUser = (user: User) => {
        setUserToDelete(user);
        setShowDeleteModal(true);
    };

    const confirmDeleteUser = () => {
        if (!userToDelete) return;

        const deleteProcess = async () => {
            let response;
            if (userToDelete.status === "accepted") {
                response = await axios.delete(
                    `/api/auth/delete/${userToDelete.clerkUserId}`,
                );
            } else {
                response = await axios.delete("/api/auth/invite/delete", {
                    data: { id: userToDelete.id },
                });
            }

            if (response.status === 200) {
                dispatch(
                    setInvitations(
                        invitations.filter((inv) => inv.id !== userToDelete.id),
                    ),
                );
                dispatch(removeInvitation(userToDelete.id));
            }
        };

        toast.promise(deleteProcess(), {
            loading: "Deleting User...",
            success: "User deleted successfully.",
            error: (err: AxiosError) =>
                (err.response?.data as { error?: string })?.error ||
                "Failed to delete user.",
        });

        setShowDeleteModal(false);
        setUserToDelete(null);
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case "admin":
                return "bg-purple-100 text-purple-800";
            case "manager":
                return "bg-blue-100 text-blue-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getStatusColor = (status: string) => {
        return status === "accepted"
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800";
    };

    return (
        <section className="relative">
            <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                    <h2 className="text-lg font-medium text-gray-900">
                        User Management
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                        Manage user roles, permissions, and account access for
                        your team.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <Link
                        href="/settings/team"
                        className="flex items-center justify-center w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 whitespace-nowrap"
                    >
                        <Users className="w-4 h-4 mr-2" />
                        View Active Members
                    </Link>

                    {/* Check if user can invite based on Redux businessData */}
                    {canInvite ? (
                        <button
                            onClick={() => setShowInviteModal(true)}
                            className="flex items-center justify-center w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 whitespace-nowrap"
                        >
                            + Invite
                        </button>
                    ) : (
                        <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-2 rounded-md border border-amber-200">
                            <AlertCircle size={16} />
                            <span className="text-xs font-semibold">
                                Team Limit Reached
                            </span>
                        </div>
                    )}
                </div>
            </header>

            {/* Users List */}
            <div className="mt-6 space-y-4 relative">
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg z-10">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                    </div>
                )}

                {userInvitations.length === 0 && !isLoading && (
                    <div className="flex flex-col items-center justify-center">
                        <div className="bg-green-100 rounded-full p-4 mb-3">
                            <UserX className="h-6 w-6 stroke-green-500" />
                        </div>
                        <h3 className="text-gray-900 font-medium text-sm">
                            No members found
                        </h3>
                        <p className="text-gray-500 text-xs mt-1">
                            Try inviting team members to get started.
                        </p>
                    </div>
                )}

                {(userInvitations as Invitation[]).map((user) => (
                    <div
                        key={user.id}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm gap-4"
                    >
                        <div className="flex items-center space-x-4 flex-1">
                            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                                {user.imageUrl ? (
                                    <Image
                                        src={user.imageUrl}
                                        alt={user.email}
                                        className="object-cover"
                                        fill
                                        sizes="40px"
                                    />
                                ) : (
                                    <span className="text-sm font-medium text-gray-600">
                                        {user.email
                                            .split("@")[0]
                                            .slice(0, 2)
                                            .toUpperCase()}
                                    </span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 gap-1">
                                    <h3 className="text-sm font-medium text-gray-900 truncate">
                                        {user.email}
                                    </h3>
                                    <span
                                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                            user.status,
                                        )} w-fit`}
                                    >
                                        {user.status}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500">
                                    Invited by: {user.inviter?.firstName}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                            <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(
                                    user.role,
                                )} w-fit`}
                            >
                                {user.role}
                            </span>
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                                <select
                                    value={user.role}
                                    onChange={(e) =>
                                        handleRoleChange(
                                            user.id,
                                            e.target.value,
                                        )
                                    }
                                    className="outline-none bg-slate-50 block w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 text-xs"
                                >
                                    <option value="user">User</option>
                                    <option value="manager">Manager</option>
                                </select>
                                <button
                                    onClick={() => handleDeleteUser(user)}
                                    className="px-3 py-1 outline-none flex items-center justify-center sm:justify-start"
                                >
                                    <Trash className="w-4 h-4 stroke-red-500" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Invite User Modal */}
            <AnimatePresence>
                {showInviteModal && (
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
                                className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 overflow-hidden relative"
                            >
                                {/* Background Line Pattern */}
                                <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03]">
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

                                {/* Modal Header */}
                                <div className="p-6 pb-0 relative z-10 text-center">
                                    <h3 className="text-xl font-bold text-gray-900">
                                        Invite Team Member
                                    </h3>

                                    <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-xs font-medium text-slate-600 border border-slate-200">
                                        <Users size={12} />
                                        {staffCount} / {teamLimit} seats
                                        occupied
                                    </div>
                                </div>

                                {/* Modal Form */}
                                <div className="p-6 relative z-10">
                                    <form
                                        onSubmit={handleInviteUser}
                                        className="space-y-5"
                                    >
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                                Email Address
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="email"
                                                    value={inviteEmail}
                                                    onChange={(e) =>
                                                        setInviteEmail(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="block w-full pl-4 pr-4 py-3 bg-slate-50 outline-none border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm"
                                                    placeholder="colleague@company.com"
                                                    required
                                                    autoFocus
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                                Role Permission
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={inviteRole}
                                                    onChange={(e) =>
                                                        setInviteRole(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="block w-full pl-4 pr-10 py-3 bg-slate-50 outline-none border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm appearance-none cursor-pointer"
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

                                            {/* Role Description Helper */}
                                            <div className="mt-2 flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                                <p className="text-xs text-blue-700 leading-relaxed">
                                                    {inviteRole === "manager" &&
                                                        "Managers can view and edit data but cannot change billing or delete the business."}
                                                    {inviteRole === "user" &&
                                                        "Users can record transactions and view basic reports. Suitable for team members who need limited access."}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex gap-3 pt-2">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowInviteModal(false)
                                                }
                                                className="flex-1 px-4 py-3 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors"
                                                disabled={isSending}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isSending}
                                                className="flex-1 px-4 py-3 text-sm font-bold text-white bg-green-500 rounded-xl hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                                            >
                                                {isSending ? (
                                                    <Loader2 className="animate-spin h-4 w-4 stroke-white" />
                                                ) : (
                                                    <>Send Invitation</>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </motion.div>
                        </motion.div>
                    </FloatingPortal>
                )}
            </AnimatePresence>

            {/* Delete User Confirmation Modal */}
            {showDeleteModal && userToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Delete User
                        </h3>

                        <p className="text-sm text-gray-600 mb-6">
                            Are you sure you want to delete{" "}
                            <strong>{userToDelete.email}</strong>? This action
                            cannot be undone.
                        </p>

                        <div className="flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setUserToDelete(null);
                                }}
                                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 w-full sm:w-auto"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDeleteUser}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 w-full sm:w-auto"
                            >
                                Delete User
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default UserManagement;

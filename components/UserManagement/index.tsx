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
import { apiClient } from "@/utils/apiClient";
import { AxiosError } from "axios";
import { AnimatePresence, motion } from "framer-motion";
import {
    Trash,
    Users,
    AlertCircle,
    UserX,
    Loader2,
    PlusCircle,
    X,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState, useMemo } from "react";
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
    Store?: {
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

const fetcher = (url: string) =>
    apiClient.get(url.replace("/api", "")).then((res) => res.data);

const UserManagement: React.FC = () => {
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState("user");
    const [inviteStoreId, setInviteStoreId] = useState("");
    const [isSending, setIsSending] = useState(false);

    // --- Pagination State ---
    const [currentPage, setCurrentPage] = useState(1);
    const acceptedItemsPerPage = 5;

    const dispatch = useDispatch();

    const invitations = useSelector(
        (state: AppState) => state.invitations.invitations,
    ) as User[];

    const userInvitations = useSelector(
        (state: AppState) => state.invitationsData.invitationsWithImages,
    ) as Invitation[];

    const businessDetails = useSelector(
        (state: AppState) => state.businessData?.businessDetails,
    );

    const {
        data: invitationsData,
        error,
        isLoading,
    } = useSWR("/api/auth/invite/get", fetcher, {
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        dedupingInterval: 5000,
        refreshInterval: 60000,
    });

    const { data: storesData } = useSWR(
        businessDetails?.id
            ? `/api/business/${businessDetails.id}/stores`
            : null,
        fetcher,
    );

    useEffect(() => {
        if (invitationsData?.invitations) {
            const rawInvitations = invitationsData.invitations;

            dispatch(setInvitations(rawInvitations));
            const imagePromises = rawInvitations.map(async (user: User) => {
                try {
                    const imageResponse = await apiClient.get(
                        "/auth/user/image",
                        { params: { userId: user.id } },
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
                        imageUrl: "/images/user.png",
                    } as Invitation;
                });
                dispatch(setInvitationsWithImages(usersWithImages));
            };

            processImages();
        }
    }, [invitationsData, dispatch]);

    useEffect(() => {
        if (error) {
            console.error("Failed to fetch invitations:", error);
            toast.error(
                "We couldn't load the invitations. Try refreshing the page.",
            );
        }
    }, [error]);

    const plan = businessDetails?.subscription?.plan || "STARTER";
    const staffCount = businessDetails?.usage?.staffCount || 0;
    const teamLimit =
        plan === "STARTER" ? 1 : plan === "STANDARD" ? 5 : Infinity;
    const canInvite = staffCount < teamLimit;

    // ─── CUSTOM LOGIC: ALL Pending + Paginated Accepted ─────────────────────────
    const {
        pendingUsers,
        paginatedAccepted,
        totalAcceptedPages,
        totalAcceptedCount,
    } = useMemo(() => {
        const pending = userInvitations.filter((u) => u.status === "pending");

        // Filter out pending, sort by newest
        const accepted = userInvitations
            .filter((u) => u.status !== "pending")
            .sort(
                (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime(),
            );

        const totalPages =
            Math.ceil(accepted.length / acceptedItemsPerPage) || 1;
        const safePage = Math.min(currentPage, totalPages);

        const paginated = accepted.slice(
            (safePage - 1) * acceptedItemsPerPage,
            safePage * acceptedItemsPerPage,
        );

        return {
            pendingUsers: pending,
            paginatedAccepted: paginated,
            totalAcceptedPages: totalPages,
            totalAcceptedCount: accepted.length,
        };
    }, [userInvitations, currentPage]);

    const displayUsers = [...pendingUsers, ...paginatedAccepted];
    // ────────────────────────────────────────────────────────────────────────────

    const handleInviteUser = async (e: React.FormEvent) => {
        e.preventDefault();

        if (businessDetails?.subscription?.status !== "ACTIVE") {
            toast.error(
                "Your subscription isn't active, so we can't invite new users right now.",
            );
            return;
        }

        if (!canInvite) {
            toast.error(
                `You've reached your team limit. Your ${plan} plan allows only ${teamLimit} member(s).`,
            );
            return;
        }

        if (!inviteEmail) {
            toast.error(
                "Please provide an email address to send the invitation.",
            );
            return;
        }

        if (inviteRole === "admin") {
            toast.error("Admin invitations aren't available right now.");
            return;
        }

        if (inviteRole !== "admin" && !inviteStoreId) {
            toast.error("Please select a branch to assign this user to.");
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
            loading: "Sending the invitation...",
            success: () => {
                setInviteEmail("");
                setInviteRole("user");
                setShowInviteModal(false);
                setIsSending(false);
                return "Invitation sent! Your team member will receive an email shortly.";
            },
            error: (err) => {
                setIsSending(false);
                return (
                    err.response?.data?.error ||
                    "We couldn't send the invitation. Please try again."
                );
            },
        });
    };

    const handleRoleChange = (userId: string, newRole: string) => {
        const updateRole = async () => {
            const response = await apiClient.put("/auth/invite/update", {
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
            loading: "Updating the user's role...",
            success: "Role updated successfully!",
            error: (err: AxiosError) =>
                (err.response?.data as { error?: string })?.error ||
                "We couldn't update the role.",
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
                response = await apiClient.delete(
                    `/auth/delete/${userToDelete.clerkUserId}`,
                );
            } else {
                response = await apiClient.delete("/auth/invite/delete", {
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
            loading: "Removing the user...",
            success: "User removed successfully.",
            error: (err: AxiosError) =>
                (err.response?.data as { error?: string })?.error ||
                "We couldn't remove the user.",
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
            : "bg-amber-100 text-amber-800"; // Changed to amber to reflect pending better
    };

    return (
        <section className="relative w-full">
            <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                        User Management
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage user roles, permissions, and account access for
                        your team.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                    <Link
                        href="/settings/team"
                        className="flex items-center justify-center w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors whitespace-nowrap"
                    >
                        <Users className="w-4 h-4 mr-2" />
                        View Active Members
                    </Link>

                    {canInvite ? (
                        <button
                            onClick={() => setShowInviteModal(true)}
                            className="flex items-center justify-center w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 transition-colors whitespace-nowrap"
                        >
                            <PlusCircle size={16} className="stroke-white mr-2" />
                            Invite User
                        </button>
                    ) : (
                        <div className="flex items-center gap-2 px-3 py-2 text-amber-700 bg-amber-50 border border-amber-200 rounded text-sm font-medium whitespace-nowrap">
                            <AlertCircle size={16} />
                            Team Limit Reached
                        </div>
                    )}
                </div>
            </header>

            {/* Table Layout */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden relative min-h-[200px]">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    User
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Status
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Branch
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Role
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {isLoading && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-6 py-8 text-center text-sm text-gray-500"
                                    >
                                        <div className="flex justify-center items-center">
                                            <Loader2 className="animate-spin h-5 w-5 mr-2 text-gray-400" />
                                            Loading users...
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {!isLoading && displayUsers.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-6 py-12 text-center"
                                    >
                                        <div className="flex justify-center mb-3">
                                            <UserX className="h-8 w-8 text-gray-400" />
                                        </div>
                                        <p className="text-sm font-medium text-gray-900">
                                            No members found
                                        </p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Try inviting team members to get
                                            started.
                                        </p>
                                    </td>
                                </tr>
                            )}

                            {!isLoading &&
                                displayUsers.map((user) => (
                                    <tr
                                        key={user.id}
                                        className={`hover:bg-gray-50 transition-colors ${user.status === "pending" ? "bg-amber-50/20" : ""}`}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 relative rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                                                    {user.imageUrl ? (
                                                        <Image
                                                            src={user.imageUrl}
                                                            alt={user.email}
                                                            className="object-cover"
                                                            fill
                                                            sizes="40px"
                                                        />
                                                    ) : (
                                                        <span className="flex h-full w-full items-center justify-center text-sm font-medium text-gray-500">
                                                            {user.email
                                                                .substring(0, 2)
                                                                .toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {user.email}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        Invited by{" "}
                                                        {user.inviter
                                                            ?.firstName ||
                                                            "Admin"}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider ${getStatusColor(user.status)}`}
                                            >
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {user.Store?.name ||
                                                "All Branches (Admin)"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <select
                                                value={user.role}
                                                onChange={(e) =>
                                                    handleRoleChange(
                                                        user.id,
                                                        e.target.value,
                                                    )
                                                }
                                                className={`text-xs font-medium px-2 py-1 rounded outline-none border border-transparent hover:border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-500 cursor-pointer ${getRoleColor(user.role)}`}
                                            >
                                                <option
                                                    value="user"
                                                    className="bg-white text-gray-900"
                                                >
                                                    User
                                                </option>
                                                <option
                                                    value="manager"
                                                    className="bg-white text-gray-900"
                                                >
                                                    Manager
                                                </option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() =>
                                                    handleDeleteUser(user)
                                                }
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded transition-colors"
                                                title="Delete User"
                                            >
                                                <Trash className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {!isLoading && totalAcceptedCount > acceptedItemsPerPage && (
                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-xs text-gray-500 font-medium">
                            Showing all pending invites and{" "}
                            <span className="font-bold text-gray-900">
                                {(currentPage - 1) * acceptedItemsPerPage + 1}
                            </span>{" "}
                            to{" "}
                            <span className="font-bold text-gray-900">
                                {Math.min(
                                    currentPage * acceptedItemsPerPage,
                                    totalAcceptedCount,
                                )}
                            </span>{" "}
                            of{" "}
                            <span className="font-bold text-gray-900">
                                {totalAcceptedCount}
                            </span>{" "}
                            accepted members.
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() =>
                                    setCurrentPage((p) => Math.max(1, p - 1))
                                }
                                disabled={currentPage === 1}
                                className="p-1.5 rounded border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span className="text-xs font-medium text-gray-700 min-w-[3rem] text-center">
                                Page {currentPage} of {totalAcceptedPages}
                            </span>
                            <button
                                type="button"
                                onClick={() =>
                                    setCurrentPage((p) =>
                                        Math.min(totalAcceptedPages, p + 1),
                                    )
                                }
                                disabled={currentPage === totalAcceptedPages}
                                className="p-1.5 rounded border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Invite Modal */}
            <AnimatePresence>
                {showInviteModal && (
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
                                <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03] z-0">
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

                                <div className="p-5 border-b border-gray-100 flex items-center justify-between relative z-10 bg-white/50 backdrop-blur-sm">
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900">
                                            Invite Team Member
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {staffCount} / {teamLimit} seats
                                            occupied
                                        </p>
                                    </div>
                                    <button
                                        onClick={() =>
                                            setShowInviteModal(false)
                                        }
                                        className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <form
                                    onSubmit={handleInviteUser}
                                    className="relative z-10"
                                >
                                    <div className="p-6 space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                                Email Address
                                            </label>
                                            <input
                                                type="email"
                                                value={inviteEmail}
                                                onChange={(e) =>
                                                    setInviteEmail(
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full px-4 py-2.5 rounded-lg outline-none bg-slate-50 focus:bg-white border border-gray-200 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm"
                                                placeholder="colleague@company.com"
                                                required
                                                autoFocus
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                                Role Permission
                                            </label>
                                            <select
                                                value={inviteRole}
                                                onChange={(e) =>
                                                    setInviteRole(
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full px-4 py-2.5 rounded-lg outline-none bg-slate-50 focus:bg-white border border-gray-200 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm cursor-pointer"
                                            >
                                                <option value="user">
                                                    User (Basic Access)
                                                </option>
                                                <option value="manager">
                                                    Manager (Edit Access)
                                                </option>
                                            </select>
                                        </div>

                                        {inviteRole !== "admin" && (
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                                    Assign to Branch
                                                </label>
                                                <select
                                                    value={inviteStoreId}
                                                    onChange={(e) =>
                                                        setInviteStoreId(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-full px-4 py-2.5 rounded-lg outline-none bg-slate-50 focus:bg-white border border-gray-200 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm cursor-pointer"
                                                    required
                                                >
                                                    <option value="" disabled>
                                                        Select a branch...
                                                    </option>
                                                    {storesData
                                                        ?.filter(
                                                            (s: any) =>
                                                                s.isActive !==
                                                                false,
                                                        )
                                                        .map((store: any) => (
                                                            <option
                                                                key={store.id}
                                                                value={store.id}
                                                            >
                                                                {store.name}
                                                            </option>
                                                        ))}
                                                </select>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-5 border-t border-gray-100 bg-gray-50/50 flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowInviteModal(false)
                                            }
                                            className="flex-1 py-2.5 px-4 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSending}
                                            className="flex-1 py-2.5 px-4 text-sm font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            {isSending ? (
                                                <Loader2 className="animate-spin h-4 w-4" />
                                            ) : (
                                                "Send Invitation"
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </motion.div>
                    </FloatingPortal>
                )}
            </AnimatePresence>

            {/* Delete Modal */}
            <AnimatePresence>
                {showDeleteModal && userToDelete && (
                    <FloatingPortal>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                transition={{ duration: 0.2 }}
                                className="bg-white rounded-lg p-6 w-full max-w-sm shadow-2xl relative"
                            >
                                <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                                    <AlertCircle className="w-6 h-6 text-red-600" />
                                </div>
                                <h3 className="text-lg font-bold text-center text-gray-900 mb-2">
                                    Remove User
                                </h3>
                                <p className="text-sm text-center text-gray-500 mb-6">
                                    Are you sure you want to remove{" "}
                                    <span className="font-bold text-gray-700">
                                        {userToDelete.email}
                                    </span>
                                    ? They will lose all access to this
                                    workspace.
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() =>
                                            setShowDeleteModal(false)
                                        }
                                        className="flex-1 py-2.5 px-4 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmDeleteUser}
                                        className="flex-1 py-2.5 px-4 text-sm font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    </FloatingPortal>
                )}
            </AnimatePresence>
        </section>
    );
};

export default UserManagement;

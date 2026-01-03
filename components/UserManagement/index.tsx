"use client";
import { AppState } from "@/store";
import { setInvitations } from "@/store/slices/invitationSlice";
import {
    addInvitation,
    removeInvitation,
    setInvitationsWithImages,
    updateInvitation,
} from "@/store/slices/invitationsDataSlice";
import axios from "axios";
import { Trash, Users, AlertCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

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

const UserManagement: React.FC = () => {
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState("user");

    const dispatch = useDispatch();

    // Selectors
    const invitations = useSelector(
        (state: AppState) => state.invitations.invitations
    ) as User[];

    const userInvitations = useSelector(
        (state: AppState) => state.invitationsData.invitationsWithImages
    ) as Invitation[];

    // Fetch Business Data from Redux for the limit check
    const businessDetails = useSelector(
        (state: AppState) => state.businessData?.businessDetails
    );

    const [isLoading, setIsLoading] = useState(userInvitations.length === 0);
    const hasFetched = useRef(false);

    // --- Limit Calculation Logic ---
    const plan = businessDetails?.subscription?.plan || "STARTER";
    const staffCount = businessDetails?.usage?.staffCount || 0;

    // Calculate if they can invite more
    const teamLimit =
        plan === "STARTER" ? 1 : plan === "STANDARD" ? 5 : Infinity;
    const canInvite = staffCount < teamLimit;

    useEffect(() => {
        if (hasFetched.current) return;

        const fetchUsers = async () => {
            if (userInvitations.length === 0) setIsLoading(true);

            try {
                const response = await axios.get("/api/auth/invite/get");

                if (response.data.invitations) {
                    const rawInvitations = response.data.invitations;

                    dispatch(setInvitations(rawInvitations));
                    const imagePromises = rawInvitations.map(
                        async (user: User) => {
                            try {
                                const imageResponse = await axios.get(
                                    "/api/auth/user/image",
                                    {
                                        params: { userId: user.id },
                                    }
                                );
                                return {
                                    ...user,
                                    imageUrl:
                                        imageResponse.data.imageUrl ||
                                        "/images/user.png",
                                } as Invitation;
                            } catch (error) {
                                return {
                                    ...user,
                                    imageUrl: "/images/user.png",
                                } as Invitation;
                            }
                        }
                    );

                    const results = await Promise.allSettled(imagePromises);

                    const usersWithImages = results.map((result, index) => {
                        if (result.status === "fulfilled") return result.value;
                        return {
                            ...rawInvitations[index],
                            imageUrl: null,
                        } as Invitation;
                    });

                    dispatch(setInvitationsWithImages(usersWithImages));
                }

                if (response.status === 404 && userInvitations.length === 0) {
                    toast.warning("No Invitations sent by you yet.");
                }
            } catch (error) {
                if (
                    axios.isAxiosError(error) &&
                    error.response?.status !== 404
                ) {
                    if (userInvitations.length === 0)
                        toast.error("Failed to fetch Invitations.");
                }
            } finally {
                setIsLoading(false);
                hasFetched.current = true;
            }
        };

        fetchUsers();
    }, [dispatch]);

    const handleInviteUser = (e: React.FormEvent) => {
        e.preventDefault();

        // Double check limit before submitting
        if (!canInvite) {
            toast.error("Team limit reached. Please upgrade your plan.");
            return;
        }

        if (!inviteEmail) {
            toast.error("Please enter an email address");
            return;
        }

        const sendInvitation = async () => {
            try {
                const response = await axios.post("/api/auth/invite/post", {
                    email: inviteEmail,
                    role: inviteRole,
                });

                const newInvitation = response.data.invitation;
                dispatch(setInvitations([...invitations, newInvitation]));
                const newInvitationWithImage = {
                    ...newInvitation,
                    imageUrl: null,
                } as Invitation;

                dispatch(addInvitation(newInvitationWithImage));
            } catch (error) {
                throw error;
            }
        };

        toast.promise(sendInvitation(), {
            loading: "Sending Invitation.",
            success: "Invitation sent.",
            error: (err) =>
                err.response?.data?.error || "Failed to send invitation.",
        });

        setInviteEmail("");
        setInviteRole("user");
        setShowInviteModal(false);
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
                                : user
                        )
                    )
                );

                dispatch(
                    updateInvitation({
                        id: userId,
                        updates: { role: newRole },
                    })
                );
            }
        };
        toast.promise(updateRole(), {
            loading: "Updating role.",
            success: "Role updated successfully.",
            error: (error) =>
                error?.response?.data?.error || "Failed to update role.",
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
                    `/api/auth/delete/${userToDelete.clerkUserId}`
                );
            } else {
                response = await axios.delete("/api/auth/invite/delete", {
                    data: { id: userToDelete.id },
                });
            }

            if (response.status === 200) {
                dispatch(
                    setInvitations(
                        invitations.filter((inv) => inv.id !== userToDelete.id)
                    )
                );
                dispatch(removeInvitation(userToDelete.id));
            }
        };

        toast.promise(deleteProcess(), {
            loading: "Deleting User...",
            success: "User deleted successfully.",
            error: (error) =>
                error?.response?.data?.error || "Failed to delete user.",
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
                    <div className="text-gray-500 text-center py-8">
                        No users found. Invite new users to get started.
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
                                            user.status
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
                                    user.role
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
                                            e.target.value
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
            {showInviteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Invite New User
                        </h3>

                        <form onSubmit={handleInviteUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-1">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={inviteEmail}
                                    onChange={(e) =>
                                        setInviteEmail(e.target.value)
                                    }
                                    className="outline-none appearance-none bg-slate-50 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                    placeholder="Enter email address"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-1">
                                    Role
                                </label>
                                <select
                                    value={inviteRole}
                                    onChange={(e) =>
                                        setInviteRole(e.target.value)
                                    }
                                    className="outline-none bg-slate-50 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                >
                                    <option value="user">User</option>
                                    <option value="manager">Manager</option>
                                </select>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowInviteModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 w-full sm:w-auto"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600 w-full sm:w-auto"
                                >
                                    Send Invitation
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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

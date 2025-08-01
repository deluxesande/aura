import { AppState } from "@/store";
import { setInvitations } from "@/store/slices/invitationSlice";
import axios from "axios";
import { Trash } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
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
    Business: {
        name: string;
    };
    inviter: {
        firstName: string;
        lastName: string;
    };
}

const UserManagement: React.FC = () => {
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState("user");

    const dispatch = useDispatch();
    const invitations = useSelector(
        (state: AppState) => state.invitations.invitations
    );

    const handleInviteUser = (e: React.FormEvent) => {
        e.preventDefault();
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
                dispatch(
                    setInvitations([...invitations, response.data.invitation])
                );
            } catch (error) {
                throw error;
            }
        };

        toast.promise(sendInvitation(), {
            loading: "Sending Invitation.",
            success: "Invitation sent.",
            error: "Sending Invitation Failed.",
        });

        setInviteEmail("");
        setInviteRole("user");
        setShowInviteModal(false);
    };

    const handleToggleUserStatus = (userId: string) => {
        //    Call the API to toggle user status
    };

    const handleRoleChange = (userId: string, newRole: string) => {
        // Call the API to update user role
    };

    const handleDeleteUser = (user: User) => {
        setUserToDelete(user);
        setShowDeleteModal(true);
    };

    const confirmDeleteUser = () => {
        // Call the API to delete user
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

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get("/api/auth/invite/get");
                if (response.data.invitations) {
                    dispatch(setInvitations(response.data.invitations));
                }

                if (response.status === 404) {
                    toast.warning("No Invitations sent by you yet.");
                }
            } catch (error) {
                if (
                    axios.isAxiosError(error) &&
                    error.response?.status !== 404
                ) {
                    toast.error("Failed to fetch Invitations.");
                }
            }
        };

        fetchUsers();
    }, [dispatch]);

    return (
        <section>
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-lg font-medium text-gray-900">
                        User Management
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                        Manage user roles, permissions, and account access for
                        your team.
                    </p>
                </div>
                <button
                    onClick={() => setShowInviteModal(true)}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 w-full sm:w-auto"
                >
                    + Invite
                </button>
            </header>

            {/* Users List */}
            <div className="mt-6 space-y-4">
                {invitations.length === 0 && (
                    <div className="text-gray-500">
                        No users found. Invite new users to get started.
                    </div>
                )}
                {(invitations as User[]).map((user) => (
                    <div
                        key={user.id}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm gap-4"
                    >
                        <div className="flex items-center space-x-4 flex-1">
                            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-sm font-medium text-gray-600">
                                    {user.email
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                </span>
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
                                <button
                                    onClick={() =>
                                        handleToggleUserStatus(user.id)
                                    }
                                    className={`px-3 py-1 text-xs font-medium rounded-md border ${
                                        user.status === "accepted"
                                            ? "text-red-600 border-red-300 hover:bg-red-50"
                                            : "text-green-600 border-green-300 hover:bg-green-50"
                                    } w-full sm:w-auto`}
                                >
                                    {user.status === "accepted"
                                        ? "Disable"
                                        : "Enable"}
                                </button>
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
                                    <option value="admin">Admin</option>
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
                                    <option value="admin">Admin</option>
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
                            cannot be undone and will permanently remove the
                            user from your system.
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

import { Trash } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    status: "active" | "inactive";
    lastLogin: string;
    avatar?: string;
}

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([
        {
            id: "1",
            name: "John Doe",
            email: "john@example.com",
            role: "admin",
            status: "active",
            lastLogin: "2 hours ago",
        },
        {
            id: "2",
            name: "Jane Smith",
            email: "jane@example.com",
            role: "manager",
            status: "active",
            lastLogin: "1 day ago",
        },
        {
            id: "3",
            name: "Mike Johnson",
            email: "mike@example.com",
            role: "user",
            status: "inactive",
            lastLogin: "5 days ago",
        },
    ]);

    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState("user");

    const handleInviteUser = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteEmail) {
            toast.error("Please enter an email address");
            return;
        }

        toast.success(`Invitation sent to ${inviteEmail}`);
        setInviteEmail("");
        setInviteRole("user");
        setShowInviteModal(false);
    };

    const handleToggleUserStatus = (userId: string) => {
        setUsers((prev) =>
            prev.map((user) =>
                user.id === userId
                    ? {
                          ...user,
                          status:
                              user.status === "active" ? "inactive" : "active",
                      }
                    : user
            )
        );

        const user = users.find((u) => u.id === userId);
        toast.success(
            `User ${
                user?.status === "active" ? "disabled" : "enabled"
            } successfully`
        );
    };

    const handleRoleChange = (userId: string, newRole: string) => {
        setUsers((prev) =>
            prev.map((user) =>
                user.id === userId ? { ...user, role: newRole } : user
            )
        );
        toast.success("User role updated successfully");
    };

    const handleDeleteUser = (user: User) => {
        setUserToDelete(user);
        setShowDeleteModal(true);
    };

    const confirmDeleteUser = () => {
        if (userToDelete) {
            setUsers((prev) =>
                prev.filter((user) => user.id !== userToDelete.id)
            );
            toast.success(
                `User ${userToDelete.name} has been deleted successfully`
            );
            setShowDeleteModal(false);
            setUserToDelete(null);
        }
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
        return status === "active"
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800";
    };

    return (
        <section>
            <header className="flex items-center justify-between">
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
                    className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                    + Invite User
                </button>
            </header>

            {/* Users List */}
            <div className="mt-6 space-y-4">
                {users.map((user) => (
                    <div
                        key={user.id}
                        className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
                    >
                        <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-600">
                                    {user.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                </span>
                            </div>
                            <div>
                                <div className="flex items-center space-x-2">
                                    <h3 className="text-sm font-medium text-gray-900">
                                        {user.name}
                                    </h3>
                                    <span
                                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                            user.status
                                        )}`}
                                    >
                                        {user.status}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600">
                                    {user.email}
                                </p>
                                <p className="text-xs text-gray-500">
                                    Last login: {user.lastLogin}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(
                                    user.role
                                )}`}
                            >
                                {user.role}
                            </span>
                            <button
                                onClick={() => handleToggleUserStatus(user.id)}
                                className={`px-3 py-1 text-xs font-medium rounded-md border ${
                                    user.status === "active"
                                        ? "text-red-600 border-red-300 hover:bg-red-50"
                                        : "text-green-600 border-green-300 hover:bg-green-50"
                                }`}
                            >
                                {user.status === "active"
                                    ? "Disable"
                                    : "Enable"}
                            </button>
                            <select
                                value={user.role}
                                onChange={(e) =>
                                    handleRoleChange(user.id, e.target.value)
                                }
                                className="outline-none bg-slate-50 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                            >
                                <option value="user">User</option>
                                <option value="manager">Manager</option>
                                <option value="admin">Admin</option>
                            </select>
                            <button
                                onClick={() => handleDeleteUser(user)}
                                className="px-3 py-1 outline-none"
                            >
                                <Trash className="w-4 h-4 stroke-red-500" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Invite User Modal */}
            {showInviteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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

                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowInviteModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600"
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Delete User
                        </h3>

                        <p className="text-sm text-gray-600 mb-6">
                            Are you sure you want to delete{" "}
                            <strong>{userToDelete.name}</strong>? This action
                            cannot be undone and will permanently remove the
                            user from your system.
                        </p>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setUserToDelete(null);
                                }}
                                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDeleteUser}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
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

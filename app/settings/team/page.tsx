"use client";

import Navbar from "@/components/Navbar";
import { AppState } from "@/store";
import { apiClient } from "@/utils/apiClient";
import { AnimatePresence } from "framer-motion";
import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Mail,
    Plus,
    Search,
    UserX,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import InviteMemberModal from "@/components/modals/InviteMemberModal";
import EditMemberModal from "@/components/modals/EditMemberModal";

interface TeamMember {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    imageUrl?: string;
    clerkId: string;
    createdAt: string;
    invoicesSold: number;
    invitedBy: string;
    status?: "active" | "inactive";
    Store?: {
        name: string;
        id: string;
    };
}

export default function TeamPage() {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal States
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editMember, setEditMember] = useState<TeamMember | null>(null);

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState("");
    const [filterRole, setFilterRole] = useState<string>("All");
    const [filterStore, setFilterStore] = useState<string>("All");
    const [stores, setStores] = useState<any[]>([]);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const businessDetails = useSelector(
        (state: AppState) => state.businessData?.businessDetails,
    );

    const plan = businessDetails?.subscription?.plan || "STARTER";
    const staffCount = businessDetails?.usage?.staffCount || 0;
    const teamLimit =
        plan === "STARTER" ? 1 : plan === "STANDARD" ? 5 : Infinity;
    const canInviteMore = staffCount < teamLimit;

    useEffect(() => {
        const fetchTeamAndStores = async () => {
            try {
                const response = await apiClient.get("/users");
                setMembers(response.data);

                if (businessDetails?.id) {
                    const storesResponse = await apiClient.get(
                        `/business/${businessDetails.id}/stores`,
                    );
                    setStores(storesResponse.data || []);
                }
            } catch {
                toast.error("Failed to load team members");
            } finally {
                setLoading(false);
            }
        };

        if (businessDetails?.id) {
            fetchTeamAndStores();
        }
    }, [businessDetails?.id]);

    const openEditModal = (member: TeamMember) => {
        setEditMember(member);
        setShowEditModal(true);
    };

    const handleReactivateMember = async (clerkId: string) => {
        if (!canInviteMore) {
            toast.error(
                `Team limit reached. Your ${plan} plan allows only ${teamLimit} member(s).`,
            );
            return;
        }

        const reactivatePromise = apiClient.post(
            `/users/${clerkId}/reactivate`,
        );

        toast.promise(reactivatePromise, {
            loading: "Reactivating user...",
            success: () => {
                setMembers((prev) =>
                    prev.map((m) =>
                        m.clerkId === clerkId ? { ...m, status: "active" } : m,
                    ),
                );
                return "User reactivated successfully.";
            },
            error: (err) =>
                err.response?.data?.error || "Failed to reactivate user",
        });
    };

    const filteredMembers = members.filter((member) => {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
            member.firstName?.toLowerCase().includes(query) ||
            member.lastName?.toLowerCase().includes(query) ||
            member.email?.toLowerCase().includes(query);

        const matchesRole =
            filterRole === "All"
                ? true
                : member.role.toLowerCase() === filterRole.toLowerCase();

        const matchesStore =
            filterStore === "All"
                ? true
                : filterStore === "All Branches"
                  ? !member.Store?.id
                  : member.Store?.id === filterStore;

        return matchesSearch && matchesRole && matchesStore;
    });

    const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedMembers = filteredMembers.slice(startIndex, endIndex);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filterRole, filterStore]);

    const getRoleBadgeColor = (role: string) => {
        switch (role.toLowerCase()) {
            case "manager":
                return "bg-purple-100 text-purple-700 border-purple-200";
            case "user":
                return "bg-blue-100 text-blue-700 border-blue-200";
            case "admin":
                return "bg-orange-100 text-orange-700 border-orange-200";
            default:
                return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    const handlePageClick = (page: number) => setCurrentPage(page);
    const handleNextPage = () =>
        currentPage < totalPages && setCurrentPage(currentPage + 1);
    const handlePreviousPage = () =>
        currentPage > 1 && setCurrentPage(currentPage - 1);

    const getPageNumbers = () => {
        const pages = [];
        for (let i = 1; i <= totalPages; i++) pages.push(i);
        return pages;
    };

    if (loading) {
        return (
            <Navbar>
                <div className="h-[80vh] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                </div>
            </Navbar>
        );
    }

    return (
        <Navbar>
            <div className="p-4 md:p-8 mx-auto min-h-screen">
                <div className="bg-white shadow-lg rounded-lg p-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Team Members
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Manage access and view team performance.
                            </p>
                        </div>
                        {canInviteMore && (
                            <button
                                onClick={() => setShowInviteModal(true)}
                                className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors font-medium text-sm"
                            >
                                <Plus className="w-4 h-4 stroke-white" />
                                Invite Member
                            </button>
                        )}
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                        <div className="relative w-full md:w-72">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 stroke-green-500" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-sm"
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2">
                            <div className="flex items-center bg-gray-100 p-1 rounded-lg overflow-x-auto">
                                {(
                                    ["All", "Manager", "Admin", "User"] as const
                                ).map((role) => (
                                    <button
                                        key={role}
                                        onClick={() => setFilterRole(role)}
                                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 whitespace-nowrap ${
                                            filterRole === role
                                                ? "bg-green-500 text-white shadow-sm"
                                                : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                                        }`}
                                    >
                                        {role === "All"
                                            ? "All Roles"
                                            : role.charAt(0) +
                                              role.slice(1).toLowerCase()}
                                    </button>
                                ))}
                            </div>

                            <div className="relative">
                                <select
                                    value={filterStore}
                                    onChange={(e) =>
                                        setFilterStore(e.target.value)
                                    }
                                    className="pl-3 pr-8 py-1.5 h-full bg-gray-100 text-gray-500 text-xs font-medium border-0 rounded-lg focus:ring-2 focus:ring-green-500 outline-none appearance-none cursor-pointer hover:bg-gray-200/50 transition-colors"
                                >
                                    <option value="All">All Branches</option>
                                    {stores.map((store) => (
                                        <option key={store.id} value={store.id}>
                                            {store.name}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none h-3 w-3" />
                            </div>
                        </div>
                    </div>

                    {/* Desktop Table */}
                    <div className="hidden lg:block">
                        <div className="overflow-hidden rounded-lg border border-gray-200">
                            <table className="min-w-full bg-white">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Member
                                        </th>
                                        <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Role
                                        </th>
                                        <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Branch
                                        </th>
                                        <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Performance
                                        </th>
                                        <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Invited By
                                        </th>
                                        <th className="py-3 px-4 border-b border-gray-200 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {paginatedMembers.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="py-12 text-center"
                                            >
                                                <div className="flex flex-col items-center justify-center">
                                                    <div className="bg-green-100 rounded-full p-4 mb-3">
                                                        <UserX className="h-6 w-6 stroke-green-500" />
                                                    </div>
                                                    <h3 className="text-gray-900 font-medium text-sm">
                                                        No members found
                                                    </h3>
                                                    <p className="text-gray-500 text-xs mt-1">
                                                        Try adjusting your
                                                        search or filters.
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedMembers.map((member) => (
                                            <tr
                                                key={member.id}
                                                className="hover:bg-gray-50 transition-colors group"
                                            >
                                                <td className="py-3 px-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-9 w-9 rounded-full bg-gray-100 border border-gray-200 overflow-hidden relative flex-shrink-0">
                                                            {member.imageUrl ? (
                                                                <Image
                                                                    src={
                                                                        member.imageUrl
                                                                    }
                                                                    alt={
                                                                        member.firstName
                                                                    }
                                                                    fill
                                                                    className="object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium text-xs">
                                                                    {
                                                                        member
                                                                            .firstName?.[0]
                                                                    }
                                                                    {
                                                                        member
                                                                            .lastName?.[0]
                                                                    }
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="ml-3">
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-sm font-medium text-gray-900">
                                                                    {
                                                                        member.firstName
                                                                    }{" "}
                                                                    {
                                                                        member.lastName
                                                                    }
                                                                </p>
                                                                {member.status ===
                                                                    "inactive" && (
                                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-700 border border-red-200">
                                                                        Inactive
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center text-xs text-gray-500 mt-0.5">
                                                                {member.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 whitespace-nowrap">
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(member.role)}`}
                                                    >
                                                        {member.role}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 whitespace-nowrap">
                                                    <span className="text-sm text-gray-600 font-medium">
                                                        {member.Store?.name ||
                                                            "All Branches"}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-semibold text-gray-900">
                                                            {
                                                                member.invoicesSold
                                                            }
                                                        </span>
                                                        <span className="text-[10px] text-gray-500">
                                                            Paid Invoices
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 whitespace-nowrap">
                                                    <div className="flex items-center text-sm text-gray-600">
                                                        {member.invitedBy}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {member.status ===
                                                        "inactive" ? (
                                                            <button
                                                                onClick={() =>
                                                                    handleReactivateMember(
                                                                        member.clerkId,
                                                                    )
                                                                }
                                                                className="text-green-500 hover:text-green-600 text-xs border border-green-200 hover:bg-green-50 px-3 py-1 rounded-md transition-colors font-semibold"
                                                            >
                                                                Reactivate
                                                            </button>
                                                        ) : member.role.toLowerCase() !==
                                                          "admin" ? (
                                                            <button
                                                                onClick={() =>
                                                                    openEditModal(
                                                                        member,
                                                                    )
                                                                }
                                                                className="text-gray-600 hover:text-green-600 text-xs border border-gray-200 hover:border-green-200 hover:bg-green-50 px-3 py-1 rounded-md transition-colors flex items-center gap-1"
                                                            >
                                                                Edit
                                                            </button>
                                                        ) : null}
                                                        <Link
                                                            href={`/settings/team/${member.clerkId}`}
                                                            className="text-green-600 hover:text-green-900 text-xs border border-green-200 hover:bg-green-50 px-3 py-1 rounded-md transition-colors"
                                                        >
                                                            View
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Mobile Cards */}
                    <div className="block lg:hidden space-y-4">
                        {paginatedMembers.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10">
                                <div className="bg-green-100 rounded-full p-4 mb-3">
                                    <UserX className="h-6 w-6 stroke-green-500" />
                                </div>
                                <h3 className="text-gray-900 font-medium text-sm">
                                    No members found
                                </h3>
                            </div>
                        ) : (
                            paginatedMembers.map((member) => (
                                <Link
                                    href={`/settings/team/${member.clerkId}`}
                                    key={member.id}
                                    className="block p-4 border border-gray-200 rounded-lg shadow-sm bg-gray-50 hover:bg-gray-100 transition-colors relative"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-white border border-gray-200 overflow-hidden relative flex-shrink-0">
                                                {member.imageUrl ? (
                                                    <Image
                                                        src={member.imageUrl}
                                                        alt={member.firstName}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium">
                                                        {member.firstName?.[0]}
                                                        {member.lastName?.[0]}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                                    {member.firstName}{" "}
                                                    {member.lastName}
                                                    {member.status ===
                                                        "inactive" && (
                                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-700 border border-red-200">
                                                            Inactive
                                                        </span>
                                                    )}
                                                </h3>
                                                <div className="flex items-center text-xs text-gray-500 mt-0.5">
                                                    <Mail className="w-3 h-3 mr-1" />
                                                    <span className="truncate max-w-[180px]">
                                                        {member.email}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <span
                                                className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium border ${getRoleBadgeColor(member.role)}`}
                                            >
                                                {member.role}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-200 my-3"></div>

                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-gray-400 uppercase tracking-wide">
                                                Sales
                                            </span>
                                            <span className="text-sm font-semibold text-gray-900">
                                                {member.invoicesSold} Invoices
                                            </span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] text-gray-400 uppercase tracking-wide">
                                                Branch
                                            </span>
                                            <span className="text-sm font-medium text-gray-700">
                                                {member.Store?.name ||
                                                    "All Branches"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center mt-3">
                                        <span className="text-xs text-gray-400">
                                            Joined{" "}
                                            {new Date(
                                                member.createdAt,
                                            ).toLocaleDateString()}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            {member.status === "inactive" ? (
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleReactivateMember(
                                                            member.clerkId,
                                                        );
                                                    }}
                                                    className="text-green-600 hover:bg-green-50 font-medium px-3 py-1 rounded border border-green-200 transition-colors text-xs"
                                                >
                                                    Reactivate
                                                </button>
                                            ) : member.role.toLowerCase() !==
                                              "admin" ? (
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        openEditModal(member);
                                                    }}
                                                    className="text-gray-600 hover:text-green-600 font-medium flex items-center px-2 py-1 bg-gray-50 rounded border border-gray-200 transition-colors text-xs"
                                                >
                                                    Edit
                                                </button>
                                            ) : null}
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>

                    {/* Pagination Controls */}
                    {!loading && filteredMembers.length > 0 && (
                        <div className="flex flex-wrap justify-center items-center pt-4 my-4 gap-2 sm:gap-4">
                            <button
                                className="btn btn-xs btn-ghost flex items-center bg-green-400 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-600"
                                onClick={handlePreviousPage}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="w-4 h-4 stroke-white" />
                                <span className="hidden sm:inline text-sm text-white">
                                    Back
                                </span>
                            </button>

                            <div className="flex space-x-1 sm:space-x-2">
                                {getPageNumbers().map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => handlePageClick(page)}
                                        className={`btn btn-xs border-0 ${currentPage === page ? "bg-green-400 text-white hover:bg-green-600" : "btn-ghost text-black hover:bg-green-100"}`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>

                            <button
                                className="btn btn-xs btn-ghost flex items-center bg-green-400 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-600"
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages}
                            >
                                <span className="hidden sm:inline text-sm text-white">
                                    Next
                                </span>
                                <ChevronRight className="w-4 h-4 stroke-white" />
                            </button>
                        </div>
                    )}

                    {!loading && filteredMembers.length > 0 && (
                        <div className="text-center text-xs text-gray-400 mt-4 pb-2">
                            Showing {startIndex + 1} to{" "}
                            {Math.min(endIndex, filteredMembers.length)} of{" "}
                            {filteredMembers.length} members
                        </div>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {showInviteModal && (
                    <InviteMemberModal
                        isOpen={showInviteModal}
                        onClose={() => setShowInviteModal(false)}
                        canInviteMore={canInviteMore}
                        plan={plan}
                        teamLimit={teamLimit}
                        staffCount={staffCount}
                        stores={stores}
                    />
                )}
                {showEditModal && editMember && (
                    <EditMemberModal
                        isOpen={showEditModal}
                        onClose={() => setShowEditModal(false)}
                        member={editMember}
                        stores={stores}
                        onSuccess={(updatedMember) => {
                            setMembers((prev) =>
                                prev.map((m) =>
                                    m.clerkId === editMember.clerkId
                                        ? {
                                              ...m,
                                              role: updatedMember.role,
                                              Store: updatedMember.Store,
                                          }
                                        : m,
                                ),
                            );
                        }}
                    />
                )}
            </AnimatePresence>
        </Navbar>
    );
}

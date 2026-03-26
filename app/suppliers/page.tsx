"use client";

import Navbar from "@/components/Navbar";
import { apiClient } from "@/utils/apiClient";
import {
    Loader2,
    Plus,
    Search,
    ChevronLeft,
    ChevronRight,
    Lock,
    Trash2,
    Edit,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { AppState } from "@/store";
import SupplierModal from "@/components/modals/SupplierModal";
import Image from "next/image";

export default function SuppliersOverviewPage() {
    const router = useRouter();
    const businessDetails = useSelector(
        (state: AppState) => state.businessData?.businessDetails,
    );
    const user = useSelector((state: AppState) => state.auth.user);

    // Determine if the user is on a paid plan (Standard or Premium)
    const activeSub = Array.isArray(businessDetails?.subscription)
        ? businessDetails.subscription.find(
              (sub: any) =>
                  sub.status === "ACTIVE" || sub.status === "TRIALING",
          )
        : businessDetails?.subscription;
    const isPaidPlan = activeSub && activeSub.plan !== "STARTER";

    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState("");

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const fetchSuppliers = async () => {
        try {
            const res = await apiClient.get("/suppliers");
            setSuppliers(res.data || []);
        } catch (error: any) {
            if (error.response?.status === 404) {
                setSuppliers([]);
            } else {
                toast.error("Failed to load suppliers");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (businessDetails) {
            if (isPaidPlan) {
                fetchSuppliers();
            } else {
                setLoading(false);
            }
        }
    }, [isPaidPlan, businessDetails]);

    // Reset pagination on search
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const handleDelete = async (supplierId: string, supplierName: string) => {
        if (
            !window.confirm(
                `Are you sure you want to permanently delete ${supplierName}?`,
            )
        )
            return;
        try {
            await apiClient.delete(`/suppliers/${supplierId}`);
            toast.success("Supplier deleted successfully.");
            fetchSuppliers();
        } catch (error: any) {
            toast.error(
                error.response?.data?.error || "Failed to delete supplier.",
            );
        }
    };

    const filteredSuppliers = suppliers.filter((supplier) => {
        const searchLower = searchQuery.toLowerCase();
        return (
            supplier.name?.toLowerCase().includes(searchLower) ||
            supplier.email?.toLowerCase().includes(searchLower) ||
            supplier.phoneNumber?.includes(searchQuery)
        );
    });

    const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage) || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedSuppliers = filteredSuppliers.slice(startIndex, endIndex);

    const handlePreviousPage = () =>
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    const handleNextPage = () =>
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    const handlePageClick = (page: number) => setCurrentPage(page);

    const getPageNumbers = () => {
        const pages = [];
        const maxPagesToShow = 3;
        let startPage = Math.max(
            1,
            currentPage - Math.floor(maxPagesToShow / 2),
        );
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        return pages;
    };

    if (!businessDetails || loading) {
        return (
            <Navbar>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                    </div>
                </div>
            </Navbar>
        );
    }

    if (!isPaidPlan) {
        return (
            <Navbar>
                <div className="p-4 md:p-8 mx-auto min-h-screen font-sans flex items-center justify-center">
                    <div className="bg-white shadow-lg rounded-xl p-10 border border-gray-100 max-w-md text-center">
                        <div className="w-16 h-16 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm">
                            <Lock className="w-8 h-8 text-gray-400" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">
                            Premium Feature
                        </h2>
                        <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                            Supplier Management and tracking wholesale orders
                            are exclusively available on our paid plans. Upgrade
                            your business to unlock these tools.
                        </p>
                        <button
                            onClick={() => router.push("/settings")}
                            className="w-full py-3 bg-green-500 text-white font-bold text-sm rounded-lg hover:bg-green-600 transition-colors shadow-md"
                        >
                            View Subscription Plans
                        </button>
                    </div>
                </div>
            </Navbar>
        );
    }

    return (
        <Navbar>
            <div className="p-4 md:p-8 mx-auto min-h-screen font-sans">
                <div className="bg-white shadow-lg rounded-lg p-4 border border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Supplier Directory
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Manage vendors and wholesale partners.
                            </p>
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className="flex items-center justify-center gap-2 bg-green-500 text-white px-4 py-2.5 rounded-lg hover:bg-green-600 transition-colors font-bold text-sm shadow-sm shadow-green-100"
                        >
                            <Plus className="w-4 h-4 stroke-white" />
                            Add Supplier
                        </button>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                        <div className="relative w-full md:w-96">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 stroke-green-500" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search suppliers by name, email, or phone..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-sm"
                            />
                        </div>
                        <div className="bg-gray-50 px-4 py-2.5 rounded-lg border border-gray-200 flex items-center gap-3 w-full md:w-auto justify-between">
                            <span className="text-sm text-gray-500 font-bold uppercase tracking-wider">
                                Total Vendors:
                            </span>
                            <span className="text-lg font-semibold text-gray-900">
                                {filteredSuppliers.length}
                            </span>
                        </div>
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-gray-100">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        Supplier Name
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        Contact Info
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        Address
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        Logged By
                                    </th>
                                    {user?.role !== "user" && (
                                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">
                                            Actions
                                        </th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {paginatedSuppliers.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={
                                                user?.role !== "user" ? 5 : 4
                                            }
                                            className="px-6 py-12 text-center text-sm text-gray-500"
                                        >
                                            No suppliers found.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedSuppliers.map(
                                        (supplier, index) => (
                                            <tr
                                                key={`supplier-row-${supplier?.id || index}`}
                                                className="hover:bg-gray-50 transition-colors group cursor-pointer"
                                                onClick={() =>
                                                    router.push(
                                                        `/suppliers/${supplier.id}`,
                                                    )
                                                }
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <p className="text-sm font-bold text-gray-900">
                                                        {supplier.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500 font-medium mt-0.5">
                                                        Added{" "}
                                                        {new Date(
                                                            supplier.createdAt,
                                                        ).toLocaleDateString()}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <p className="text-sm text-gray-900 font-medium">
                                                        {supplier.phoneNumber ||
                                                            "No Phone"}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        {supplier.email ||
                                                            "No Email"}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm text-gray-600 line-clamp-1 max-w-[200px]">
                                                        {supplier.address ||
                                                            "—"}
                                                    </p>
                                                </td>
                                                <td className="p-4 whitespace-nowrap">
                                                    {supplier.CreatedBy ? (
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 ring-1 ring-gray-200 bg-gray-100">
                                                                <Image
                                                                    src={
                                                                        supplier
                                                                            .CreatedBy
                                                                            .imageUrl ||
                                                                        "/images/user.png"
                                                                    }
                                                                    width={32}
                                                                    height={32}
                                                                    alt={`${supplier.CreatedBy.firstName || "User"} Profile`}
                                                                    className="object-cover"
                                                                />
                                                            </div>
                                                            <div className="flex flex-col overflow-hidden">
                                                                <p className="text-sm font-semibold text-gray-900 truncate">
                                                                    {
                                                                        supplier
                                                                            .CreatedBy
                                                                            .firstName
                                                                    }{" "}
                                                                    {
                                                                        supplier
                                                                            .CreatedBy
                                                                            .lastName
                                                                    }
                                                                </p>
                                                                <p className="text-xs text-gray-500 truncate capitalize">
                                                                    {supplier
                                                                        .CreatedBy
                                                                        .role ||
                                                                        "User"}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 text-sm italic">
                                                            Unknown
                                                        </span>
                                                    )}
                                                </td>
                                                {user?.role !== "user" && (
                                                    <td className="p-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <button
                                                                onClick={(
                                                                    e,
                                                                ) => {
                                                                    e.stopPropagation();
                                                                    setSelectedSupplier(
                                                                        supplier,
                                                                    );
                                                                    setShowEditModal(
                                                                        true,
                                                                    );
                                                                }}
                                                                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                                                title="Edit Supplier"
                                                            >
                                                                <Edit
                                                                    size={18}
                                                                    className="stroke-green-500"
                                                                />
                                                            </button>
                                                            <button
                                                                onClick={(
                                                                    e,
                                                                ) => {
                                                                    e.stopPropagation();
                                                                    handleDelete(
                                                                        supplier.id,
                                                                        supplier.name,
                                                                    );
                                                                }}
                                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                                title="Delete Supplier"
                                                            >
                                                                <Trash2
                                                                    size={18}
                                                                    className="stroke-red-500"
                                                                />
                                                            </button>
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        ),
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>

                    {paginatedSuppliers.length > 0 && (
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
                                        className={`btn btn-xs border-0 ${
                                            currentPage === page
                                                ? "bg-green-400 text-white hover:bg-green-600"
                                                : "btn-ghost text-black hover:bg-green-100"
                                        }`}
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
                </div>
            </div>

            {showModal && (
                <SupplierModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    onSuccess={fetchSuppliers}
                />
            )}

            {showEditModal && (
                <SupplierModal
                    isOpen={showEditModal}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedSupplier(null);
                    }}
                    onSuccess={fetchSuppliers}
                    supplier={selectedSupplier}
                />
            )}
        </Navbar>
    );
}

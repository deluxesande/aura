"use client";

import SupplierModal from "@/components/modals/SupplierModal";
import Navbar from "@/components/Navbar";
import { AppState } from "@/store";
import { apiClient } from "@/utils/apiClient";
import {
    ArrowLeft,
    Banknote,
    Building2,
    Lock,
    Mail,
    MapPin,
    Package,
    Phone,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";

export default function SingleSupplierPage() {
    const params = useParams();
    const router = useRouter();
    const supplierId = params?.id as string;

    const businessDetails = useSelector(
        (state: AppState) => state.businessData?.businessDetails,
    );

    // Determine paid plan based on Team page logic
    const activeSub = Array.isArray(businessDetails?.subscription)
        ? businessDetails.subscription.find(
              (sub: any) =>
                  sub.status === "ACTIVE" || sub.status === "TRIALING",
          )
        : businessDetails?.subscription?.status === "ACTIVE" ||
            businessDetails?.subscription?.status === "TRIALING"
          ? businessDetails.subscription
          : null;
    const isPaidPlan = activeSub && activeSub.plan !== "STARTER";

    const [supplier, setSupplier] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);

    // Pagination for delivery history
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const fetchSupplierDetails = useCallback(async () => {
        try {
            const res = await apiClient.get(`/suppliers/${supplierId}`);
            setSupplier(res.data);
        } catch (error) {
            toast.error("Failed to load supplier details");
            router.push("/suppliers");
        } finally {
            setLoading(false);
        }
    }, [supplierId, router]);

    useEffect(() => {
        if (businessDetails) {
            if (isPaidPlan && supplierId) {
                fetchSupplierDetails();
            } else {
                setLoading(false);
            }
        }
    }, [isPaidPlan, businessDetails, supplierId, fetchSupplierDetails]);

    const handleDelete = async () => {
        if (
            !window.confirm(
                `Are you sure you want to permanently delete ${supplier?.name}? This action cannot be undone.`,
            )
        )
            return;
        try {
            await apiClient.delete(`/suppliers/${supplierId}`);
            toast.success("Supplier deleted successfully.");
            router.push("/suppliers");
        } catch (error: any) {
            toast.error(
                error.response?.data?.error || "Failed to delete supplier.",
            );
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-KE", {
            style: "currency",
            currency: "KES",
        }).format(amount || 0);
    };

    if (!businessDetails || loading) {
        return (
            <Navbar>
                <div className="h-[80vh] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
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
                            Supplier profiles are exclusively available on our
                            paid plans. Upgrade your business to unlock these
                            tools.
                        </p>
                        <button
                            onClick={() => router.push("/settings")}
                            className="w-full py-3 bg-gray-900 text-white font-bold text-sm rounded-lg hover:bg-gray-800 transition-colors shadow-md"
                        >
                            View Subscription Plans
                        </button>
                    </div>
                </div>
            </Navbar>
        );
    }

    if (!supplier) return null;

    // Stats calculations
    const deliveries = supplier?.deliveries || [];
    const totalSpent = deliveries.reduce(
        (sum: number, d: any) => sum + (d.totalCost || 0),
        0,
    );
    const totalUnits = deliveries.reduce(
        (sum: number, d: any) =>
            sum +
            (d.receipts?.reduce(
                (acc: number, r: any) => acc + (r.quantity || 0),
                0,
            ) || 0),
        0,
    );
    const totalDeliveries = deliveries.length;

    // Pagination calculations
    const totalPages = Math.ceil(deliveries.length / itemsPerPage) || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedDeliveries = deliveries.slice(startIndex, endIndex);

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
        for (let i = startPage; i <= endPage; i++) pages.push(i);
        return pages;
    };

    return (
        <Navbar>
            <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 font-sans">
                {/* Back Button matching UserDetailsPage */}
                <Link href="/suppliers">
                    <div className="w-10 h-10 items-center justify-center flex bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </div>
                </Link>

                {/* Profile Card */}
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 md:p-8">
                        <div className="flex flex-col lg:flex-row justify-between gap-8">
                            <div className="flex flex-col sm:flex-row gap-6 items-start">
                                <div className="space-y-4 flex-1">
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h1 className="text-2xl font-bold text-gray-900">
                                                {supplier.name}
                                            </h1>
                                            {/* Role Badge */}
                                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-blue-100 text-blue-700 border-blue-200">
                                                SUPPLIER
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                            <span className="flex items-center font-light gap-1">
                                                Added{" "}
                                                {new Date(
                                                    supplier.createdAt,
                                                ).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Contact Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center border border-gray-200 flex-shrink-0">
                                                <Phone className="w-4 h-4 stroke-green-500" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 font-medium">
                                                    Phone
                                                </p>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {supplier.phoneNumber ||
                                                        "N/A"}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center border border-gray-200 flex-shrink-0">
                                                <Mail className="w-4 h-4 stroke-green-500" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 font-medium">
                                                    Email Address
                                                </p>
                                                <p className="text-sm font-medium text-gray-900 line-clamp-1">
                                                    {supplier.email || "N/A"}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 sm:col-span-2">
                                            <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center border border-gray-200 flex-shrink-0">
                                                <MapPin className="w-4 h-4 stroke-green-500" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 font-medium">
                                                    Physical Address
                                                </p>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {supplier.address || "N/A"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions Section (Replacing Invited By) */}
                            <div className="lg:border-l lg:w-72 flex flex-col justify-center text-center space-y-3">
                                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    Management Actions
                                </div>
                                <div className="flex flex-col gap-2">
                                    <div className="flex flex-col gap-2 items-center">
                                        <button
                                            onClick={() =>
                                                setShowEditModal(true)
                                            }
                                            className="flex items-center justify-center text-center gap-2 text-sm font-bold text-gray-700 bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-lg hover:bg-gray-100 transition-colors w-40"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={handleDelete}
                                            className="flex items-center justify-center text-center gap-2 text-sm font-bold text-red-600 bg-red-50 border border-red-100 px-4 py-2.5 rounded-lg hover:bg-red-100 transition-colors w-40"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- Analytics Cards (Matching Team Page) --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Total Spent */}
                    <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                Total Amount Spent
                            </p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                                {formatCurrency(totalSpent)}
                            </p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                            <Banknote className="w-5 h-5 stroke-green-500" />
                        </div>
                    </div>

                    {/* Units Supplied */}
                    <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                Total Units Supplied
                            </p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                                {totalUnits.toLocaleString()}
                            </p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                            <Package className="w-5 h-5 stroke-green-500" />
                        </div>
                    </div>

                    {/* Total Deliveries */}
                    <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                Deliveries Processed
                            </p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                                {totalDeliveries}
                            </p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-5 h-5 stroke-green-500" />
                        </div>
                    </div>
                </div>

                {/* Delivery History Table */}
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900">
                            {supplier.name}&apos;s Delivery History
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        Date
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        Reference
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        Product(s)
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        Branch
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        Total Qty
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        Total Cost
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {paginatedDeliveries.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-6 py-12 text-center text-sm text-gray-500"
                                        >
                                            No deliveries recorded for this
                                            supplier yet.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedDeliveries.map(
                                        (delivery: any, idx: number) => (
                                            <tr
                                                key={`sup-del-${delivery?.id || idx}`}
                                                className="hover:bg-gray-50 transition-colors cursor-pointer"
                                                onClick={() => router.push(`/suppliers/history/${delivery.id}`)}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                                                    {new Date(
                                                        delivery.createdAt,
                                                    ).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                                                    {delivery.reference || "N/A"}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {delivery.receipts?.length > 1 
                                                        ? `${delivery.receipts[0].Product?.name} (+${delivery.receipts.length - 1} more)`
                                                        : delivery.receipts?.[0]?.Product?.name || "Unknown Product"}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {delivery.Store?.name ||
                                                        "Unknown Branch"}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                                                    {delivery.receipts?.reduce((acc: number, r: any) => acc + (r.quantity || 0), 0)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-black text-gray-900">
                                                    {formatCurrency(
                                                        delivery.totalCost,
                                                    )}
                                                </td>
                                            </tr>
                                        ),
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    {paginatedDeliveries.length > 0 && totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                            <p className="text-sm text-gray-500">
                                Showing{" "}
                                <span className="font-medium">
                                    {startIndex + 1}
                                </span>{" "}
                                to{" "}
                                <span className="font-medium">
                                    {Math.min(endIndex, deliveries.length)}
                                </span>{" "}
                                of{" "}
                                <span className="font-medium">
                                    {deliveries.length}
                                </span>{" "}
                                results
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() =>
                                        setCurrentPage((p) =>
                                            Math.max(1, p - 1),
                                        )
                                    }
                                    disabled={currentPage === 1}
                                    className="px-3 py-1.5 border border-gray-200 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() =>
                                        setCurrentPage((p) =>
                                            Math.min(totalPages, p + 1),
                                        )
                                    }
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1.5 border border-gray-200 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {showEditModal && (
                <SupplierModal
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    onSuccess={fetchSupplierDetails}
                    supplier={supplier}
                />
            )}
        </Navbar>
    );
}

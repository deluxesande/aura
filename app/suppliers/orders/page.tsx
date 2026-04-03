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
    ChevronDown,
} from "lucide-react";
import React, { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppState } from "@/store";
import { setOrders as setOrdersInStore } from "@/store/slices/orderSlice";
import PurchaseOrderModal from "@/components/modals/PurchaseOrderModal";
import Image from "next/image";

export default function PurchaseOrdersPage() {
    const router = useRouter();
    const dispatch = useDispatch();
    const businessDetails = useSelector(
        (state: AppState) => state.businessData?.businessDetails,
    );
    const user = useSelector((state: AppState) => state.auth.user);
    const orders = useSelector((state: AppState) => state.order.orders);

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

    const [loading, setLoading] = useState(orders.length === 0);
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const fetchOrders = useCallback(async () => {
        try {
            const res = await apiClient.get("/purchase-orders");
            dispatch(setOrdersInStore(res.data || []));
        } catch (error: any) {
            if (error.response?.status === 404) {
                dispatch(setOrdersInStore([]));
            } else {
                toast.error("Failed to load purchase orders");
            }
        } finally {
            setLoading(false);
        }
    }, [dispatch]);

    useEffect(() => {
        if (businessDetails) {
            if (isPaidPlan) {
                fetchOrders();
            } else {
                setLoading(false);
            }
        }
    }, [isPaidPlan, businessDetails, fetchOrders]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const handleDelete = async (orderId: string, orderRef: string) => {
        if (
            !window.confirm(
                `Are you sure you want to delete order ${orderRef}?`,
            )
        )
            return;
        try {
            await apiClient.delete(`/purchase-orders/${orderId}`);
            toast.success("Order deleted successfully.");
            fetchOrders();
        } catch (error: any) {
            toast.error(
                error.response?.data?.error || "Failed to delete order.",
            );
        }
    };

    const handleStatusChange = async (order: any, newStatus: string) => {
        const orderId = order?.id || order?._id;
        if (!orderId) {
            toast.error("Invalid order id.");
            return;
        }

        try {
            const payload = {
                supplierId: order.supplierId,
                reference: order.reference,
                totalAmount: order.totalAmount,
                status: newStatus,
                items: (order.items || []).map((item: any) => ({
                    productId: item.productId,
                    quantity: Number(item.quantity),
                    unitCost: Number(item.unitCost),
                })),
            };

            await apiClient.patch(`/purchase-orders/${orderId}`, payload);
            toast.success(`Order status updated to ${newStatus}`);
            fetchOrders();
        } catch (error: any) {
            toast.error(
                error.response?.data?.error || "Failed to update status.",
            );
        }
    };

    const filteredOrders = orders.filter((order) => {
        const searchLower = searchQuery.toLowerCase();
        return (
            order.reference?.toLowerCase().includes(searchLower) ||
            order.Supplier?.name?.toLowerCase().includes(searchLower) ||
            order.status?.toLowerCase().includes(searchLower)
        );
    });

    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

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
        for (let i = startPage; i <= endPage; i++) pages.push(i);
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
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm">
                            <Lock className="w-8 h-8 stroke-green-500" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">
                            Premium Feature
                        </h2>
                        <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                            Purchase Order management is exclusively available
                            on our paid plans. Upgrade your business to unlock
                            these tools.
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
                                Purchase Orders
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Create and track orders sent to your suppliers.
                            </p>
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className="flex items-center justify-center gap-2 bg-green-500 text-white px-4 py-2.5 rounded-lg hover:bg-green-600 transition-colors font-bold text-sm shadow-sm shadow-green-100"
                        >
                            <Plus className="w-4 h-4 stroke-white" />
                            Create Order
                        </button>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                        <div className="relative w-full md:w-96">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 stroke-green-500" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search by PO number or supplier..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-sm"
                            />
                        </div>
                        <div className="bg-gray-50 px-4 py-2.5 rounded-lg border border-gray-200 flex items-center gap-3 w-full md:w-auto justify-between">
                            <span className="text-sm text-gray-500 font-bold uppercase tracking-wider">
                                Total Orders:
                            </span>
                            <span className="text-lg font-semibold text-gray-900">
                                {filteredOrders.length}
                            </span>
                        </div>
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-gray-100">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        Order Details
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        Supplier
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        Created By
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        Estimated Cost
                                    </th>
                                    {user?.role !== "user" && (
                                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">
                                            Actions
                                        </th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {paginatedOrders.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={
                                                user?.role !== "user" ? 6 : 5
                                            }
                                            className="px-6 py-12 text-center text-sm text-gray-500"
                                        >
                                            No purchase orders found.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedOrders.map((order, index) => (
                                        <tr
                                            key={`po-row-${order?.id || index}`}
                                            className="hover:bg-gray-50 transition-colors group cursor-pointer"
                                            onClick={() =>
                                                router.push(
                                                    `/suppliers/orders/${order.id}`,
                                                )
                                            }
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <p className="text-sm font-bold text-gray-900">
                                                    {order.reference || "N/A"}
                                                </p>
                                                <p className="text-xs text-gray-500 font-medium mt-0.5">
                                                    Date:{" "}
                                                    {new Date(
                                                        order.createdAt || new Date(),
                                                    ).toLocaleDateString()}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <p className="text-sm text-gray-900 font-medium">
                                                    {order.Supplier?.name ||
                                                        "Unknown"}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {order.CreatedBy ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 ring-1 ring-gray-200 bg-gray-100">
                                                            <Image
                                                                src={
                                                                    order
                                                                        .CreatedBy
                                                                        .imageUrl ||
                                                                    "/images/user.png"
                                                                }
                                                                width={32}
                                                                height={32}
                                                                alt="Profile"
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                        <div className="flex flex-col overflow-hidden">
                                                            <p className="text-sm font-semibold text-gray-900 truncate">
                                                                {
                                                                    order
                                                                        .CreatedBy
                                                                        .firstName
                                                                }{" "}
                                                                {
                                                                    order
                                                                        .CreatedBy
                                                                        .lastName
                                                                }
                                                            </p>
                                                            <p className="text-xs text-gray-500 truncate capitalize">
                                                                {order.CreatedBy
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
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div
                                                    className="relative inline-block"
                                                    onClick={(e) =>
                                                        e.stopPropagation()
                                                    }
                                                >
                                                    <select
                                                        value={
                                                            order.status ||
                                                            "PENDING"
                                                        }
                                                        onChange={(e) =>
                                                            handleStatusChange(
                                                                order,
                                                                e.target.value,
                                                            )
                                                        }
                                                        className={`pl-3 pr-8 py-1.5 rounded-md text-xs font-bold tracking-wider uppercase appearance-none cursor-pointer outline-none transition-colors border ${
                                                            order.status ===
                                                            "DELIVERED"
                                                                ? "bg-green-50 text-green-500 border-green-200 hover:bg-green-100"
                                                                : order.status ===
                                                                    "CANCELLED"
                                                                  ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                                                                  : order.status ===
                                                                      "IN_TRANSIT"
                                                                    ? "bg-blue-50 text-blue-500 border-blue-200 hover:bg-blue-100"
                                                                    : "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100"
                                                        }`}
                                                    >
                                                        <option
                                                            value="PENDING"
                                                            className="bg-white text-gray-900"
                                                        >
                                                            PENDING
                                                        </option>
                                                        <option
                                                            value="IN_TRANSIT"
                                                            className="bg-white text-gray-900"
                                                        >
                                                            IN TRANSIT
                                                        </option>
                                                        <option
                                                            value="DELIVERED"
                                                            className="bg-white text-gray-900"
                                                        >
                                                            DELIVERED
                                                        </option>
                                                        <option
                                                            value="CANCELLED"
                                                            className="bg-white text-gray-900"
                                                        >
                                                            CANCELLED
                                                        </option>
                                                    </select>
                                                    <ChevronDown
                                                        className={`absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none ${
                                                            order.status ===
                                                            "DELIVERED"
                                                                ? "text-green-600"
                                                                : order.status ===
                                                                    "CANCELLED"
                                                                  ? "text-red-600"
                                                                  : order.status ===
                                                                      "IN_TRANSIT"
                                                                    ? "text-green-500"
                                                                    : "text-orange-600"
                                                        }`}
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <span className="text-sm font-bold text-gray-900">
                                                    KSh{" "}
                                                    {(
                                                        order.totalAmount || 0
                                                    ).toLocaleString()}
                                                </span>
                                            </td>
                                            {user?.role !== "user" && (
                                                <td className="p-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedOrder(
                                                                    order,
                                                                );
                                                                setShowEditModal(
                                                                    true,
                                                                );
                                                            }}
                                                            className="p-2 text-gray-400 hover:text-green-500 hover:bg-blue-50 rounded-lg transition-all"
                                                            title="Edit Order"
                                                        >
                                                            <Edit
                                                                size={18}
                                                                className="stroke-green-500"
                                                            />
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDelete(
                                                                    order.id,
                                                                    order.reference,
                                                                );
                                                            }}
                                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                            title="Delete Order"
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
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {paginatedOrders.length > 0 && (
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
                <PurchaseOrderModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    onSuccess={fetchOrders}
                />
            )}

            {showEditModal && (
                <PurchaseOrderModal
                    isOpen={showEditModal}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedOrder(null);
                    }}
                    onSuccess={fetchOrders}
                    order={selectedOrder}
                />
            )}
        </Navbar>
    );
}

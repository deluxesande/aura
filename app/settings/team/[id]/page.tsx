"use client";

import Navbar from "@/components/Navbar";
import InvoicesTable from "@/components/InvoicesTable";
import { apiClient } from "@/utils/apiClient";
import {
    ArrowLeft,
    Briefcase,
    Calendar,
    Mail,
    Receipt,
    UserPlus,
} from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { Invoice } from "@/utils/typesDefinitions";

// 1. Update Interface to match the Object returned by API
interface StaffUser {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    clerkId: string;
    role: "MANAGER" | "ADMIN" | "USER";
    imageUrl?: string;
    createdAt: string;
    invitedBy: {
        name: string;
        imageUrl: string;
    };
}

interface ExtendedInvoice extends Invoice {
    totalQuantity?: number;
}

export default function UserDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const userId = params?.id as string;

    const [staffUser, setStaffUser] = useState<StaffUser | null>(null);
    const [invoices, setInvoices] = useState<ExtendedInvoice[]>([]);
    const [loading, setLoading] = useState(true);

    // --- Stats Calculation ---
    const totalRevenue = invoices.reduce(
        (acc, curr) => (curr.status === "PAID" ? acc + curr.totalAmount : acc),
        0,
    );

    const totalSalesCount = invoices.length;

    const todaysSales = invoices.reduce((acc, curr) => {
        if (curr.status !== "PAID") return acc;

        const invDate = new Date(curr.createdAt);
        const today = new Date();

        const isToday =
            invDate.getDate() === today.getDate() &&
            invDate.getMonth() === today.getMonth() &&
            invDate.getFullYear() === today.getFullYear();

        return isToday ? acc + curr.totalAmount : acc;
    }, 0);

    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true);
            try {
                const userRes = await apiClient.get(`/users/${userId}`);

                if (userRes.data) {
                    setStaffUser(userRes.data);
                } else {
                    toast.error("User not found");
                    router.push("/settings");
                }
            } catch (error) {
                toast.error("Failed to load user details");
            } finally {
                setLoading(false);
            }
        };

        if (userId) fetchUser();
    }, [userId, router]);

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                const response = await apiClient.get(
                    `/invoice/user?userId=${userId}`,
                );
                setInvoices(response.data);
            } catch (error) {
                console.error("Error fetching user sales:", error);
            }
        };

        if (userId) fetchInvoices();
    }, [userId]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-KE", {
            style: "currency",
            currency: "KES",
        }).format(amount);
    };

    const handleInvoiceDelete = (id: string) => {
        const promise = async () => {
            try {
                await apiClient.delete(`/invoice/${id}`);
                setInvoices((prev) => prev.filter((inv) => inv.id !== id));
            } catch (error) {
                throw error;
            }
        };

        toast.promise(promise(), {
            loading: "Deleting record...",
            success: "Record deleted",
            error: "Could not delete record",
        });
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

    if (!staffUser) return null;

    return (
        <Navbar>
            <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
                {/* Back Button */}
                <Link href="/settings/team">
                    <div className="w-10 h-10 items-center justify-center flex bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </div>
                </Link>

                {/* Profile Card */}
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 md:p-8">
                        <div className="flex flex-col lg:flex-row justify-between gap-8">
                            <div className="flex flex-col sm:flex-row gap-6 items-start">
                                {/* Avatar */}
                                <div className="h-20 w-20 rounded-full bg-gray-100 border border-gray-200 relative overflow-hidden flex items-center justify-center">
                                    {staffUser.imageUrl ? (
                                        <Image
                                            src={staffUser.imageUrl}
                                            alt={staffUser.firstName}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <span className="text-2xl font-bold text-gray-500">
                                            {staffUser.firstName.charAt(0)}
                                            {staffUser.lastName.charAt(0)}
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-4 flex-1">
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h1 className="text-2xl font-bold text-gray-900">
                                                {staffUser.firstName}{" "}
                                                {staffUser.lastName}
                                            </h1>
                                            {/* Role Badge */}
                                            <span
                                                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                                                    staffUser.role === "ADMIN"
                                                        ? "bg-purple-100 text-purple-700 border-purple-200"
                                                        : staffUser.role ===
                                                            "MANAGER"
                                                          ? "bg-blue-100 text-blue-700 border-blue-200"
                                                          : "bg-gray-100 text-gray-700 border-gray-200"
                                                }`}
                                            >
                                                {staffUser.role}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                            <span className="flex items-center font-light gap-1">
                                                Joined{" "}
                                                {new Date(
                                                    staffUser.createdAt,
                                                ).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Contact Grid */}
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center border border-gray-200">
                                                <Mail className="w-4 h-4 stroke-green-500" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 font-medium">
                                                    Email Address
                                                </p>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {staffUser.email}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Invited By Section */}
                            <div className="lg:border-l lg:pl-8 lg:w-72 flex flex-col justify-center space-y-3">
                                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    Invited By
                                </div>
                                <div className="flex items-center gap-3">
                                    {/* Inviter Image */}
                                    <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100 overflow-hidden relative">
                                        {staffUser.invitedBy &&
                                        staffUser.invitedBy.imageUrl &&
                                        staffUser.invitedBy.imageUrl !==
                                            "/images/user.png" ? (
                                            <Image
                                                src={
                                                    staffUser.invitedBy.imageUrl
                                                }
                                                alt={staffUser.invitedBy.name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <UserPlus className="w-5 h-5 text-blue-500" />
                                        )}
                                    </div>

                                    {/* Inviter Details */}
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">
                                            {staffUser.invitedBy?.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {staffUser.invitedBy?.name ===
                                            "Direct Join"
                                                ? "System Admin"
                                                : "Team Invitation"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- Analytics Cards (Sales Performance) --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Total Revenue */}
                    <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                Total Revenue Generated
                            </p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                                {formatCurrency(totalRevenue)}
                            </p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                            <Briefcase className="w-5 h-5 stroke-green-500" />
                        </div>
                    </div>

                    {/* Sales Count */}
                    <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                Orders Processed
                            </p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                                {totalSalesCount}
                            </p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                            <Receipt className="w-5 h-5 stroke-green-500" />
                        </div>
                    </div>

                    {/* Today's Sales */}
                    <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                Today&apos;s Sales
                            </p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                                {formatCurrency(todaysSales)}
                            </p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                            <Calendar className="w-5 h-5 stroke-green-500" />
                        </div>
                    </div>
                </div>

                {/* Sales History Table */}
                <InvoicesTable
                    title={`${staffUser.firstName}'s Sales History`}
                    invoices={invoices}
                    handleDelete={handleInvoiceDelete}
                    loading={loading}
                    itemsPerPage={10}
                />
            </div>
        </Navbar>
    );
}

"use client";

import Navbar from "@/components/Navbar";
import InvoicesTable from "@/components/InvoicesTable";
import { apiClient } from "@/utils/apiClient";
import {
    ArrowLeft,
    Briefcase,
    CreditCard,
    Mail,
    Phone,
    Receipt,
} from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { Invoice } from "@/utils/typesDefinitions";
import EditCustomerModal from "@/components/EditCustomerModal";

interface Customer {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phoneNumber: string;
    createdAt: string;
    CreatedBy?: {
        firstName: string | null;
        lastName: string | null;
        imageUrl?: string | null;
        role?: string;
    } | null;
}

interface ExtendedInvoice extends Invoice {
    totalQuantity?: number;
}

export default function CustomerDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const customerId = params?.id as string;

    const [customer, setCustomer] = useState<Customer | null>(null);
    const [invoices, setInvoices] = useState<ExtendedInvoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [showEditCustomerModal, setShowEditCustomerModal] = useState(false);

    const onSuccess = (updatedCustomer: Customer) => {
        setCustomer(updatedCustomer);
    };

    // Stats
    const totalSpent = invoices.reduce(
        (acc, curr) => (curr.status === "PAID" ? acc + curr.totalAmount : acc),
        0,
    );
    const totalOrders = invoices.length;
    const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const customerRes = await apiClient.get(
                    `/customer/${customerId}`,
                );
                const foundCustomer = customerRes.data;
                if (foundCustomer) {
                    setCustomer(foundCustomer);
                } else {
                    toast.error("Customer not found");
                    router.push("/customers");
                }
            } catch (error) {
                toast.error("Failed to load customer details");
            } finally {
                setLoading(false);
            }
        };

        if (customerId) fetchData();
    }, [customerId, router]);

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
                setInvoices((prevInvoices) =>
                    prevInvoices.filter((invoice) => invoice.id !== id),
                );
            } catch (error) {
                // Handle error appropriately
            }
        };

        toast.promise(promise(), {
            loading: "Deleting invoice...",
            success: "Invoice deleted successfully",
            error: "Error deleting invoice",
        });
    };

    useEffect(() => {
        setLoading(true);
        const fetchInvoices = async () => {
            try {
                const response = await apiClient.get(
                    `/invoice/customer?customerId=${customerId}`,
                );
                setInvoices(response.data);
            } catch (error) {
                // console.error("Error fetching invoices:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInvoices();
    }, [customerId]);

    if (loading) {
        return (
            <Navbar>
                <div className="h-[80vh] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                </div>
            </Navbar>
        );
    }

    if (!customer) return null;

    return (
        <Navbar>
            <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
                <Link href="/customers">
                    <div className="w-10 h-10 items-center justify-center flex bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </div>
                </Link>
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 md:p-8">
                        <div className="flex flex-col lg:flex-row justify-between gap-8">
                            <div className="flex flex-col sm:flex-row gap-6 items-start">
                                <div className="h-20 w-20 rounded-full bg-green-100 text-green-500 flex shrink-0 items-center justify-center text-3xl font-bold border border-green-200">
                                    {customer.firstName.charAt(0)}
                                    {customer.lastName.charAt(0)}
                                </div>
                                <div className="space-y-4 flex-1">
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-900">
                                            {customer.firstName}{" "}
                                            {customer.lastName}
                                        </h1>
                                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                            <span className="flex items-center font-light gap-1">
                                                Customer since{" "}
                                                {new Date(
                                                    customer.createdAt,
                                                ).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Contact Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center border border-gray-200">
                                                <Phone className="w-4 h-4 stroke-green-500" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 font-medium">
                                                    Phone Number
                                                </p>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {customer.phoneNumber}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center border border-gray-200">
                                                <Mail className="w-4 h-4 stroke-green-500" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 font-medium">
                                                    Email Address
                                                </p>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {customer.email ||
                                                        "Not provided"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Created By / Account Manager Section */}
                            <div className="lg:border-l lg:pl-8 lg:w-72 flex flex-col justify-center space-y-3">
                                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    Account Manager (Created By)
                                </div>
                                {customer.CreatedBy ? (
                                    <div className="flex items-center gap-3">
                                        <Image
                                            src={
                                                customer.CreatedBy.imageUrl ||
                                                "https://www.svgrepo.com/show/535711/user.svg"
                                            }
                                            width={40}
                                            height={40}
                                            alt="Manager"
                                            className="rounded-full w-10 h-10 object-cover border border-gray-200"
                                        />
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">
                                                {customer.CreatedBy.firstName}{" "}
                                                {customer.CreatedBy.lastName}
                                            </p>
                                            <p className="text-xs text-gray-500 capitalize">
                                                {customer.CreatedBy.role ||
                                                    "Staff"}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 italic">
                                        Unknown / System
                                    </p>
                                )}
                                <div className="pt-2">
                                    <button
                                        onClick={() =>
                                            setShowEditCustomerModal(true)
                                        }
                                        className="w-full btn btn-sm bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                                    >
                                        Edit Profile
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- 2. Analytics Cards --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                Lifetime Value
                            </p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                                {formatCurrency(totalSpent)}
                            </p>
                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                <Briefcase className="w-5 h-5 stroke-green-500" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                Total Invoices
                            </p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                                {totalOrders}
                            </p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                            <Receipt className="w-5 h-5 stroke-green-500" />
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                Avg. Order Value
                            </p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                                {formatCurrency(avgOrderValue)}
                            </p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                            <CreditCard className="w-5 h-5 stroke-green-500" />
                        </div>
                    </div>
                </div>

                <InvoicesTable
                    title="Customer Invoices"
                    invoices={invoices}
                    handleDelete={handleInvoiceDelete}
                    loading={loading}
                    itemsPerPage={5}
                />

                <EditCustomerModal
                    showEditCustomerModal={showEditCustomerModal}
                    setShowEditCustomerModal={setShowEditCustomerModal}
                    customer={customer}
                    onSuccess={onSuccess}
                />
            </div>
        </Navbar>
    );
}

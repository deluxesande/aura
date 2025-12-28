"use client";
import Navbar from "@/components/Navbar";
import { useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";
import { Invoice, Product } from "@/utils/typesDefinitions";
import axios from "axios";
import { format } from "date-fns";
import {
    Copy,
    ArrowLeft,
    Calendar,
    CreditCard,
    User,
    Printer,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

function InvoicePageContent() {
    const searchParams = useSearchParams();
    const id = searchParams ? searchParams.get("id") : null;
    const [invoiceItems, setInvoiceItems] = useState<
        { Product: Product; quantity: number }[]
    >([]);
    const [invoice, setInvoice] = useState<Invoice>();

    const getStatusColor = (status: string) => {
        switch (status) {
            case "pending":
                return "bg-yellow-100 text-yellow-700 border-yellow-200";
            case "active":
                return "bg-green-100 text-green-700 border-green-200";
            case "completed":
                return "bg-blue-100 text-blue-700 border-blue-200";
            case "cancelled":
                return "bg-red-100 text-red-700 border-red-200";
            default:
                return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    const copyToClipboard = (text: string | undefined) => {
        if (text) {
            navigator.clipboard.writeText(text);
            toast.success("Copied to clipboard");
        }
    };

    useEffect(() => {
        const fetchInvoice = async () => {
            if (!id) return;
            try {
                const response = await axios.get(`/api/invoice/${id}`);
                const invoiceData = response.data;

                // Keep raw date for logic, formatted for display if needed
                setInvoice({
                    ...invoiceData,
                    createdAt: new Date(invoiceData.createdAt),
                    updatedAt: new Date(invoiceData.updatedAt),
                });

                setInvoiceItems(response.data.invoiceItems);
            } catch (error) {
                toast.error("Error fetching invoice");
            }
        };

        fetchInvoice();
    }, [id]);

    if (!invoice) {
        return (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            </div>
        );
    }

    return (
        <Navbar>
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/invoices"
                            className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold text-gray-900">
                                    {invoice.invoiceName}
                                </h1>
                                <span
                                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                                        invoice.status?.toLowerCase() ||
                                            "pending"
                                    )}`}
                                >
                                    {invoice.status
                                        ? invoice.status
                                              .charAt(0)
                                              .toUpperCase() +
                                          invoice.status.slice(1)
                                        : "Pending"}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                View and manage invoice details
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                            <Printer size={16} />
                            Print
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                            Download
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* LEFT COLUMN - Invoice Items & Summary */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                <h3 className="font-semibold text-gray-900">
                                    Invoice Items
                                </h3>
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                    {invoiceItems.length} items
                                </span>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50/50">
                                        <tr className="text-left text-xs font-semibold text-gray-500 tracking-wider">
                                            <th className="px-6 py-3">
                                                Item Details
                                            </th>
                                            <th className="px-6 py-3 text-center">
                                                Qty
                                            </th>
                                            <th className="px-6 py-3 text-right">
                                                Unit Price
                                            </th>
                                            <th className="px-6 py-3 text-right">
                                                Total
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {invoiceItems.map((item, index) => (
                                            <tr
                                                key={index}
                                                className="hover:bg-gray-50/50 transition-colors"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-gray-900">
                                                            {item.Product.name}
                                                        </span>
                                                        <span className="text-xs text-gray-500 truncate max-w-[200px]">
                                                            {item.Product
                                                                .description ||
                                                                "No description"}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center text-sm text-gray-600">
                                                    {item.quantity}
                                                </td>
                                                <td className="px-6 py-4 text-right text-sm text-gray-600">
                                                    Ksh {item.Product.price}
                                                </td>
                                                <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                                                    Ksh{" "}
                                                    {item.Product.price *
                                                        item.quantity}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Total Summary Footer */}
                            <div className="bg-gray-50 p-6 flex flex-col items-end gap-2 border-t border-gray-100">
                                <div className="flex justify-between w-full md:w-1/2 lg:w-1/3">
                                    <span className="text-sm text-gray-500">
                                        Subtotal
                                    </span>
                                    <span className="text-sm font-medium text-gray-900">
                                        Ksh {invoice.totalAmount}
                                    </span>
                                </div>
                                <div className="flex justify-between w-full md:w-1/2 lg:w-1/3 pt-3 mt-3 border-t border-gray-200">
                                    <span className="text-base font-bold text-gray-900">
                                        Total Due
                                    </span>
                                    <span className="text-xl font-bold text-green-600">
                                        Ksh {invoice.totalAmount}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN - Meta Details */}
                    <div className="space-y-6">
                        {/* Invoice Meta */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
                                Invoice Details
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                                        <span className="text-xs font-medium">
                                            Invoice ID
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg border border-gray-100">
                                        <span className="text-xs font-mono text-gray-700 truncate max-w-[150px]">
                                            {invoice.id}
                                        </span>
                                        <button
                                            onClick={() =>
                                                copyToClipboard(invoice.id)
                                            }
                                            className="text-gray-400 hover:text-green-600 transition-colors"
                                        >
                                            <Copy size={14} />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 text-gray-500 mb-1">
                                            <Calendar size={14} />
                                            <span className="text-xs font-medium">
                                                Issued
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-900 font-medium">
                                            {format(
                                                new Date(invoice.createdAt),
                                                "MMM dd, yyyy"
                                            )}
                                        </p>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 text-gray-500 mb-1">
                                            <CreditCard size={14} />
                                            <span className="text-xs font-medium">
                                                Payment
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-900 font-medium">
                                            {invoice.paymentType}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Customer Info */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
                                Customer
                            </h3>
                            <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50/50">
                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center border border-green-200">
                                    <User className="w-5 h-5 text-green-700" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">
                                        {invoice.Customer?.firstName ||
                                            "Unknown Client"}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Billed Client
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Navbar>
    );
}

const InvoicePage: React.FC = () => {
    return (
        <Suspense
            fallback={
                <Navbar>
                    <div className="flex items-center justify-center h-[80vh]">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                    </div>
                </Navbar>
            }
        >
            <InvoicePageContent />
        </Suspense>
    );
};

export default InvoicePage;

"use client";
import Navbar from "@/components/Navbar";
import { useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";
import TopProducts from "@/components/TopProducts";
import { Invoice, Product } from "@/utils/typesDefinitions";
import axios from "axios";
import { format } from "date-fns";
import { Copy } from "lucide-react";
import { toast } from "sonner";

function InvoicePageContent() {
    const searchParams = useSearchParams();
    const id = searchParams ? searchParams.get("id") : null;
    const [invoiceItems, setInvoiceItems] = useState<
        { Product: Product; quantity: number }[]
    >([]);
    const [invoice, setInvoice] = useState<Invoice>();

    // Function to get the color based on status
    const getStatusColor = (status: string) => {
        switch (status) {
            case "pending":
                return "bg-yellow-500 text-white";
            case "active":
                return "bg-green-500 text-white";
            case "completed":
                return "bg-blue-500 text-white";
            case "cancelled":
                return "bg-red-500 text-white";
            default:
                return "bg-gray-500 text-white";
        }
    };

    const copyToClipboard = (text: string | undefined) => {
        if (text) {
            navigator.clipboard.writeText(text);
        }
    };

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                const response = await axios.get(`/api/invoice/${id}`);
                const invoiceData = response.data;

                // Convert createdAt and updatedAt to formatted strings
                invoiceData.createdAt = format(
                    new Date(invoiceData.createdAt),
                    "MMM dd, yyyy hh:mm a"
                );
                invoiceData.updatedAt = format(
                    new Date(invoiceData.updatedAt),
                    "MMM dd, yyyy hh:mm a"
                );

                setInvoice(invoiceData);

                setInvoiceItems(response.data.invoiceItems);
            } catch (error) {
                toast.error("Error fetching invoice:");
            }
        };

        fetchInvoice();
    }, [id]);

    return (
        <Navbar>
            <div className="flex flex-row flex-wrap gap-10 justify-between p-4 card bg-white shadow-lg rounded-lg mt-4">
                <div className="w-full">
                    <div className="flex justify-between">
                        <p className="text-gray-600">{invoice?.invoiceName}</p>
                        <span
                            className={`px-2 py-1 rounded-lg ${getStatusColor(
                                invoice?.status.toLowerCase() ?? "pending"
                            )}`}
                        >
                            {invoice?.status
                                ? invoice.status.charAt(0).toUpperCase() +
                                  invoice.status.slice(1)
                                : "pending"}
                        </span>
                    </div>

                    <div className="flex flex-col w-full gap-2">
                        <div className="flex justify-between mt-10">
                            <p className="text-black font-semibold">
                                Invoice No:
                            </p>
                            <div className="flex items-center">
                                <p className="text-black font-semibold mr-2 truncate w-36">
                                    {invoice?.id}
                                </p>
                                <Copy
                                    size={18}
                                    className="text-gray-600 cursor-pointer"
                                    onClick={() => copyToClipboard(invoice?.id)}
                                />
                            </div>
                        </div>
                        <div className="flex justify-between">
                            <p className="text-black font-semibold">Created:</p>
                            <p className="text-black font-semibold">
                                {invoice?.createdAt?.toString()}
                            </p>
                        </div>

                        <div className="flex justify-between mt-10">
                            <p className="text-gray-600 font-light">
                                Payment Type
                            </p>
                            <p className="text-gray-600 font-light">
                                Client Name
                            </p>
                        </div>
                        <div className="flex justify-between">
                            <p className="text-black font-semibold">
                                {invoice?.paymentType}
                            </p>
                            <p className="text-black font-semibold">
                                {invoice?.Customer?.firstName || "N/A"}
                            </p>
                        </div>

                        <div className="bg-green-600 h-28 w-full rounded-lg mt-8 flex flex-col items-center justify-center gap-2">
                            <p className="text-white text-xl font-semibold">
                                Amount
                            </p>
                            <p className="text-white text-xl font-light">
                                ${invoice?.totalAmount}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="w-full">
                    <div className="flex justify-between">
                        <p className="text-gray-600 font-light">Items</p>
                    </div>
                    {invoiceItems.map((invoiceItem, index) => (
                        <TopProducts
                            key={index}
                            product={invoiceItem.Product}
                        />
                    ))}
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
                    <div className="flex items-center justify-center h-64">
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

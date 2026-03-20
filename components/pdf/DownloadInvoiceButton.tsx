"use client";

import { AppState } from "@/store";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { ChevronDown, Printer, FileText, ScrollText } from "lucide-react";
import { useMemo, useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import InvoicePDF from "./InvoicePDF";

interface DownloadInvoiceButtonProps {
    invoice: any;
}

export default function DownloadInvoiceButton({
    invoice,
}: DownloadInvoiceButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const businessDetails = useSelector(
        (state: AppState) => state.businessData.businessDetails,
    );

    const isStarterPlan = businessDetails?.subscription?.plan === "STARTER";
    const status = invoice?.status?.toUpperCase() || "";
    const isPaid = status === "PAID" || status === "COMPLETED";

    const business = useMemo(() => {
        if (!businessDetails) return null;
        return {
            name: businessDetails.name,
            email: businessDetails.email,
            address: businessDetails.address,
            logo: businessDetails.logo,
            phoneNumber: businessDetails.phoneNumber,
            plan: businessDetails.subscription?.plan || "STARTER",
        };
    }, [businessDetails]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (isStarterPlan || !isPaid) {
        return null;
    }

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full sm:w-auto justify-center flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
                <Printer size={16} />
                Print
                <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                    <div className="p-1">
                        <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Select Format
                        </div>

                        {/* Option 1: A4 Standard */}
                        <PDFDownloadLink
                            document={
                                <InvoicePDF
                                    invoice={invoice}
                                    business={business}
                                    pageSize="A4"
                                />
                            }
                            fileName={`${invoice.invoiceName}-A4.pdf`}
                        >
                            {({ loading }) => (
                                <button
                                    disabled={loading}
                                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-lg transition-colors text-left disabled:opacity-50"
                                >
                                    <div className="flex flex-col">
                                        <span className="font-medium">
                                            Standard A4
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            For office printers
                                        </span>
                                    </div>
                                </button>
                            )}
                        </PDFDownloadLink>

                        {/* Option 2: A7 (Receipt Size) */}
                        <PDFDownloadLink
                            document={
                                <InvoicePDF
                                    invoice={invoice}
                                    business={business}
                                    pageSize="A7"
                                />
                            }
                            fileName={`${invoice.invoiceName}-receipt.pdf`}
                        >
                            {({ loading }) => (
                                <button
                                    disabled={loading}
                                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-lg transition-colors text-left disabled:opacity-50"
                                >
                                    <div className="flex flex-col">
                                        <span className="font-medium">
                                            Thermal Receipt
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            Small format (A7)
                                        </span>
                                    </div>
                                </button>
                            )}
                        </PDFDownloadLink>
                    </div>
                </div>
            )}
        </div>
    );
}

"use client";

import { AppState } from "@/store";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { Printer } from "lucide-react";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import InvoicePDF from "./InvoicePDF";

interface DownloadInvoiceButtonProps {
    invoice: any;
}

export default function DownloadInvoiceButton({
    invoice,
}: DownloadInvoiceButtonProps) {
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

    if (isStarterPlan || !isPaid) {
        return null;
    }

    return (
        <PDFDownloadLink
            document={<InvoicePDF invoice={invoice} business={business} />}
            fileName={`${invoice.invoiceName}.pdf`}
        >
            {({ blob, url, loading, error }) => (
                <button
                    disabled={loading}
                    className="w-full sm:w-auto justify-center flex btn-sm items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                    <Printer size={16} />
                    {loading ? "Preparing..." : "Print"}
                </button>
            )}
        </PDFDownloadLink>
    );
}

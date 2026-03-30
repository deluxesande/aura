"use client";

import { AppState } from "@/store";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { Loader2, Printer } from "lucide-react";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import DeliveryPDF from "./DeliveryPDF";

interface DownloadDeliveryButtonProps {
    delivery: any;
}

export default function DownloadDeliveryButton({
    delivery,
}: DownloadDeliveryButtonProps) {
    const businessDetails = useSelector(
        (state: AppState) => state.businessData.businessDetails,
    );

    const isStarterPlan = businessDetails?.subscription?.plan === "STARTER";

    const business = useMemo(() => {
        if (!businessDetails) return null;
        return {
            name: businessDetails.name,
            email: businessDetails.email,
            address: businessDetails.address,
            logo: businessDetails.logo,
            phoneNumber: businessDetails.phoneNumber,
        };
    }, [businessDetails]);

    if (isStarterPlan) {
        return (
            <div
                className="tooltip tooltip-bottom"
                data-tip="Upgrade to download PDF receipts"
            >
                <button
                    disabled
                    className="w-full sm:w-auto justify-center flex items-center gap-2 px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-sm font-bold text-gray-400 cursor-not-allowed"
                >
                    <Printer size={16} />
                    Print
                </button>
            </div>
        );
    }

    return (
        <PDFDownloadLink
            document={<DeliveryPDF delivery={delivery} business={business} />}
            fileName={`Delivery-${delivery.reference || delivery.id}.pdf`}
        >
            {({ loading }) => (
                <button
                    disabled={loading}
                    className="w-full sm:w-auto justify-center flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                >
                    {loading ? (
                        <Loader2
                            size={16}
                            className="animate-spin text-green-500"
                        />
                    ) : (
                        <Printer size={16} className="text-green-500" />
                    )}
                    {loading ? "Preparing..." : "Print"}
                </button>
            )}
        </PDFDownloadLink>
    );
}

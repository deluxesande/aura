"use client";

import InvoicesTable from "@/components/InvoicesTable";
import Navbar from "@/components/Navbar";
import React, { useEffect } from "react";
import axios from "axios";
import { Invoice } from "@/utils/typesDefinitions";
import { toast } from "sonner";

export default function Page() {
    const [invoices, setInvoices] = React.useState<Invoice[]>([]);
    const [loading, setLoading] = React.useState<boolean>(false);

    const handleDelete = async (invoiceId: string) => {
        const promise = async () => {
            try {
                await axios.delete(`/api/invoice/${invoiceId}`);
                setInvoices((prevInvoices) =>
                    prevInvoices.filter((invoice) => invoice.id !== invoiceId)
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
                const response = await axios.get("/api/invoice");
                setInvoices(response.data);
            } catch (error) {
                // console.error("Error fetching invoices:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInvoices();
    }, []);

    return (
        <Navbar>
            <InvoicesTable
                title="All Invoices"
                invoices={invoices}
                handleDelete={handleDelete}
                loading={loading}
            />
        </Navbar>
    );
}

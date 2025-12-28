"use client";

import InvoicesTable from "@/components/InvoicesTable";
import Navbar from "@/components/Navbar";
import React, { useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { AppState } from "@/store";
import { setInvoices } from "@/store/slices/invoiceSlice";

export default function Page() {
    const dispatch = useDispatch();

    // 1. Load invoices directly from the Redux store
    const invoices = useSelector((state: AppState) => state.invoice.invoices);

    // 2. Initialize loading based on whether we already have data.
    // If we have data, loading is false (instant render). If not, it's true (show spinner).
    const [loading, setLoading] = React.useState<boolean>(
        invoices.length === 0
    );

    const handleDelete = async (invoiceId: string) => {
        const promise = async () => {
            try {
                await axios.delete(`/api/invoice/${invoiceId}`);

                // 3. Update Redux store instead of local state
                const updatedInvoices = invoices.filter(
                    (invoice) => invoice.id !== invoiceId
                );
                dispatch(setInvoices(updatedInvoices));
            } catch (error) {
                throw error;
            }
        };

        toast.promise(promise(), {
            loading: "Deleting invoice...",
            success: "Invoice deleted successfully",
            error: "Error deleting invoice",
        });
    };

    useEffect(() => {
        const fetchInvoices = async () => {
            // Only set loading to true if we have absolutely no data to show
            if (invoices.length === 0) setLoading(true);

            try {
                const response = await axios.get("/api/invoice");

                // 4. Update the store with fresh data from the API (Background Update)
                dispatch(setInvoices(response.data));
            } catch (error) {
                // console.error("Error fetching invoices:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInvoices();
        // We intentionally omit 'invoices' from the dependency array to avoid
        // infinite re-renders when the store updates.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch]);

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

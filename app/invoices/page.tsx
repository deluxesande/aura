"use client";

import InvoicesTable from "@/components/InvoicesTable";
import Navbar from "@/components/Navbar";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { AppState } from "@/store";
import { setInvoices, removeInvoice } from "@/store/slices/invoiceSlice";

export default function Page() {
    const dispatch = useDispatch();

    const invoices = useSelector((state: AppState) => state.invoice.invoices);

    const [loading, setLoading] = useState(invoices.length === 0);

    const handleDelete = async (invoiceId: string) => {
        const promise = async () => {
            await axios.delete(`/api/invoice/${invoiceId}`);

            dispatch(removeInvoice(invoiceId));
        };

        toast.promise(promise(), {
            loading: "Deleting invoice...",
            success: "Invoice deleted successfully",
            error: "Error deleting invoice",
        });
    };

    useEffect(() => {
        const fetchInvoices = async () => {
            if (invoices.length === 0) {
                setLoading(true);
            }

            try {
                const response = await axios.get("/api/invoice");
                dispatch(setInvoices(response.data));
            } catch (error) {
                // console.error("Error fetching invoices:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInvoices();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch]);
    // ^ Removed 'invoices.length' from dependency to prevent infinite loops

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

"use client";

import InvoicesTable from "@/components/InvoicesTable";
import Navbar from "@/components/Navbar";
import React, { useEffect } from "react";
import axios from "axios";

export default function Page() {
    const [invoices, setInvoices] = React.useState([]);

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                const response = await axios.get("/api/invoice");
                setInvoices(response.data);
            } catch (error) {
                console.error("Error fetching invoices:", error);
            }
        };

        fetchInvoices();
    }, []);

    return (
        <Navbar>
            <InvoicesTable title="All Invoices" />
        </Navbar>
    );
}

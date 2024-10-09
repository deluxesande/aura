import React from "react";
import Navbar from "@components/Navbar";
import InvoicesTable from "@/components/InvoicesTable";

export default function index() {
    return (
        <Navbar>
            <h1>Dashboard</h1>
            <InvoicesTable title="Recent Invoices" />
        </Navbar>
    );
}

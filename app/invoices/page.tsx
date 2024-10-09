import InvoicesTable from "@/components/InvoicesTable";
import Navbar from "@/components/Navbar";
import React from "react";

export default function page() {
    return (
        <Navbar>
            <InvoicesTable title="All Invoices" />
        </Navbar>
    );
}

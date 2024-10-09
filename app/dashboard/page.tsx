import React from "react";
import Navbar from "@components/Navbar";
import InvoicesTable from "@/components/InvoicesTable";
import InfoCard from "@/components/InfoCard";
import { ReceiptText, BadgeDollarSign } from "lucide-react";

const infoCards = [
    { title: "Invoices", number: 10, icon: ReceiptText },
    { title: "Profit", number: 1000, icon: BadgeDollarSign },
    { title: "Invoices", number: 1000, icon: ReceiptText },
    { title: "Profit", number: 0, icon: BadgeDollarSign },
];

export default function index() {
    return (
        <Navbar>
            {/* Info Cards */}
            <div className="flex overflow-hidden gap-6 my-6">
                {infoCards.map((card, index) => (
                    <InfoCard
                        key={index}
                        title={card.title}
                        number={card.number}
                        icon={card.icon}
                    />
                ))}
            </div>

            <div className="flex gap-4 my-4">
                <div className="px-6 py-4 rounded-lg gap-4 bg-white flex-1 w-2/3">
                    <h1 className="text-2xl font-bold mb-6 text-gray-400">
                        Monthly Sales
                    </h1>
                </div>
                <div className="px-6 py-4 rounded-lg gap-4 bg-white w-1/3">
                    <h1 className="text-2xl font-bold mb-6 text-gray-400">
                        Top Products
                    </h1>
                </div>
            </div>

            <InvoicesTable title="Recent Invoices" />
        </Navbar>
    );
}

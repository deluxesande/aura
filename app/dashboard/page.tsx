"use client";
import React, { useEffect, useState } from "react";
import Navbar from "@components/Navbar";
import InvoicesTable from "@/components/InvoicesTable";
import InfoCard from "@/components/InfoCard";
import { ReceiptText, BadgeDollarSign } from "lucide-react";
import TopProducts from "@/components/TopProducts";
import { Product } from "@/utils/typesDefinitions";
import axios from "axios";
import LineChart from "@/components/LineChart";

const infoCards = [
    { title: "Invoices", number: 10, icon: ReceiptText },
    { title: "Profit", number: 1000, icon: BadgeDollarSign },
    { title: "Invoices", number: 1000, icon: ReceiptText },
    { title: "Profit", number: 0, icon: BadgeDollarSign },
];

export default function Page() {
    const [products, setProducts] = useState<Product[]>([]);
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

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get("/api/product");
                const limitedProducts = response.data.slice(0, 5);
                setProducts(limitedProducts);
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };

        fetchProducts();
    }, []);

    return (
        <Navbar>
            {/* Info Cards */}
            <div className="flex overflow-hidden w-full justify-between gap-6 my-4">
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
                <div className="px-6 py-4 h-fit rounded-lg gap-4 bg-white flex-1 w-[40%]">
                    <h1 className="text-2xl font-bold mb-6 text-gray-400">
                        Monthly Sales
                    </h1>

                    <LineChart />
                </div>

                <div className="px-6 py-4 rounded-lg gap-4 bg-white w-[60%]">
                    <h1 className="text-2xl font-bold mb-6 text-gray-400">
                        Top Products
                    </h1>

                    {products.map((product, index) => (
                        <TopProducts key={index} product={product} />
                    ))}
                </div>
            </div>

            <InvoicesTable title="Recent Invoices" invoices={invoices} />
        </Navbar>
    );
}

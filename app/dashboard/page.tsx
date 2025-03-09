"use client";
import React, { useEffect, useState } from "react";
import Navbar from "@components/Navbar";
import InvoicesTable from "@/components/InvoicesTable";
import InfoCard from "@/components/InfoCard";
import { ReceiptText, BadgeDollarSign, PlusCircle } from "lucide-react";
import TopProducts from "@/components/TopProducts";
import { Product } from "@/utils/typesDefinitions";
import axios from "axios";
import LineChart from "@/components/LineChart";
import Link from "next/link";

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
            } catch (error) {}
        };

        fetchInvoices();
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get("/api/product");
                const limitedProducts = response.data.slice(0, 5);
                setProducts(limitedProducts);
            } catch (error) {}
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

            <div className="flex flex-wrap gap-4 my-4">
                <div className="px-6 py-4 h-fit rounded-lg gap-4 bg-white flex-1 w-full lg:w-[40%]">
                    <h1 className="text-2xl font-bold mb-6 text-gray-400">
                        Monthly Sales
                    </h1>

                    <LineChart />
                </div>

                <div className="px-6 py-4 rounded-lg gap-4 bg-white w-full lg:w-[60%]">
                    <h1 className="text-2xl font-bold mb-6 text-gray-400">
                        Top Products
                    </h1>

                    {products.length === 0 && (
                        <div className="w-full m-auto mt-20 flex flex-col items-center justify-center">
                            <h1 className="text-2xl font-bold mb-6 text-black">
                                No Products
                            </h1>
                            <Link href="/products/create">
                                <button className="btn btn-sm btn-ghost text-black flex items-center bg-green-400 w-full">
                                    <PlusCircle className="w-4 h-4" />
                                    Add Product
                                </button>
                            </Link>
                        </div>
                    )}

                    {products.map((product, index) => (
                        <TopProducts
                            key={index}
                            product={product}
                            quantity={0}
                        />
                    ))}
                </div>
            </div>

            <InvoicesTable
                title="Recent Invoices"
                invoices={invoices}
                handleDelete={() => {}}
            />
        </Navbar>
    );
}

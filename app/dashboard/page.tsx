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
import { useDispatch, useSelector } from "react-redux";
import { AppState } from "@/store";
import { setProducts } from "@/store/slices/productSlice";

interface InvoiceStats {
    totalInvoices: number;
    totalRevenue: number;
    paidInvoices: number;
    profit: number;
    percentageChanges: {
        totalInvoices: number;
        totalRevenue: number;
        paidInvoices: number;
        profit: number;
    };
}

export default function Page() {
    const [products, setLocalProducts] = useState<Product[]>([]);
    const [invoices, setInvoices] = React.useState([]);
    const [invoiceStats, setInvoiceStats] = useState<InvoiceStats>({
        totalInvoices: 0,
        totalRevenue: 0,
        paidInvoices: 0,
        profit: 0,
        percentageChanges: {
            totalInvoices: 0,
            totalRevenue: 0,
            paidInvoices: 0,
            profit: 0,
        },
    });
    const dispatch = useDispatch();
    const productsData = useSelector(
        (state: AppState) => state.product.products
    );
    const [timePeriod, setTimePeriod] = useState<number>(7); // in days

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                const response = await axios.get("/api/invoice");
                const allInvoices = response.data;

                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);

                // Today's stats
                const todayInvoices = allInvoices.filter((inv: any) => {
                    const invDate = new Date(inv.createdAt);
                    invDate.setHours(0, 0, 0, 0);
                    return invDate.getTime() === today.getTime();
                });

                // Yesterday's stats
                const yesterdayInvoices = allInvoices.filter((inv: any) => {
                    const invDate = new Date(inv.createdAt);
                    invDate.setHours(0, 0, 0, 0);
                    return invDate.getTime() === yesterday.getTime();
                });

                // Calculate today's metrics
                const totalInvoices = allInvoices.length;
                const paidInvoices = allInvoices.filter(
                    (inv: any) => inv.status === "PAID"
                ).length;

                // TODO: Fix total revenue calculation to include only PAID invoices
                const totalRevenue = allInvoices
                    .filter((inv: any) => inv.status === "PENDING")
                    .reduce(
                        (sum: number, inv: any) => sum + inv.totalAmount,
                        0
                    );

                // Assuming profit is 30% of total revenue
                const profit = totalRevenue * 0.3;

                // Calculate yesterday's metrics
                const yesterdayTotalInvoices = yesterdayInvoices.length;
                const yesterdayPaidInvoices = yesterdayInvoices.filter(
                    (inv: any) => inv.status === "PAID"
                ).length;
                const yesterdayTotalRevenue = yesterdayInvoices
                    .filter((inv: any) => inv.status === "PAID")
                    .reduce(
                        (sum: number, inv: any) => sum + inv.totalAmount,
                        0
                    );
                const yesterdayProfit = yesterdayTotalRevenue * 0.3;

                // Calculate percentage changes
                const calculatePercentageChange = (
                    current: number,
                    previous: number
                ) => {
                    if (previous === 0) return current > 0 ? 100 : 0;
                    return ((current - previous) / previous) * 100;
                };

                setInvoiceStats({
                    totalInvoices,
                    totalRevenue,
                    paidInvoices,
                    profit,
                    percentageChanges: {
                        totalInvoices: calculatePercentageChange(
                            totalInvoices,
                            yesterdayTotalInvoices
                        ),
                        totalRevenue: calculatePercentageChange(
                            totalRevenue,
                            yesterdayTotalRevenue
                        ),
                        paidInvoices: calculatePercentageChange(
                            paidInvoices,
                            yesterdayPaidInvoices
                        ),
                        profit: calculatePercentageChange(
                            profit,
                            yesterdayProfit
                        ),
                    },
                });

                setInvoices(allInvoices.slice(0, 5));
            } catch (error) {
                setInvoices([]);
            }
        };

        fetchInvoices();
    }, []);

    useEffect(() => {
        // Immediately use products from Redux store if available
        if (productsData.length > 0) {
            setLocalProducts(productsData.slice(0, 5));
        }

        // Always fetch fresh data in the background
        const fetchProducts = async () => {
            try {
                const response = await axios.get("/api/product");
                const freshProducts = response.data;

                // Ensure freshProducts is an array
                const productsArray = Array.isArray(freshProducts)
                    ? freshProducts
                    : [];

                // Update Redux store with fresh data
                dispatch(setProducts(productsArray));

                // Update local state with limited products for display
                setLocalProducts(productsArray.slice(0, 5));
            } catch (error) {
                console.error("Error fetching products:", error);
                setLocalProducts([]); // Set empty array on error
            }
        };

        // Fetch fresh data in the background
        if (productsData.length === 0) {
            fetchProducts();
        }
    }, [dispatch, productsData]);

    const infoCards = [
        {
            title: "Total Invoices",
            number: invoiceStats.totalInvoices,
            icon: ReceiptText,
            percentageChange: invoiceStats.percentageChanges.totalInvoices,
        },
        {
            title: "Total Revenue",
            number: `$${invoiceStats.totalRevenue.toFixed(2)}`,
            icon: BadgeDollarSign,
            percentageChange: invoiceStats.percentageChanges.totalRevenue,
        },
        {
            title: "Paid Invoices",
            number: invoiceStats.paidInvoices,
            icon: ReceiptText,
            percentageChange: invoiceStats.percentageChanges.paidInvoices,
        },
        {
            title: "Profit",
            number: `$${invoiceStats.profit.toFixed(2)}`,
            icon: BadgeDollarSign,
            percentageChange: invoiceStats.percentageChanges.profit,
        },
    ];

    return (
        <Navbar>
            {/* Info Cards */}
            <div className="flex flex-wrap overflow-hidden w-full justify-between gap-4 my-4">
                {infoCards.map((card, index) => (
                    <InfoCard
                        key={index}
                        title={card.title}
                        number={card.number}
                        icon={card.icon}
                        percentageChange={card.percentageChange}
                    />
                ))}
            </div>

            <div className="flex flex-wrap lg:flex-nowrap gap-4 my-4">
                <div className="px-6 py-4 h-fit rounded-lg gap-4 bg-white flex-1 w-full md:w-[40%]">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold text-gray-400">
                            Monthly Sales
                        </h1>
                        <select
                            className="select select-sm outline-none bg-slate-50 appearance-none border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 disabled:opacity-50 text-green-500"
                            value={timePeriod}
                            onChange={(e) =>
                                setTimePeriod(Number(e.target.value))
                            }
                        >
                            <option value="7">Last 7 days</option>
                            <option value="30">Last 30 days</option>
                            <option value="90">Last 90 days</option>
                            <option value="365">Last 1 year</option>
                        </select>
                    </div>

                    <LineChart timePeriod={timePeriod} />
                </div>

                <div className="px-6 py-4 rounded-lg gap-4 bg-white w-full lg:w-[48%]">
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
                        <TopProducts key={index} product={product} />
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

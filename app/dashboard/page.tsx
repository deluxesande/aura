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
import TopProductsChart from "@/components/TopProductsChart";

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

interface TopProduct {
    id: string;
    name: string;
    soldQuantity?: number;
    totalRevenue?: number;
    quantity?: number;
    price: number;
    period?: string;
    products?: TopProduct[];
}

export default function Page() {
    const [products, setLocalProducts] = useState<TopProduct[]>([]);
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
    const [topProductsTimePeriod, setTopProductsTimePeriod] =
        useState<number>(7); // in days
    const [topProductsLoading, setTopProductsLoading] = useState<boolean>(true);
    const [invoicesLoading, setInvoicesLoading] = useState<boolean>(true);

    useEffect(() => {
        setInvoicesLoading(true);
        const fetchInvoices = async () => {
            try {
                const response = await axios.get("/api/invoice");
                const allInvoices = response.data;

                const now = new Date();
                const today = new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    now.getDate()
                );
                const yesterday = new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    now.getDate() - 1
                );

                // Today's stats
                const todayInvoices = allInvoices.filter((inv: any) => {
                    const invDate = new Date(inv.createdAt);
                    const invDateOnly = new Date(
                        invDate.getFullYear(),
                        invDate.getMonth(),
                        invDate.getDate()
                    );
                    return invDateOnly.getTime() === today.getTime();
                });

                // Yesterday's stats
                const yesterdayInvoices = allInvoices.filter((inv: any) => {
                    const invDate = new Date(inv.createdAt);
                    const invDateOnly = new Date(
                        invDate.getFullYear(),
                        invDate.getMonth(),
                        invDate.getDate()
                    );
                    return invDateOnly.getTime() === yesterday.getTime();
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

                // Store all invoices instead of slicing
                setInvoices(allInvoices);
            } catch (error) {
                setInvoices([]);
            } finally {
                setInvoicesLoading(false);
            }
        };

        fetchInvoices();
    }, []);

    useEffect(() => {
        setTopProductsLoading(true);

        const fetchTopProducts = async () => {
            try {
                const response = await axios.get("/api/product/topProduct", {
                    params: {
                        timePeriod: topProductsTimePeriod,
                    },
                });

                const topProducts = response.data;
                setLocalProducts(Array.isArray(topProducts) ? topProducts : []);
            } catch (error) {
                setLocalProducts([]);
            } finally {
                setTopProductsLoading(false);
            }
        };

        fetchTopProducts();
    }, [topProductsTimePeriod]);

    const infoCards = [
        {
            title: "Total Invoices",
            number: invoiceStats.totalInvoices,
            icon: ReceiptText,
            percentageChange: invoiceStats.percentageChanges.totalInvoices,
        },
        {
            title: "Total Revenue",
            number: `Ksh ${invoiceStats.totalRevenue.toFixed(2)}`,
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
            number: `Ksh ${invoiceStats.profit.toFixed(2)}`,
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
                            className="select select-sm outline-none bg-green-50 appearance-none  rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 disabled:opacity-50 text-green-500"
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

                <div className="px-6 py-4 rounded-lg gap-4 bg-white w-full lg:w-[48%] relative">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold text-gray-400">
                            Top Products
                        </h1>
                        <select
                            className="select select-sm outline-none bg-green-50 appearance-none  rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 disabled:opacity-50 text-green-500"
                            value={topProductsTimePeriod}
                            onChange={(e) =>
                                setTopProductsTimePeriod(Number(e.target.value))
                            }
                        >
                            <option value="7">Last 7 days</option>
                            <option value="30">Last 30 days</option>
                            <option value="90">Last 90 days</option>
                            <option value="365">Last 1 year</option>
                        </select>
                    </div>

                    {topProductsLoading ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                        </div>
                    ) : (
                        <TopProductsChart
                            products={products}
                            timePeriod={topProductsTimePeriod}
                        />
                    )}
                </div>
            </div>

            <InvoicesTable
                title="Recent Invoices"
                invoices={invoices}
                handleDelete={() => {}}
                loading={invoicesLoading}
                itemsPerPage={5}
            />
        </Navbar>
    );
}

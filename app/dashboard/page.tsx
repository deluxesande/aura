"use client";
import InfoCard from "@/components/InfoCard";
import InvoicesTable from "@/components/InvoicesTable";
import LineChart from "@/components/LineChart";
import TopProductsChart from "@/components/TopProductsChart";
import { AppState } from "@/store";
import Navbar from "@components/Navbar";
import axios from "axios";
import {
    BadgeDollarSign,
    ReceiptText,
    Smartphone,
    AlertCircle,
    CheckCircle2,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";

interface DashboardData {
    stats: {
        totalInvoices: number;
        totalRevenue: number;
        paidInvoices: number;
        profit: number;
    };
    percentageChanges: {
        totalInvoices: number;
        totalRevenue: number;
        paidInvoices: number;
        profit: number;
    };
    mpesaBalance: number;
}

interface TopProduct {
    id: string;
    name: string;
    soldQuantity?: number;
    totalRevenue?: number;
    quantity?: number;
    price: number;
}

export default function Page() {
    // Get User Role
    const user = useSelector((state: AppState) => state.auth.user);
    const userRole = user?.role || "user";
    const isAdminOrManager = userRole === "admin" || userRole === "manager";

    const [dashboardData, setDashboardData] = useState<DashboardData | null>(
        null
    );
    const [products, setLocalProducts] = useState<TopProduct[]>([]);
    const [invoices, setInvoices] = useState([]);

    // Filters
    const [timePeriod, setTimePeriod] = useState<number>(7);
    const [topProductsTimePeriod, setTopProductsTimePeriod] =
        useState<number>(7);
    const [topProductsLoading, setTopProductsLoading] = useState<boolean>(true);
    const [invoicesLoading, setInvoicesLoading] = useState<boolean>(true);

    // 1. Fetch Stats
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get("/api/analytics/stats");
                setDashboardData(response.data);
            } catch (error) {
                console.error("Failed to fetch stats");
            }
        };
        fetchStats();
    }, []);

    // 2. Fetch Invoices
    useEffect(() => {
        setInvoicesLoading(true);
        const fetchInvoices = async () => {
            try {
                const response = await axios.get("/api/invoice");
                setInvoices(response.data);
            } catch (error) {
                setInvoices([]);
            } finally {
                setInvoicesLoading(false);
            }
        };
        fetchInvoices();
    }, []);

    // 3. Fetch Top Products
    useEffect(() => {
        setTopProductsLoading(true);
        const fetchTopProducts = async () => {
            try {
                const response = await axios.get("/api/product/topProduct", {
                    params: { timePeriod: topProductsTimePeriod },
                });
                setLocalProducts(
                    Array.isArray(response.data) ? response.data : []
                );
            } catch (error) {
                setLocalProducts([]);
            } finally {
                setTopProductsLoading(false);
            }
        };
        fetchTopProducts();
    }, [topProductsTimePeriod]);

    const handleWithdrawal = () => {
        toast.info("Withdrawal Initiated (Feature Coming Soon)");
    };

    const infoCards = [
        {
            title: "Total Invoices",
            number: dashboardData?.stats.totalInvoices || 0,
            icon: ReceiptText,
            percentageChange: dashboardData?.percentageChanges.totalInvoices,
        },
        {
            title: "Total Revenue",
            number: `Ksh ${(
                dashboardData?.stats.totalRevenue || 0
            ).toLocaleString()}`,
            icon: BadgeDollarSign,
            percentageChange: dashboardData?.percentageChanges.totalRevenue,
        },
        {
            title: "Paid Invoices",
            number: dashboardData?.stats.paidInvoices || 0,
            icon: ReceiptText,
            percentageChange: dashboardData?.percentageChanges.paidInvoices,
        },
        {
            title: "Profit",
            number: `Ksh ${(
                dashboardData?.stats.profit || 0
            ).toLocaleString()}`,
            icon: BadgeDollarSign,
            percentageChange: dashboardData?.percentageChanges.profit,
        },
    ];

    return (
        <Navbar>
            <div
                className={`grid gap-4 my-4 ${
                    isAdminOrManager
                        ? "grid-cols-1 lg:grid-cols-3" // Admin Layout
                        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" // User Layout
                }`}
            >
                <div
                    className={`grid gap-4 ${
                        isAdminOrManager
                            ? "lg:col-span-2 grid-cols-1 sm:grid-cols-2" // 2x2 Grid for Admin
                            : "contents" // Flattens the grid for users so they flow naturally
                    }`}
                >
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

                {isAdminOrManager && dashboardData && (
                    <div className="lg:col-span-1 h-full">
                        <div className="bg-white rounded-lg p-6 h-full flex flex-col justify-between shadow-sm border border-transparent hover:shadow-md transition-all duration-200">
                            {/* Header Section */}
                            <div>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="font-light text-lg text-gray-400">
                                            M-Pesa Balance
                                        </p>
                                        <p className="font-bold text-3xl text-black mt-2">
                                            Ksh{" "}
                                            {(
                                                dashboardData.mpesaBalance || 0
                                            ).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="p-2 bg-green-50 rounded-full">
                                        <Smartphone
                                            size={32}
                                            className="stroke-green-600"
                                        />
                                    </div>
                                </div>

                                {/* Contextual Info */}
                                <div className="mt-6 space-y-3">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle2
                                            size={18}
                                            className="stroke-green-500 mt-0.5 shrink-0"
                                        />
                                        <p className="text-sm text-gray-500">
                                            Funds are available for immediate
                                            withdrawal to the registered
                                            business number.
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <AlertCircle
                                            size={18}
                                            className="stroke-orange-400 mt-0.5 shrink-0"
                                        />
                                        <p className="text-sm text-gray-500">
                                            Standard M-Pesa transaction fees
                                            apply. Max limit: Ksh 150,000 per
                                            transaction.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Action Button */}
                            <button
                                onClick={handleWithdrawal}
                                className="w-full mt-6 bg-green-500 text-white py-3 rounded-md font-semibold hover:bg-green-300 transition-colors flex items-center justify-center gap-2"
                            >
                                Withdraw Funds
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Charts Section */}
            <div className="flex flex-wrap lg:flex-nowrap gap-4 my-4">
                <div className="px-6 py-4 h-fit rounded-lg gap-4 bg-white flex-1 w-full md:w-[40%]">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold text-gray-400">
                            Monthly Sales
                        </h1>
                        <select
                            className="select select-sm outline-none bg-green-50 appearance-none rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 disabled:opacity-50 text-green-500"
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
                            className="select select-sm outline-none bg-green-50 appearance-none rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 disabled:opacity-50 text-green-500"
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

"use client";

import InfoCard from "@/components/InfoCard";
import InvoicesTable from "@/components/InvoicesTable";
import LineChart from "@/components/LineChart";
import TopProductsChart from "@/components/TopProductsChart";
import { AppState } from "@/store";
import Navbar from "@/components/Navbar";
import axios from "axios";
import {
    BadgeDollarSign,
    ReceiptText,
    Smartphone,
    AlertCircle,
    CheckCircle2,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
    startFetching,
    setAnalyticsData,
    setAnalyticsError,
    setTimeRange,
} from "@/store/slices/analyticsSlice";
import { setInvoices } from "@/store/slices/invoiceSlice";
import { toast } from "sonner";

interface TopProduct {
    id: string;
    name: string;
    soldQuantity?: number;
    totalRevenue?: number;
    quantity?: number;
    price: number;
}

export default function Page() {
    const dispatch = useDispatch();

    const { user } = useSelector((state: AppState) => state.auth);
    const invoices = useSelector((state: AppState) => state.invoice.invoices);
    const {
        data: analyticsData,
        loading: analyticsLoading,
        timeRange,
    } = useSelector((state: AppState) => state.analytics);

    const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
    const [topProductsTimePeriod, setTopProductsTimePeriod] =
        useState<number>(7);
    const [topProductsLoading, setTopProductsLoading] = useState<boolean>(true);
    const [invoicesLoading, setInvoicesLoading] = useState<boolean>(
        invoices.length === 0,
    );

    const userRole = user?.role || "user";
    const isAdminOrManager = userRole === "admin" || userRole === "manager";

    useEffect(() => {
        const fetchStats = async () => {
            dispatch(startFetching());

            try {
                const response = await axios.get("/api/analytics/stats", {
                    params: { timePeriod: timeRange },
                });

                dispatch(setAnalyticsData(response.data));
            } catch (error) {
                console.error("Failed to fetch stats");
                dispatch(setAnalyticsError("Failed to fetch dashboard stats"));
            }
        };

        fetchStats();
    }, [dispatch, timeRange]);

    useEffect(() => {
        const fetchInvoices = async () => {
            if (invoices.length === 0) setInvoicesLoading(true);

            try {
                const response = await axios.get("/api/invoice");
                dispatch(setInvoices(response.data));
            } catch (error) {
                // Handle error
            } finally {
                setInvoicesLoading(false);
            }
        };

        fetchInvoices();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch]);

    useEffect(() => {
        setTopProductsLoading(true);
        const fetchTopProducts = async () => {
            try {
                const response = await axios.get("/api/product/topProduct", {
                    params: { timePeriod: topProductsTimePeriod },
                });
                setTopProducts(
                    Array.isArray(response.data) ? response.data : [],
                );
            } catch (error) {
                setTopProducts([]);
            } finally {
                setTopProductsLoading(false);
            }
        };
        fetchTopProducts();
    }, [topProductsTimePeriod]);

    const handleWithdrawal = () => {
        toast.info("Withdrawal Initiated (Feature Coming Soon)");
    };

    const handleTimeRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        dispatch(setTimeRange(e.target.value));
    };

    const stats = analyticsData?.stats;
    const percentageChanges = analyticsData?.percentageChanges;

    const infoCards = [
        {
            title: "Total Invoices",
            number: stats?.totalInvoices || 0,
            icon: ReceiptText,
            percentageChange: percentageChanges?.totalInvoices || 0,
        },
        {
            title: "Total Revenue",
            number: `Ksh ${(stats?.totalRevenue || 0).toLocaleString()}`,
            icon: BadgeDollarSign,
            percentageChange: percentageChanges?.totalRevenue || 0,
        },
        {
            title: "Paid Invoices",
            number: stats?.paidInvoices || 0,
            icon: ReceiptText,
            percentageChange: percentageChanges?.paidInvoices || 0,
        },
        {
            title: "Profit",
            number: `Ksh ${(stats?.profit || 0).toLocaleString()}`,
            icon: BadgeDollarSign,
            percentageChange: percentageChanges?.profit || 0,
        },
    ];

    return (
        <Navbar>
            <div
                className={`grid gap-4 my-4 ${
                    isAdminOrManager
                        ? "grid-cols-1 lg:grid-cols-3"
                        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
                }`}
            >
                <div
                    className={`grid gap-4 ${
                        isAdminOrManager
                            ? "lg:col-span-2 grid-cols-1 sm:grid-cols-2"
                            : "contents"
                    }`}
                >
                    {infoCards.map((card, index) => (
                        <InfoCard
                            key={index}
                            title={card.title}
                            number={card.number}
                            icon={card.icon}
                            percentageChange={card.percentageChange}
                            // You can pass a loading prop to InfoCard if you want skeleton loaders
                            // loading={analyticsLoading}
                        />
                    ))}
                </div>

                {isAdminOrManager && (
                    <div className="lg:col-span-1 h-full">
                        <div className="bg-white rounded-lg p-6 h-full flex flex-col justify-between shadow-sm border border-transparent hover:shadow-md transition-all duration-200">
                            <div>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="font-light text-lg text-gray-400">
                                            Total M-Pesa Collections
                                        </p>
                                        <p className="font-bold text-3xl text-black mt-2">
                                            Ksh{" "}
                                            {(
                                                analyticsData?.mpesaBalance || 0
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

                                <div className="mt-6 space-y-3">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle2
                                            size={18}
                                            className="stroke-green-500 mt-0.5 shrink-0"
                                        />
                                        <p className="text-sm text-gray-500">
                                            Total value of transactions
                                            processed successfully through the
                                            software.
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <AlertCircle
                                            size={18}
                                            className="stroke-orange-400 mt-0.5 shrink-0"
                                        />
                                        <p className="text-sm text-gray-500">
                                            Funds are settled directly to your
                                            Paybill/Till number by Safaricom in
                                            real-time.
                                        </p>
                                    </div>
                                </div>
                            </div>
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
                            value={timeRange}
                            onChange={handleTimeRangeChange}
                        >
                            <option value="7">Last 7 days</option>
                            <option value="30">Last 30 days</option>
                            <option value="90">Last 90 days</option>
                            <option value="365">Last 1 year</option>
                        </select>
                    </div>
                    <LineChart timePeriod={Number(timeRange)} />
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
                        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                        </div>
                    ) : (
                        <TopProductsChart
                            products={topProducts}
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

import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Filler,
} from "chart.js";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Filler
);

interface Invoice {
    id: string;
    createdAt: string;
    totalAmount: number;
    status: string;
}

interface LineChartProps {
    timePeriod?: number; // 7, 30, or 90 days
}

const LineChart: React.FC<LineChartProps> = ({ timePeriod = 7 }) => {
    const [chartData, setChartData] = useState<{
        labels: string[];
        data: number[];
    }>({
        labels: [],
        data: [],
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const fetchInvoices = async () => {
            try {
                const response = await fetch("/api/invoice");
                const invoices: Invoice[] = await response.json();

                // Filter only PAID invoices
                const paidInvoices = invoices.filter(
                    (inv) => inv.status === "PENDING"
                );

                // Filter by time period
                const now = new Date();
                const startDate = new Date();
                startDate.setDate(now.getDate() - timePeriod);

                const filteredInvoices = paidInvoices.filter((invoice) => {
                    const invoiceDate = new Date(invoice.createdAt);
                    return invoiceDate >= startDate && invoiceDate <= now;
                });

                let labels: string[] = [];
                let revenueData: number[] = [];

                if (timePeriod === 7) {
                    // Group by day for 7 days
                    const dailyRevenue = new Array(7).fill(0);
                    const dayLabels: string[] = [];

                    for (let i = 6; i >= 0; i--) {
                        const date = new Date();
                        date.setDate(date.getDate() - i);
                        dayLabels.push(
                            date.toLocaleDateString("en-US", {
                                weekday: "short",
                            })
                        );
                    }

                    filteredInvoices.forEach((invoice) => {
                        const invoiceDate = new Date(invoice.createdAt);
                        const daysDiff = Math.floor(
                            (now.getTime() - invoiceDate.getTime()) /
                                (1000 * 60 * 60 * 24)
                        );
                        const index = 6 - daysDiff;
                        if (index >= 0 && index < 7) {
                            dailyRevenue[index] += invoice.totalAmount;
                        }
                    });

                    labels = dayLabels;
                    revenueData = dailyRevenue.map((amount) =>
                        Math.round(amount / 1000)
                    );
                } else if (timePeriod === 30) {
                    // Group by week for 30 days
                    const weeklyRevenue = new Array(4).fill(0);
                    const weekLabels: string[] = [];

                    // Generate actual date ranges for each week
                    for (let i = 3; i >= 0; i--) {
                        const weekEnd = new Date();
                        weekEnd.setDate(weekEnd.getDate() - i * 7);
                        const weekStart = new Date(weekEnd);
                        weekStart.setDate(weekStart.getDate() - 6);

                        weekLabels.push(
                            `${weekStart.toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                            })} - ${weekEnd.toLocaleDateString("en-US", {
                                day: "numeric",
                            })}`
                        );
                    }

                    filteredInvoices.forEach((invoice) => {
                        const invoiceDate = new Date(invoice.createdAt);
                        const daysDiff = Math.floor(
                            (now.getTime() - invoiceDate.getTime()) /
                                (1000 * 60 * 60 * 24)
                        );
                        const weekIndex = Math.floor(daysDiff / 7);
                        const index = 3 - weekIndex;
                        if (index >= 0 && index < 4) {
                            weeklyRevenue[index] += invoice.totalAmount;
                        }
                    });

                    labels = weekLabels;
                    revenueData = weeklyRevenue.map((amount) =>
                        Math.round(amount / 1000)
                    );
                } else if (timePeriod === 90) {
                    // Group by month for 90 days
                    const monthlyRevenue = new Array(3).fill(0);
                    const monthLabels: string[] = [];

                    for (let i = 2; i >= 0; i--) {
                        const date = new Date();
                        date.setMonth(date.getMonth() - i);
                        monthLabels.push(
                            date.toLocaleDateString("en-US", { month: "short" })
                        );
                    }

                    filteredInvoices.forEach((invoice) => {
                        const invoiceDate = new Date(invoice.createdAt);
                        const monthsDiff =
                            (now.getFullYear() - invoiceDate.getFullYear()) *
                                12 +
                            now.getMonth() -
                            invoiceDate.getMonth();
                        const index = 2 - monthsDiff;
                        if (index >= 0 && index < 3) {
                            monthlyRevenue[index] += invoice.totalAmount;
                        }
                    });

                    labels = monthLabels;
                    revenueData = monthlyRevenue.map((amount) =>
                        Math.round(amount / 1000)
                    );
                } else if (timePeriod === 365) {
                    // Group by month for 1 year
                    const monthlyRevenue = new Array(12).fill(0);
                    const monthLabels: string[] = [];

                    for (let i = 11; i >= 0; i--) {
                        const date = new Date();
                        date.setMonth(date.getMonth() - i);
                        monthLabels.push(
                            date.toLocaleDateString("en-US", { month: "short" })
                        );
                    }

                    filteredInvoices.forEach((invoice) => {
                        const invoiceDate = new Date(invoice.createdAt);
                        const monthsDiff =
                            (now.getFullYear() - invoiceDate.getFullYear()) *
                                12 +
                            now.getMonth() -
                            invoiceDate.getMonth();
                        const index = 11 - monthsDiff;
                        if (index >= 0 && index < 12) {
                            monthlyRevenue[index] += invoice.totalAmount;
                        }
                    });

                    labels = monthLabels;
                    revenueData = monthlyRevenue.map((amount) =>
                        Math.round(amount / 1000)
                    );
                }

                setChartData({
                    labels,
                    data: revenueData,
                });
                setLoading(false);
            } catch (error) {
                setLoading(false);
            }
        };

        fetchInvoices();
    }, [timePeriod]);

    const emptyData = {
        labels: [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
        ],
        datasets: [
            {
                label: "Revenue",
                data: [],
                fill: true,
                backgroundColor: "rgba(34, 197, 94, 0.05)",
                borderColor: "#22c55e",
                borderWidth: 2,
                tension: 0.4,
                pointRadius: 0,
            },
        ],
    };

    const data = {
        labels: chartData.labels,
        datasets: [
            {
                label: "Revenue",
                data: chartData.data,
                fill: true,
                backgroundColor: (context: any) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                    gradient.addColorStop(0, "rgba(34, 197, 94, 0.1)");
                    gradient.addColorStop(1, "rgba(34, 197, 94, 0)");
                    return gradient;
                },
                borderColor: "#22c55e",
                borderWidth: 2,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: "#22c55e",
                pointHoverBorderColor: "#fff",
                pointHoverBorderWidth: 2,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: false,
            },
            tooltip: {
                enabled: true,
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                titleColor: "#fff",
                bodyColor: "#fff",
                padding: 12,
                cornerRadius: 8,
                displayColors: false,
                callbacks: {
                    label: function (context: any) {
                        return `${context.dataset.label}: $${context.parsed.y}k`;
                    },
                },
            },
        },
        interaction: {
            intersect: false,
            mode: "index" as const,
        },
        scales: {
            x: {
                grid: {
                    display: false,
                    drawBorder: false,
                },
                border: {
                    display: false,
                },
                ticks: {
                    display: true,
                    color: "#94a3b8",
                    font: {
                        size: 11,
                        weight: 500,
                    },
                    padding: 10,
                },
            },
            y: {
                beginAtZero: true,
                grid: {
                    display: true,
                    color: "rgba(148, 163, 184, 0.1)",
                    drawBorder: false,
                },
                ticks: {
                    stepSize: 10,
                    color: "#94a3b8",
                    font: {
                        size: 11,
                        weight: 500,
                    },
                    padding: 10,
                    callback: function (value: any) {
                        return "$" + value + "k";
                    },
                },
                border: {
                    display: false,
                },
            },
        },
    };

    return (
        <div style={{ height: "300px", width: "100%", position: "relative" }}>
            <Line data={loading ? emptyData : data} options={options} />
            {loading && (
                <div
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "rgba(255, 255, 255, 0.8)",
                    }}
                >
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                </div>
            )}
        </div>
    );
};

export default LineChart;

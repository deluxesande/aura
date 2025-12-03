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

const LineChart = () => {
    const [chartData, setChartData] = useState<{
        labels: string[];
        data: number[];
    }>({
        labels: [],
        data: [],
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                const response = await fetch("/api/invoice");
                const invoices: Invoice[] = await response.json();

                // Filter only PAID invoices
                const paidInvoices = invoices.filter(
                    // TODO: change status to paid
                    (inv) => inv.status === "PENDING"
                );

                // Group by month
                const monthlyRevenue = new Array(12).fill(0);
                const monthNames = [
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
                ];

                paidInvoices.forEach((invoice) => {
                    const date = new Date(invoice.createdAt);
                    const month = date.getMonth();
                    monthlyRevenue[month] += invoice.totalAmount;
                });

                // Convert to thousands
                const revenueInK = monthlyRevenue.map((amount) =>
                    Math.round(amount / 1000)
                );

                setChartData({
                    labels: monthNames,
                    data: revenueInK,
                });
                setLoading(false);
            } catch (error) {
                // console.error("Failed to fetch invoices:", error);
                setLoading(false);
            }
        };

        fetchInvoices();
    }, []);

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

    if (loading) {
        return (
            <div style={{ height: "300px", width: "100%" }}>
                <Line
                    data={{
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
                            },
                        ],
                    }}
                    options={options}
                />
            </div>
        );
    }

    return (
        <div style={{ height: "300px", width: "100%" }}>
            <Line data={data} options={options} />
        </div>
    );
};

export default LineChart;

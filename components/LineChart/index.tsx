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

interface AnalyticsData {
    labels: string[];
    data: number[];
}

interface LineChartProps {
    timePeriod?: number; // 7, 30, or 90 days
}

const LineChart: React.FC<LineChartProps> = ({ timePeriod = 7 }) => {
    const [chartData, setChartData] = useState<AnalyticsData>({
        labels: [],
        data: [],
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const fetchAnalytics = async () => {
            try {
                const response = await fetch(
                    `/api/invoice/analytics?timePeriod=${timePeriod}`
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch analytics");
                }

                const data: AnalyticsData = await response.json();
                setChartData(data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching analytics:", error);
                setLoading(false);
            }
        };

        fetchAnalytics();
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
                    display: false,
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
                <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                </div>
            )}
        </div>
    );
};

export default LineChart;

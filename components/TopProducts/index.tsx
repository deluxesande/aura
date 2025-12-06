import React from "react";
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface TopProduct {
    id: string;
    name: string;
    soldQuantity?: number;
    totalRevenue?: number;
    quantity?: number;
    price: number;
}

interface TopProductsProps {
    products: TopProduct[];
    loading?: boolean;
}

export default function TopProducts({ products }: TopProductsProps) {
    // Prepare chart data
    const chartData = {
        labels: products.map((p) => p.name),
        quantities: products.map((p) => p.soldQuantity || p.quantity || 0),
        revenues: products.map(
            (p) =>
                p.totalRevenue || p.price * (p.soldQuantity || p.quantity || 0)
        ),
    };

    const data = {
        labels: chartData.labels,
        datasets: [
            {
                label: "Quantity Sold",
                data: chartData.quantities,
                backgroundColor: "rgba(34, 197, 94, 0.8)",
                borderColor: "transparent",
                borderWidth: 0,
                borderRadius: 6,
                barPercentage: 0.95,
                categoryPercentage: 1.0,
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
                        const revenue = chartData.revenues[context.dataIndex];
                        return [
                            `Quantity: ${context.parsed.y}`,
                            `Revenue: $${revenue.toFixed(2)}`,
                        ];
                    },
                },
            },
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
                    color: "#94a3b8",
                    font: {
                        size: 11,
                        weight: 500,
                    },
                    padding: 10,
                    callback: function (value: any, index: number) {
                        const label = chartData.labels[index];
                        return label.length > 10
                            ? label.substring(0, 10) + "..."
                            : label;
                    },
                },
            },
            y: {
                display: false,
                beginAtZero: true,
            },
        },
    };

    return (
        <div style={{ height: "300px", width: "100%", position: "relative" }}>
            {<Bar data={data} options={options} />}
        </div>
    );
}

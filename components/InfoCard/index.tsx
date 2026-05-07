import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
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

interface InfoCardProps {
    title: string;
    number: string | number;
    icon?: any;
    percentageChange?: number;
    actionLabel?: string;
    onAction?: () => void;
    isActionVisible?: boolean;
    chartData?: number[];
    showChart?: boolean;
}

export default function InfoCard({
    title,
    number,
    icon: Icon,
    percentageChange = 0,
    actionLabel,
    onAction,
    isActionVisible = false,
    chartData = [],
    showChart = false,
}: InfoCardProps) {
    const isNegativeValue = typeof number === "string" ? number.includes("-") : Number(number) < 0;
    const isTrendingUp = percentageChange >= 0;
    const isNegative = isNegativeValue || !isTrendingUp;

    const data = {
        labels: chartData.map((_, i) => i),
        datasets: [
            {
                data: chartData,
                fill: "start",
                backgroundColor: (context: any) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 50);
                    gradient.addColorStop(0, !isNegative ? "rgba(34, 197, 94, 0.2)" : "rgba(239, 68, 68, 0.2)");
                    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
                    return gradient;
                },
                borderColor: !isNegative ? "#22c55e" : "#ef4444",
                borderWidth: 2,
                tension: 0.4,
                pointRadius: 0,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: { enabled: false },
        },
        scales: {
            x: { display: false },
            y: { display: false },
        },
    };

    return (
        <div className="px-6 py-4 flex-grow rounded-lg gap-2 lg:gap-4 bg-white shadow-sm border border-transparent hover:shadow-md transition-all h-full flex flex-col justify-between">
            <div className="flex items-start justify-between">
                <div>
                    <p className="font-light text-lg text-gray-400">{title}</p>
                    <p className={`font-bold text-2xl mt-1 ${isNegativeValue ? "text-red-600" : "text-black"}`}>
                        {number}
                    </p>
                </div>
                {Icon && !showChart && (
                    <div className={`mt-1 p-3 rounded-full ${isNegative ? "bg-red-50" : "bg-green-50"}`}>
                        <Icon size={24} className={isNegative ? "stroke-red-500" : "stroke-green-500"} />
                    </div>
                )}
            </div>

            <div className="flex flex-col mt-4 gap-2">
                {showChart && chartData.length > 0 && (
                    <div className="w-full h-12">
                        <Line data={data} options={options} />
                    </div>
                )}
                
                <p className="flex items-center whitespace-nowrap text-sm">
                    {isTrendingUp ? (
                        <TrendingUp color="#22c55e" className="w-4 h-4 mr-1" />
                    ) : (
                        <TrendingDown color="#ef4444" className="w-4 h-4 mr-1" />
                    )}
                    <span
                        className={
                            isTrendingUp
                                ? "text-green-500 font-bold mr-1"
                                : "text-red-500 font-bold mr-1"
                        }
                    >
                        {isTrendingUp ? "+" : ""}
                        {percentageChange.toFixed(2)}%
                    </span>
                    <span className="text-gray-400">vs yesterday</span>
                </p>
            </div>
        </div>
    );
}

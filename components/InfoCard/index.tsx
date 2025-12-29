import React from "react";
import { TrendingUp, TrendingDown, CreditCard } from "lucide-react";

interface InfoCardProps {
    title: string;
    number: string | number;
    icon: any;
    percentageChange?: number;
    actionLabel?: string;
    onAction?: () => void;
    isActionVisible?: boolean;
}

export default function InfoCard({
    title,
    number,
    icon: Icon,
    percentageChange = 0,
    actionLabel,
    onAction,
    isActionVisible = false,
}: InfoCardProps) {
    const isTrendingUp = percentageChange >= 0;

    return (
        <div className="px-6 py-4 flex-grow rounded-lg gap-2 lg:gap-4 bg-white">
            <div className="flex items-start justify-between ">
                <div>
                    <p className="font-light text-lg text-gray-400">{title}</p>
                    <p className="font-semibold text-lg text-black">{number}</p>
                </div>
                <div className="mt-1 bg-green-50 p-3 rounded-full">
                    <Icon size={35} className="stroke-green-500" />
                </div>
            </div>

            <p className="flex items-center mt-2 whitespace-nowrap">
                {isTrendingUp ? (
                    <TrendingUp color="#22c55e" className="w-4 h-4 mr-1" />
                ) : (
                    <TrendingDown color="#ef4444" className="w-4 h-4 mr-1" />
                )}
                <span
                    className={
                        isTrendingUp
                            ? "text-green-500 mr-2"
                            : "text-red-500 mr-2"
                    }
                >
                    {isTrendingUp ? "+" : ""}
                    {percentageChange.toFixed(2)}%
                </span>
                from Yesterday
            </p>
        </div>
    );
}

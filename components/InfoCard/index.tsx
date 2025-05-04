import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function InfoCard({ title, number, icon: Icon }: InfoCard) {
    const isTrendingUp = true;

    return (
        <div className="px-6 py-4 flex-grow rounded-lg gap-2 lg:gap-4 bg-white">
            <div className="flex items-start justify-between ">
                <div>
                    <p className="font-light text-lg text-gray-400">{title}</p>
                    <p className="font-semibold text-lg text-black">{number}</p>
                </div>
                <div className="mt-1 text-black">
                    <Icon size={35} />
                </div>
            </div>

            <p className="flex items-center mt-2 whitespace-nowrap">
                {isTrendingUp ? (
                    <TrendingUp color="#22c55e" className="w-4 h-4 mr-1" />
                ) : (
                    <TrendingDown color="#ef4444" className="w-4 h-4 mr-1" />
                )}
                <span className="text-green-500 mr-2">+6.35%</span> Yesterday
            </p>
        </div>
    );
}

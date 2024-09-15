import {
    LayoutDashboard,
    ShoppingBasket,
    History as HistoryIcon,
    Settings,
} from "lucide-react";
import React from "react";

const Sidebar = () => {
    return (
        <div className="w-20 h-screen bg-white shadow-sm p-6 flex flex-col items-center justify-between">
            <div>
                <h2 className="text-2xl font-bold mt-3 mb-12">L</h2>
                <ul className="flex flex-col items-center">
                    <li className="mb-4">
                        <div className="cursor-pointer w-8 h-8 rounded-lg bg-[#fafafa] flex items-center justify-center">
                            <LayoutDashboard />
                        </div>
                    </li>
                    <li className="mb-4">
                        <div className="cursor-pointer w-8 h-8 rounded-lg bg-[#deefe7] flex items-center justify-center">
                            <ShoppingBasket />
                        </div>
                    </li>
                    <li className="mb-4">
                        <div className="cursor-pointer w-8 h-8 rounded-lg bg-[#fafafa] flex items-center justify-center">
                            <HistoryIcon />
                        </div>
                    </li>
                    <li className="mb-4">
                        <div className="cursor-pointer w-8 h-8 rounded-lg bg-[#fafafa] flex items-center justify-center">
                            <Settings />
                        </div>
                    </li>
                </ul>
            </div>
            <div className="w-8 h-8 rounded-full bg-red-500 mt-auto mb-4"></div>
        </div>
    );
};

export default Sidebar;

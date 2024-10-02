import {
    LayoutDashboard,
    ShoppingBasket,
    History as HistoryIcon,
    Settings,
} from "lucide-react";
import React from "react";
import Image from "next/image";

import logo from "@/assets/Icon.png";

const Sidebar = () => {
    return (
        <div className="w-20 h-screen bg-white shadow-sm p-6 flex flex-col items-center justify-between">
            <div className="flex flex-col items-center">
                <Image
                    src={logo}
                    alt="Logo"
                    className="mt-3 mb-12 rounded-full cursor-pointer"
                />
                <ul className="flex flex-col items-center">
                    <li className="mb-4">
                        <div className="cursor-pointer w-8 h-8 rounded-lg bg-[#fafafa] flex items-center justify-center">
                            <LayoutDashboard size={22} />
                        </div>
                    </li>
                    <li className="mb-4">
                        <div className="cursor-pointer w-8 h-8 rounded-lg bg-[#deefe7] flex items-center justify-center">
                            <ShoppingBasket size={22} />
                        </div>
                    </li>
                    <li className="mb-4">
                        <div className="cursor-pointer w-8 h-8 rounded-lg bg-[#fafafa] flex items-center justify-center">
                            <HistoryIcon size={22} />
                        </div>
                    </li>
                    <li className="mb-4">
                        <div className="cursor-pointer w-8 h-8 rounded-lg bg-[#fafafa] flex items-center justify-center">
                            <Settings size={22} />
                        </div>
                    </li>
                </ul>
            </div>
            <div className="w-10 h-10 rounded-full bg-red-500 mt-auto mb-4 flex items-center justify-center"></div>
        </div>
    );
};

export default Sidebar;

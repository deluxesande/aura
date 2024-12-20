import {
    LayoutDashboard,
    ShoppingBasket,
    History as HistoryIcon,
    Settings,
    PackageSearch,
} from "lucide-react";
import React from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";

import logo from "@/assets/Icon.png";
import Link from "next/link";

const Sidebar = () => {
    const pathname = usePathname();

    const links = [
        { href: "/dashboard", icon: <LayoutDashboard size={22} /> },
        { href: "/products", icon: <ShoppingBasket size={22} /> },
        { href: "/invoices", icon: <HistoryIcon size={22} /> },
        { href: "/products/list", icon: <PackageSearch size={22} /> },
        { href: "/settings", icon: <Settings size={22} /> },
    ];

    return (
        <div className="w-20 h-screen bg-white shadow-sm p-6 flex flex-col items-center justify-between">
            <div className="flex flex-col items-center">
                <Link href="/">
                    <Image
                        src={logo}
                        alt="Logo"
                        className="mt-3 mb-12 rounded-full cursor-pointer"
                    />
                </Link>
                <ul className="flex flex-col items-center">
                    {links.map((link) => (
                        <li key={link.href} className="mb-4">
                            <Link href={link.href}>
                                <div
                                    className={`cursor-pointer w-8 h-8 rounded-lg flex text-black items-center justify-center ${
                                        pathname === link.href
                                            ? "bg-[#deefe7]"
                                            : "bg-[#fafafa]"
                                    }`}
                                >
                                    {link.icon}
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="w-10 h-10 rounded-full bg-red-500 mt-auto mb-4 flex items-center justify-center"></div>
        </div>
    );
};

export default Sidebar;

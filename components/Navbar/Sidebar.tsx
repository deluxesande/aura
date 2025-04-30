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
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

const Sidebar = () => {
    const pathname = usePathname();

    const links = [
        {
            href: "/dashboard",
            icon: <LayoutDashboard size={22} />,
            label: "Dashboard",
        },
        {
            href: "/products",
            icon: <ShoppingBasket size={22} />,
            label: "Products",
        },
        {
            href: "/invoices",
            icon: <HistoryIcon size={22} />,
            label: "Invoices",
        },
        {
            href: "/products/list",
            icon: <PackageSearch size={22} />,
            label: "Product Management",
        },
        { href: "/settings", icon: <Settings size={22} />, label: "Settings" },
    ];

    const { user } = useUser();

    return (
        <div className="w-20 h-screen bg-white shadow-sm p-6 hidden lg:flex flex-col items-center justify-between">
            <div className="flex flex-col items-center">
                <Link href="/">
                    <Image
                        src="/logos/salesense-vertical.png"
                        alt="Logo"
                        width={100}
                        height={100}
                        className="mt-3 mb-12 cursor-pointer"
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
            <Link href="/profile">
                <div className="w-10 h-10 rounded-full mt-auto mb-4 flex items-center justify-center">
                    {user && user.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={user.imageUrl}
                            alt="User Profile"
                            className="w-full h-full rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full rounded-full bg-gray-300"></div>
                    )}
                </div>
            </Link>
        </div>
    );
};

export default Sidebar;

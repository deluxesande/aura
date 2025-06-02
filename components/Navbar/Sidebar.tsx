import {
    LayoutDashboard,
    ShoppingBasket,
    History as HistoryIcon,
    Settings,
    PackageSearch,
    ChevronRight,
    ChevronLeft,
} from "lucide-react";
import React from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useSelector } from "react-redux";
import { AppState } from "@/store";
import { useDispatch } from "react-redux";
import { toggleSideBarState } from "@/store/slices/sideBarSlice";
import CustomUserButton from "../CustomUserButton";

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
        label: "Inventory",
    },
    { href: "/settings", icon: <Settings size={22} />, label: "Settings" },
];

const Sidebar = () => {
    const pathname = usePathname();

    const { user } = useUser();
    const dispatch = useDispatch();
    const sideBarState = useSelector(
        (state: AppState) => state.sidebar.isOpen,
        (prev, next) => prev === next
    );

    const profileImage = user?.hasImage
        ? user?.imageUrl
        : "https://www.svgrepo.com/show/535711/user.svg";

    const [toggleSideBar, setToggleSidebar] = React.useState(sideBarState);

    const toggleSidebarFunc = () => {
        setToggleSidebar(!sideBarState);
        dispatch(toggleSideBarState());
    };

    return (
        <div
            className={`${
                toggleSideBar ? "w-44" : "w-20"
            } h-screen bg-white shadow-sm p-6 hidden lg:flex flex-col items-start justify-between sticky z-10`}
        >
            <div className="flex flex-col items-center justify-center">
                <Link href="/">
                    {toggleSideBar ? (
                        <Image
                            src="/logos/salesense-horizontal.png"
                            alt="Logo"
                            width={100}
                            height={100}
                            className="mt-3 mb-12 cursor-pointer"
                        />
                    ) : (
                        <Image
                            src="/logos/salesense-vertical.png"
                            alt="Logo"
                            width={100}
                            height={100}
                            className="mt-3 mb-12 cursor-pointer"
                        />
                    )}
                </Link>
                <ul className="flex flex-col items-start justify-center mt-4">
                    {links.map((link) => (
                        <li key={link.href} className="mb-4">
                            <Link
                                href={link.href}
                                className="flex items-center justify-start gap-2"
                            >
                                <div
                                    className={`cursor-pointer w-8 h-8 rounded-lg flex text-black items-center justify-center ${
                                        pathname === link.href
                                            ? "bg-[#deefe7]"
                                            : "bg-[#fafafa]"
                                    }`}
                                >
                                    {link.icon}
                                </div>
                                {toggleSideBar && (
                                    <span
                                        className={`${
                                            pathname === link.href
                                                ? "text-green-500"
                                                : "text-black"
                                        } text-sm`}
                                    >
                                        {link.label}
                                    </span>
                                )}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
            {sideBarState ? (
                <CustomUserButton />
            ) : (
                <Link href="/profile">
                    <div className="w-10 h-10 rounded-full mt-auto mb-4 flex items-center justify-center">
                        <Image
                            src={profileImage}
                            width={30}
                            height={30}
                            alt={`${user?.firstName} Profile Image`}
                        />
                    </div>
                </Link>
            )}

            <button
                onClick={toggleSidebarFunc}
                className="absolute top-[140px] right-[-15px] transform -translate-y-1/2 bg-white p-2 rounded-full"
            >
                {toggleSideBar ? (
                    <ChevronLeft size={20} />
                ) : (
                    <ChevronRight size={20} />
                )}
            </button>
        </div>
    );
};

export default Sidebar;

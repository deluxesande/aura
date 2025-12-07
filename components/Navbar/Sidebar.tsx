import {
    LayoutDashboard,
    ShoppingBasket,
    History as HistoryIcon,
    Settings,
    PackageSearch,
    ChevronRight,
    ChevronLeft,
} from "lucide-react";
import React, { useEffect } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useSelector } from "react-redux";
import { AppState } from "@/store";
import { useDispatch } from "react-redux";
import { toggleSideBarState } from "@/store/slices/sideBarSlice";
import axios from "axios";
import { setUser } from "@/store/slices/authSlice";

const allLinks = [
    {
        href: "/dashboard",
        icon: (isActive: boolean) => (
            <LayoutDashboard
                size={22}
                className={isActive ? "stroke-white" : "stroke-black"}
            />
        ),
        label: "Dashboard",
        allowedRoles: ["admin", "manager", "user"],
    },
    {
        href: "/products",
        icon: (isActive: boolean) => (
            <ShoppingBasket
                size={22}
                className={isActive ? "stroke-white" : "stroke-black"}
            />
        ),
        label: "Products",
        allowedRoles: ["admin", "manager", "user"],
    },
    {
        href: "/invoices",
        icon: (isActive: boolean) => (
            <HistoryIcon
                size={22}
                className={isActive ? "stroke-white" : "stroke-black"}
            />
        ),
        label: "Invoices",
        allowedRoles: ["admin", "manager", "user"],
    },
    {
        href: "/products/list",
        icon: (isActive: boolean) => (
            <PackageSearch
                size={22}
                className={isActive ? "stroke-white" : "stroke-black"}
            />
        ),
        label: "Inventory",
        allowedRoles: ["admin", "manager", "user"],
    },
    {
        href: "/settings",
        icon: (isActive: boolean) => (
            <Settings
                size={22}
                className={isActive ? "stroke-white" : "stroke-black"}
            />
        ),
        label: "Settings",
        allowedRoles: ["admin", "manager"],
    },
];

type storeUser = {
    id: string;
    name: string;
    email: string;
    role: string;
    businessId: string;
    status: string;
    Business: {};
};

const Sidebar = () => {
    const pathname = usePathname();

    const { user: clerkUser } = useUser();
    const dispatch = useDispatch();
    const sideBarState = useSelector(
        (state: AppState) => state.sidebar.isOpen,
        (prev, next) => prev === next
    );
    const user = useSelector(
        (state: AppState) => state.auth.user
    ) as storeUser | null;

    const [toggleSideBar, setToggleSidebar] = React.useState(sideBarState);

    useEffect(() => {
        if (user === null) {
            const fetchUser = async () => {
                try {
                    const res = await axios.get("/api/auth/user/profile");
                    if (res.data) {
                        dispatch(setUser(res.data.user));
                    }
                } catch (error) {
                    console.error("Error fetching user:", error);
                }
            };
            fetchUser();
        }
    }, [user, dispatch]);

    if (user == null) return null;

    // Filter links based on user role
    const links = allLinks.filter((link) =>
        link.allowedRoles.some(
            (role) => role.toLowerCase() === user.role.toLowerCase()
        )
    );

    const profileImage = clerkUser?.hasImage
        ? clerkUser?.imageUrl
        : "https://www.svgrepo.com/show/535711/user.svg";

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
                    {links.map((link) => {
                        const isActive = pathname === link.href;

                        return (
                            <li key={link.href} className="mb-4">
                                <Link
                                    href={link.href}
                                    className="flex items-center justify-start gap-2"
                                >
                                    <div
                                        className={`cursor-pointer w-8 h-8 rounded-lg flex text-black items-center justify-center ${
                                            pathname === link.href
                                                ? "bg-[#22c55e] stroke-green-400"
                                                : "bg-[#fafafa]"
                                        }`}
                                    >
                                        {link.icon(isActive)}
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
                        );
                    })}
                </ul>
            </div>
            {sideBarState ? (
                <Link
                    className="w-full flex items-center space-x-3 px-2 py-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer group"
                    href="/profile"
                >
                    <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 ring-2 ring-gray-200">
                        <Image
                            src={profileImage}
                            width={30}
                            height={30}
                            alt={`${clerkUser?.firstName} Profile Image`}
                            className="object-cover rounded-full"
                        />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                            {clerkUser?.firstName} {clerkUser?.lastName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                            {user?.role}
                        </p>
                    </div>
                </Link>
            ) : (
                <Link href="/profile">
                    <div className="w-10 h-10 rounded-full mt-auto mb-4 flex items-center justify-center ring-2 ring-gray-200 hover:ring-green-400 transition-all cursor-pointer">
                        <Image
                            src={profileImage}
                            width={30}
                            height={30}
                            alt={`${clerkUser?.firstName} Profile Image`}
                            className="rounded-full object-cover"
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

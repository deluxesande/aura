"use client";

import { AppState } from "@/store";
import { setUser, signOut as signOutAction } from "@/store/slices/authSlice";
import { toggleSideBarState } from "@/store/slices/sideBarSlice";
import { apiClient } from "@/utils/apiClient";
import { useClerk, useUser } from "@clerk/nextjs";
import {
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    HandCoins,
    HelpCircle,
    LayoutDashboard,
    LogOut,
    PackageSearch,
    Settings,
    ShoppingBasket,
    Users,
    WalletMinimal,
    Truck,
    Building2,
    ClipboardList,
    History,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const linkGroups = [
    {
        label: "Overview",
        items: [
            {
                href: "/dashboard",
                label: "Dashboard",
                icon: LayoutDashboard,
                allowedRoles: ["admin", "manager"],
            },
        ],
    },
    {
        label: "Sales & CRM",
        items: [
            {
                href: "/invoices",
                label: "Invoices",
                icon: HandCoins,
                allowedRoles: ["admin", "manager", "user"],
            },
            {
                href: "/customers",
                label: "Customers",
                icon: Users,
                allowedRoles: ["admin", "manager", "user"],
            },
        ],
    },
    {
        label: "Inventory",
        items: [
            {
                href: "/products",
                label: "Products",
                icon: ShoppingBasket,
                allowedRoles: ["admin", "manager", "user"],
            },
            {
                href: "/products/list",
                label: "Stocks",
                icon: PackageSearch,
                allowedRoles: ["admin", "manager", "user"],
            },
            {
                href: "/inventory/reconciliation",
                label: "Stocktaking",
                icon: ClipboardList,
                allowedRoles: ["admin", "manager"],
            },
        ],
    },
    {
        label: "Supply Chain",
        items: [
            {
                label: "Procurement",
                icon: Truck,
                allowedRoles: ["admin", "manager"],
                subItems: [
                    { href: "/suppliers", label: "Suppliers" },
                    {
                        href: "/suppliers/orders",
                        label: "Orders",
                    },
                    {
                        href: "/suppliers/history",
                        label: "History",
                    },
                ],
            },
        ],
    },
    {
        label: "Finance",
        items: [
            {
                href: "/expenses",
                label: "Expenses",
                icon: WalletMinimal,
                allowedRoles: ["admin", "manager"],
            },
        ],
    },
    {
        label: "System",
        items: [
            {
                href: "/settings",
                label: "Settings",
                icon: Settings,
                allowedRoles: ["admin", "manager"],
            },
        ],
    },
];

type storeUser = {
    id: string;
    name: string;
    email: string;
    role: string;
    businessId: string;
    status: string;
    Business: {
        name?: string;
    };
};

const Sidebar = () => {
    const pathname = usePathname();

    const { user: clerkUser, isSignedIn } = useUser();
    const { signOut } = useClerk();
    const dispatch = useDispatch();
    const sideBarState = useSelector((state: AppState) => state.sidebar.isOpen);
    const user = useSelector(
        (state: AppState) => state.auth.user,
    ) as storeUser | null;

    const [toggleSideBar, setToggleSidebar] = useState(sideBarState);

    // State to track which accordions are open
    const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>(
        {
            Procurement: pathname?.startsWith("/suppliers") || false,
        },
    );

    useEffect(() => {
        setToggleSidebar(sideBarState);
    }, [sideBarState]);

    useEffect(() => {
        if (user === null) {
            const fetchUser = async () => {
                try {
                    const res = await apiClient.get("/auth/user/profile");
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

    const handleSignOut = async () => {
        if (isSignedIn) {
            await signOut();
            dispatch(signOutAction());
        }
    };

    const toggleSidebarFunc = () => {
        const newState = !toggleSideBar;
        setToggleSidebar(newState);
        dispatch(toggleSideBarState());
    };

    const toggleDropdown = (label: string) => {
        if (!toggleSideBar) {
            // Auto-expand sidebar if clicking a collapsed accordion parent
            toggleSidebarFunc();
            setOpenDropdowns((prev) => ({ ...prev, [label]: true }));
        } else {
            setOpenDropdowns((prev) => ({ ...prev, [label]: !prev[label] }));
        }
    };

    if (user == null) return null;

    const profileImage = clerkUser?.hasImage
        ? clerkUser?.imageUrl
        : "/images/user.png";

    return (
        <aside
            data-tour="sidebar"
            className={`${
                toggleSideBar ? "w-44" : "w-20"
            } h-screen bg-white shadow-sm border-r border-gray-100 hidden lg:flex flex-col sticky top-0 transition-all duration-300 ease-in-out overflow-visible no-scrollbar`}
        >
            {/* BACKGROUND PATTERN */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03] z-0">
                <div className="absolute -top-[10%] -left-[10%] w-[80%] h-[40%] rounded-full bg-green-900/20 blur-[60px]" />
                <div className="absolute bottom-0 right-0 w-[60%] h-[30%] bg-green-800/10 blur-[50px] rounded-full" />
                <svg
                    className="absolute inset-0 w-full h-full"
                    viewBox="0 0 100 800"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="none"
                >
                    <path
                        d="M20 0V800"
                        stroke="black"
                        strokeWidth="0.5"
                        className="opacity-20"
                    />
                    <path
                        d="M50 0C60 200 10 400 50 600C90 800 50 800 50 800"
                        stroke="black"
                        strokeWidth="0.5"
                        className="opacity-10"
                    />
                </svg>
            </div>

            <div className="relative z-10 flex flex-col h-full w-full p-4 overflow-hidden">
                <div className="flex items-center justify-center mb-8 mt-2 h-10 flex-shrink-0">
                    <Link href="/">
                        {toggleSideBar ? (
                            <Image
                                src="/logos/salesense-horizontal.png"
                                alt="Logo"
                                width={120}
                                height={40}
                                className="object-contain cursor-pointer"
                                priority
                            />
                        ) : (
                            <Image
                                src="/logos/salesense-vertical.png"
                                alt="Logo"
                                width={32}
                                height={32}
                                className="object-contain cursor-pointer"
                                priority
                            />
                        )}
                    </Link>
                </div>

                <div className="flex flex-col gap-6 overflow-y-auto no-scrollbar flex-1 pb-4">
                    {linkGroups.map((group, groupIdx) => {
                        const visibleLinks = group.items.filter((link) =>
                            link.allowedRoles.some(
                                (role) =>
                                    role?.toLowerCase() ===
                                    user?.role?.toLowerCase(),
                            ),
                        );

                        if (visibleLinks.length === 0) return null;

                        return (
                            <div
                                key={groupIdx}
                                data-tour={`nav-${group.label.toLowerCase()}`}
                                className="w-full "
                            >
                                {toggleSideBar && (
                                    <h3 className="px-3 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                        {group.label}
                                    </h3>
                                )}
                                <ul className="flex flex-col gap-2">
                                    {visibleLinks.map((link: any) => {
                                        // Handle Dropdown Accordion Item
                                        if (link.subItems) {
                                            const isOpen =
                                                openDropdowns[link.label];
                                            const isChildActive =
                                                link.subItems.some(
                                                    (sub: any) =>
                                                        pathname === sub.href ||
                                                        (sub.href !==
                                                            "/suppliers" &&
                                                            pathname?.startsWith(
                                                                sub.href,
                                                            )),
                                                );
                                            const Icon = link.icon;

                                            return (
                                                <li
                                                    key={link.label}
                                                    className="flex flex-col gap-1"
                                                >
                                                    <button
                                                        onClick={() =>
                                                            toggleDropdown(
                                                                link.label,
                                                            )
                                                        }
                                                        className={`flex items-center justify-between px-2 py-2 rounded-lg transition-all duration-200 group ${isChildActive && !isOpen ? "bg-green-50 text-green-500" : "hover:bg-green-50 text-gray-600"} ${!toggleSideBar ? "justify-center" : ""}`}
                                                        title={
                                                            !toggleSideBar
                                                                ? link.label
                                                                : ""
                                                        }
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex-shrink-0">
                                                                <Icon
                                                                    size={20}
                                                                    className={
                                                                        isChildActive
                                                                            ? "stroke-green-500"
                                                                            : "stroke-green-500 group-hover:stroke-green-500"
                                                                    }
                                                                />
                                                            </div>
                                                            {toggleSideBar && (
                                                                <span
                                                                    className={`text-sm font-medium whitespace-nowrap overflow-hidden ${isChildActive ? "text-green-500 font-bold" : "text-gray-600 group-hover:text-green-500"}`}
                                                                >
                                                                    {link.label}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {toggleSideBar && (
                                                            <ChevronDown
                                                                size={14}
                                                                className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                                                            />
                                                        )}
                                                    </button>

                                                    {/* Sub Items */}
                                                    {isOpen &&
                                                        toggleSideBar && (
                                                            <ul className="flex flex-col gap-1 pl-4 pr-2 mt-1">
                                                                {link.subItems.map(
                                                                    (
                                                                        sub: any,
                                                                    ) => {
                                                                        const isSubActive =
                                                                            pathname ===
                                                                                sub.href ||
                                                                            (sub.href !==
                                                                                "/suppliers" &&
                                                                                pathname?.startsWith(
                                                                                    sub.href,
                                                                                ));
                                                                        return (
                                                                            <li
                                                                                key={
                                                                                    sub.href
                                                                                }
                                                                            >
                                                                                <Link
                                                                                    href={
                                                                                        sub.href
                                                                                    }
                                                                                    className={`flex items-center gap-3 px-2 py-1.5 rounded-md transition-all duration-200 group ${isSubActive ? "bg-[#22c55e] text-white shadow-sm" : "hover:bg-green-50 text-gray-500"}`}
                                                                                >
                                                                                    <span
                                                                                        className={`text-xs font-medium ${isSubActive ? "text-white font-bold" : "group-hover:text-green-500"}`}
                                                                                    >
                                                                                        {
                                                                                            sub.label
                                                                                        }
                                                                                    </span>
                                                                                </Link>
                                                                            </li>
                                                                        );
                                                                    },
                                                                )}
                                                            </ul>
                                                        )}
                                                </li>
                                            );
                                        }

                                        // Standard Link Rendering
                                        const isActive = pathname === link.href;
                                        const Icon = link.icon;

                                        return (
                                            <li key={link.href}>
                                                <Link
                                                    href={link.href}
                                                    className={`flex items-center gap-3 px-2 py-2 rounded-lg transition-all duration-200 group ${
                                                        isActive
                                                            ? "bg-[#22c55e] text-white shadow-sm"
                                                            : "hover:bg-green-50 text-gray-600"
                                                    } ${!toggleSideBar ? "justify-center" : ""}`}
                                                    title={
                                                        !toggleSideBar
                                                            ? link.label
                                                            : ""
                                                    }
                                                >
                                                    <div className="flex-shrink-0">
                                                        <Icon
                                                            size={20}
                                                            className={
                                                                isActive
                                                                    ? "stroke-white"
                                                                    : "stroke-green-500 group-hover:stroke-green-500"
                                                            }
                                                        />
                                                    </div>
                                                    {toggleSideBar && (
                                                        <span
                                                            className={`text-sm font-medium whitespace-nowrap overflow-hidden ${
                                                                isActive
                                                                    ? "text-white font-bold"
                                                                    : "text-gray-600 group-hover:text-green-500"
                                                            }`}
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
                        );
                    })}
                </div>

                <div className="w-full space-y-2 mt-auto pt-4 border-t border-gray-100 bg-white flex-shrink-0">
                    {sideBarState ? (
                        <Link
                            href="/help-center"
                            className="w-full flex items-center space-x-3 px-2 py-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer group"
                        >
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#fafafa] group-hover:bg-green-50 transition-colors">
                                <HelpCircle
                                    size={18}
                                    className="stroke-gray-500 group-hover:stroke-green-500 transition-colors"
                                />
                            </div>
                            <span className="text-sm text-gray-600 group-hover:text-green-500 transition-colors">
                                Help Center
                            </span>
                        </Link>
                    ) : (
                        <Link
                            href="/help-center"
                            className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#fafafa] hover:bg-green-50 transition-colors cursor-pointer mx-auto"
                            title="Help Center"
                        >
                            <HelpCircle
                                size={18}
                                className="stroke-gray-500 hover:stroke-green-500"
                            />
                        </Link>
                    )}

                    {sideBarState ? (
                        <Link
                            className="w-full flex items-center space-x-3 px-2 py-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer group"
                            href="/profile"
                        >
                            <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 ring-2 ring-gray-200 group-hover:ring-green-500 transition-colors">
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
                            <div className="w-10 h-10 rounded-full flex items-center justify-center ring-2 ring-gray-200 hover:ring-green-500 transition-all cursor-pointer mx-auto">
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

                    {sideBarState ? (
                        <button
                            onClick={handleSignOut}
                            className="w-full flex items-center space-x-3 px-2 py-2 rounded-lg hover:bg-red-50 transition-colors cursor-pointer group"
                        >
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#fafafa] group-hover:bg-red-100 transition-colors">
                                <LogOut
                                    size={18}
                                    className="text-gray-700 stroke-red-600 group-hover:text-red-600"
                                />
                            </div>
                            <span className="text-sm text-red-600 group-hover:text-red-600">
                                Logout
                            </span>
                        </button>
                    ) : (
                        <button
                            onClick={handleSignOut}
                            className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#fafafa] hover:bg-red-100 transition-colors cursor-pointer mx-auto"
                            title="Logout"
                        >
                            <LogOut
                                size={18}
                                className="stroke-red-600 hover:text-red-600"
                            />
                        </button>
                    )}
                </div>
            </div>

            <button
                onClick={toggleSidebarFunc}
                className="absolute top-28 -right-3 z-50 bg-white border border-gray-200 rounded-full p-1 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all text-gray-400 hover:text-green-500 flex items-center justify-center w-6 h-6"
            >
                {toggleSideBar ? (
                    <ChevronLeft size={14} strokeWidth={2.5} />
                ) : (
                    <ChevronRight size={14} strokeWidth={2.5} />
                )}
            </button>
        </aside>
    );
};

export default Sidebar;

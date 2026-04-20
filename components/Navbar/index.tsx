"use client";

import { AppState } from "@/store";
import { setUser, signOut as signOutAction } from "@/store/slices/authSlice";
import {
    setBusinessDetails,
    setBusinessLoading,
} from "@/store/slices/businessDataSlice";
import { hide, show } from "@/store/slices/visibilitySlice";
import { apiClient } from "@/utils/apiClient";
import { SignedIn, useClerk, useUser } from "@clerk/nextjs";
import {
    autoUpdate,
    flip,
    FloatingPortal,
    offset,
    shift,
    useFloating,
} from "@floating-ui/react";
import { Bell, Inbox, Notifications } from "@novu/nextjs";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@radix-ui/react-popover";
import {
    AlertTriangle,
    ChevronDown,
    ChevronRight,
    LogOut,
    Menu,
    Search as SearchIcon,
    ShoppingCart,
    SlidersHorizontal,
    X,
    LayoutDashboard,
    HandCoins,
    Users,
    ShoppingBasket,
    PackageSearch,
    ClipboardList,
    Truck,
    WalletMinimal,
    Settings as SettingsIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import BusinessOnboardingModal from "../BusinessOnboardingModal";
import CustomUserButton from "../CustomUserButton";
import FilterOverlay from "../FilterOverlay";
import SubscriptionWarningModal from "../SubscriptionWarningModal";
import Sidebar from "./Sidebar";

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
                    { href: "/suppliers/orders", label: "Orders" },
                    { href: "/suppliers/history", label: "History" },
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
                icon: SettingsIcon,
                allowedRoles: ["admin", "manager"],
            },
        ],
    },
];

const allLinks = [
    {
        href: "/dashboard",
        text: "Dashboard",
        allowedRoles: ["admin", "manager"],
    },
    {
        href: "/products",
        text: "Products",
        allowedRoles: ["admin", "manager", "user"],
    },
    {
        href: "/invoices",
        text: "Invoices",
        allowedRoles: ["admin", "manager", "user"],
    },
    {
        href: "/products/list",
        text: "Inventory",
        allowedRoles: ["admin", "manager", "user"],
    },
    {
        href: "/customers",
        text: "Customers",
        allowedRoles: ["admin", "manager", "user"],
    },
    // { href: "/tax", text: "Tax Returns", allowedRoles: ["admin", "manager"] },
    { href: "/settings", text: "Settings", allowedRoles: ["admin", "manager"] },
    {
        href: "/profile",
        text: "Profile",
        allowedRoles: ["admin", "manager", "user"],
    },
];

type User = {
    id: string;
    name: string;
    clerkId: string;
    email: string;
    role: string;
    businessId: string;
    storeId: string;
    status: string;
    Business: {};
};

export default function Navbar({
    children,
    setFilteredProducts,
    onSearchQueryChange,
}: {
    children: React.ReactNode;
    setFilteredProducts?: (products: any[]) => void;
    onSearchQueryChange?: (query: string) => void;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const dispatch = useDispatch();

    const [showPopup, setShowPopup] = useState(false);
    const [filterPopUp, setFilterPopUp] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [isDesktop, setIsDesktop] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [inputValue, setInputValue] = useState<string>("");
    const { signOut } = useClerk();

    const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>(
        {},
    );

    const originalProducts = useSelector(
        (state: AppState) => state.product.products,
    );
    const sideBarState = useSelector((state: AppState) => state.sidebar.isOpen);
    const cartItems = useSelector((state: AppState) => state.cart?.items || []);
    const cartCount = cartItems.length;
    const user = useSelector(
        (state: AppState) => state.auth.user,
    ) as User | null;
    const isVisible = useSelector(
        (state: AppState) => state.visibility.isVisible,
    );

    const { user: clerkUser, isSignedIn } = useUser();
    const profileImage = clerkUser?.hasImage
        ? clerkUser?.imageUrl
        : "/images/user.png";

    const businessDetails = useSelector(
        (state: AppState) => state.businessData?.businessDetails,
    );
    const isFetchingBusiness = useSelector(
        (state: AppState) => state.businessData?.loading,
    );

    const isProductsPage = pathname === "/products";

    const { refs, floatingStyles } = useFloating({
        open: showPopup,
        onOpenChange: setShowPopup,
        placement: "bottom",
        middleware: [offset(10), flip(), shift({ padding: 8 })],
        whileElementsMounted: autoUpdate,
    });

    useEffect(() => {
        setMounted(true);
        const checkScreenSize = () => {
            setIsDesktop(window.innerWidth >= 1024);
        };
        checkScreenSize();
        window.addEventListener("resize", checkScreenSize);
        return () => window.removeEventListener("resize", checkScreenSize);
    }, []);

    useEffect(() => {
        if (user === null) {
            const fetchUser = async () => {
                try {
                    const res = await apiClient.get("/auth/user/profile");
                    if (res.data) dispatch(setUser(res.data.user));
                } catch (error) {
                    console.error("Error fetching user:", error);
                }
            };
            fetchUser();
        }
    }, [user, dispatch]);

    useEffect(() => {
        if (user?.businessId && !businessDetails && !isFetchingBusiness) {
            const fetchBusinessDetails = async () => {
                dispatch(setBusinessLoading(true));
                try {
                    const res = await apiClient.get(
                        `/business/${user.businessId}`,
                    );
                    dispatch(setBusinessDetails(res.data));
                } catch (error) {
                    console.error("Error fetching business details:", error);
                    dispatch(setBusinessLoading(false));
                }
            };
            fetchBusinessDetails();
        }
    }, [user?.businessId, businessDetails, isFetchingBusiness, dispatch]);

    const [stores, setStores] = useState<any[]>(() => {
        if (typeof window === "undefined") return [];
        try {
            return JSON.parse(localStorage.getItem("storesCache") || "[]");
        } catch {
            return [];
        }
    });

    const [activeStore, setActiveStore] = useState<any | null>(() => {
        if (typeof window === "undefined") return null;
        try {
            return JSON.parse(localStorage.getItem("activeStore") || "null");
        } catch {
            return null;
        }
    });
    const [isStorePickerOpen, setIsStorePickerOpen] = useState(false);

    const storeLabel = useMemo(() => {
        if (activeStore?.name) return activeStore.name;
        if (user?.role !== "admin") return "Assigned Branch";
        return stores.length === 0 ? "Loading..." : "Select Branch";
    }, [activeStore?.name, user?.role, stores.length]);

    useEffect(() => {
        const fetchStores = async () => {
            if (!user?.businessId) return;

            try {
                const res = await apiClient.get(
                    `/business/${user.businessId}/stores`,
                );
                const fetchedStores = res.data || [];
                setStores(fetchedStores);
                localStorage.setItem(
                    "storesCache",
                    JSON.stringify(fetchedStores),
                );

                const savedStoreId = localStorage.getItem("activeStoreId");
                let currentStore = null;

                if (user?.role === "admin") {
                    currentStore =
                        fetchedStores.find((s: any) => s.id === savedStoreId) ||
                        fetchedStores[0] ||
                        null;
                } else {
                    currentStore =
                        fetchedStores.find((s: any) => s.id === user.storeId) ||
                        null;
                }

                if (currentStore) {
                    setActiveStore(currentStore);
                    localStorage.setItem("activeStoreId", currentStore.id);
                    localStorage.setItem(
                        "activeStore",
                        JSON.stringify(currentStore),
                    );
                }
            } catch (error) {
                console.error("Error fetching stores:", error);
            }
        };

        fetchStores();
    }, [user?.businessId, user?.role, user?.storeId]);

    const handleStoreChange = (store: any) => {
        setActiveStore(store);
        localStorage.setItem("activeStoreId", store.id);
        localStorage.setItem("activeStore", JSON.stringify(store));
        setIsStorePickerOpen(false);
        window.location.reload();
    };

    const links = user
        ? allLinks.filter((link) =>
              link.allowedRoles.some(
                  (role) => role?.toLowerCase() === user?.role?.toLowerCase(),
              ),
          )
        : [];

    const toggleFilterPopUp = () => {
        if (pathname !== "/products") router.push("/products");
        setFilterPopUp(!filterPopUp);
    };

    const toggleSidebar = () => {
        if (isVisible) dispatch(hide());
        else dispatch(show());
    };

    const handleInputValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInputValue(val);

        // Live search support
        if (onSearchQueryChange) {
            onSearchQueryChange(val);
        } else if (val.length === 0) {
            setFilteredProducts?.(originalProducts);
        }
    };

    const handleSearch = () => {
        if (pathname !== "/products") router.push("/products");

        if (!setFilteredProducts) return;

        const searchTerm = inputValue.trim().toLowerCase();

        const filtered = originalProducts.filter((product: any) => {
            const name = product.name ? product.name.toLowerCase() : "";
            const description = product.description
                ? product.description.toLowerCase()
                : "";
            const sku = product.sku ? product.sku.toLowerCase() : "";

            return (
                name.includes(searchTerm) ||
                description.includes(searchTerm) ||
                sku.includes(searchTerm)
            );
        });

        if (filtered.length === 0 && searchTerm !== "") {
            toast.error("No products found.");
        }

        setFilteredProducts(filtered);
    };

    const handleSignOut = async () => {
        if (isSignedIn) {
            await signOut();
            dispatch(signOutAction());
        }
    };

    if (user == null) return null;

    return (
        <div className="flex h-screen overflow-hidden z-40">
            <div className="fixed h-full">
                <Sidebar />
            </div>

            <div
                className={`flex-grow ${
                    sideBarState ? "lg:ml-40" : "lg:ml-20"
                } flex flex-col w-full`}
            >
                {/* --- PC Navbar --- */}
                <div
                    className={`p-6 ${
                        sideBarState ? "ml-4" : "ml-0"
                    } sticky top-0 left-0 bg-white shadow-sm lg:flex hidden w-full z-40`}
                >
                    <div className="flex items-center justify-between gap-4 w-full">
                        {/* Left Section: Alerts & Search */}
                        <div className="flex items-center gap-4 flex-grow">
                            {businessDetails?.usage.isLimitReached && (
                                <Link
                                    href="/payment"
                                    className="flex items-center gap-2 px-2 py-1 bg-red-50 text-red-700 rounded-lg border border-red-100 hover:bg-red-100 transition-colors"
                                >
                                    <AlertTriangle size={14} />
                                    <span className="text-[10px] font-bold uppercase tracking-tight">
                                        Limit Reached
                                    </span>
                                </Link>
                            )}

                            {isProductsPage && (
                                <div
                                    data-tour="search-bar"
                                    className="relative flex-grow max-w-md hidden md:block"
                                >
                                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search inventory or SKU..."
                                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all text-sm shadow-sm"
                                        value={inputValue}
                                        onChange={handleInputValueChange}
                                        onKeyDown={(e) =>
                                            e.key === "Enter" && handleSearch()
                                        }
                                        autoFocus
                                    />
                                </div>
                            )}
                        </div>

                        {/* Right Section: Icons, User, and Plan Badge */}
                        <div className="flex items-center gap-2">
                            {/* Store Switcher */}
                            {mounted && (
                                <div className="relative mr-2">
                                    <button
                                        onClick={() =>
                                            user?.role === "admin" &&
                                            setIsStorePickerOpen(
                                                !isStorePickerOpen,
                                            )
                                        }
                                        className={`flex flex-col items-start px-4 py-1.5 rounded-lg border transition-all ${
                                            user?.role === "admin"
                                                ? "hover:bg-gray-50 bg-white cursor-pointer"
                                                : "bg-gray-50 cursor-default"
                                        } border-gray-200 min-w-[160px]`}
                                    >
                                        <div className="flex items-center gap-2 w-full">
                                            <span className="text-sm font-semibold text-gray-800 truncate max-w-[140px]">
                                                {storeLabel}
                                            </span>
                                            {user?.role === "admin" && (
                                                <ChevronDown
                                                    size={12}
                                                    className="text-gray-400 ml-auto"
                                                />
                                            )}
                                        </div>
                                    </button>

                                    {isStorePickerOpen &&
                                        user?.role === "admin" && (
                                            <div className="absolute top-full right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-2xl z-[100] py-3 animate-in fade-in slide-in-from-top-2">
                                                <div className="px-5 py-2 mb-2">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                                        Select Location
                                                    </p>
                                                </div>

                                                <div className="max-h-[350px] overflow-y-auto px-2">
                                                    {stores
                                                        .filter(
                                                            (s) =>
                                                                s.isActive !==
                                                                false,
                                                        )
                                                        .map((store) => (
                                                            <button
                                                                key={store.id}
                                                                onClick={() =>
                                                                    handleStoreChange(
                                                                        store,
                                                                    )
                                                                }
                                                                className={`w-full flex flex-col gap-0.5 px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors text-left ${
                                                                    activeStore?.id ===
                                                                    store.id
                                                                        ? "bg-gray-50"
                                                                        : ""
                                                                }`}
                                                            >
                                                                <div className="flex items-center justify-between w-full">
                                                                    <p
                                                                        className={`text-sm font-bold ${activeStore?.id === store.id ? "text-green-500" : "text-gray-900"}`}
                                                                    >
                                                                        {
                                                                            store.name
                                                                        }
                                                                    </p>
                                                                    {activeStore?.id ===
                                                                        store.id && (
                                                                        <span className="text-[8px] font-bold bg-green-100 text-green-500 px-1.5 py-0.5 rounded uppercase">
                                                                            Active
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <p className="text-[11px] text-gray-500 font-medium truncate w-full">
                                                                    {store.address ||
                                                                        "Physical location not specified"}
                                                                </p>
                                                            </button>
                                                        ))}
                                                </div>

                                                <div className="mt-3 pt-3 border-t border-gray-100 px-4">
                                                    <Link
                                                        href="/settings"
                                                        className="block text-center py-2 text-[11px] font-black text-gray-400 hover:text-green-500 uppercase tracking-widest transition-colors"
                                                    >
                                                        Manage All Branches
                                                    </Link>
                                                </div>
                                            </div>
                                        )}
                                </div>
                            )}

                            {isProductsPage && (
                                <>
                                    <button
                                        onClick={toggleFilterPopUp}
                                        className="p-2 hover:bg-slate-100 text-gray-600 rounded-lg transition-colors"
                                    >
                                        <SlidersHorizontal size={18} />
                                    </button>
                                    {filterPopUp && isDesktop && (
                                        <FloatingPortal>
                                            <div
                                                ref={refs.setFloating}
                                                style={{
                                                    ...floatingStyles,
                                                    zIndex: 9999,
                                                }}
                                            >
                                                <FilterOverlay
                                                    filterPopUp={filterPopUp}
                                                    setFilterPopUp={
                                                        setFilterPopUp
                                                    }
                                                    setFilteredProducts={
                                                        setFilteredProducts ||
                                                        (() => {})
                                                    }
                                                    toggleFilterPopUp={
                                                        toggleFilterPopUp
                                                    }
                                                />
                                            </div>
                                        </FloatingPortal>
                                    )}
                                </>
                            )}

                            {mounted && isDesktop && (
                                <Inbox
                                    applicationIdentifier={
                                        process.env
                                            .NEXT_PUBLIC_APPLICATION_IDENTIFIER!
                                    }
                                    subscriberId={user.clerkId}
                                    appearance={{
                                        variables: {
                                            colorPrimary: "#4ade80",
                                        },
                                    }}
                                >
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <button className="p-2 hover:bg-slate-100 text-gray-600 rounded-lg transition-colors">
                                                <Bell />
                                            </button>
                                        </PopoverTrigger>
                                        <FloatingPortal>
                                            <PopoverContent className="h-[500px] w-[350px] bg-white border border-gray-200 rounded-lg shadow-2xl z-[100] mt-2 overflow-hidden">
                                                <Notifications />
                                            </PopoverContent>
                                        </FloatingPortal>
                                    </Popover>
                                </Inbox>
                            )}

                            <button
                                onClick={toggleSidebar}
                                className="p-2 hover:bg-slate-100 text-gray-600 rounded-lg relative transition-colors"
                            >
                                <ShoppingCart size={18} />
                                {cartCount > 0 && (
                                    <span className="absolute top-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-600 text-[8px] text-white font-bold">
                                        {cartCount > 99 ? "99+" : cartCount}
                                    </span>
                                )}
                            </button>

                            <div className="h-6 w-[1px] bg-gray-200 mx-1" />

                            {businessDetails?.subscription && (
                                <div
                                    className={`flex items-center gap-2 border px-2 py-0.5 rounded-full ml-1 ${
                                        businessDetails.subscription.status ===
                                            "PAST_DUE" ||
                                        businessDetails.subscription.status ===
                                            "INACTIVE" ||
                                        businessDetails.usage.isLimitReached
                                            ? "bg-red-50 border-red-200"
                                            : "bg-gray-50 border-gray-200"
                                    }`}
                                >
                                    <div
                                        className={`h-1.5 w-1.5 rounded-full ${
                                            businessDetails.subscription
                                                .status === "PAST_DUE" ||
                                            businessDetails.subscription
                                                .status === "INACTIVE" ||
                                            businessDetails.usage.isLimitReached
                                                ? "bg-red-500 animate-pulse"
                                                : "bg-green-500"
                                        }`}
                                    />

                                    <span
                                        className={`text-[10px] font-bold uppercase tracking-tight ${
                                            businessDetails.subscription
                                                .status === "PAST_DUE" ||
                                            businessDetails.subscription
                                                .status === "INACTIVE"
                                                ? "text-red-600"
                                                : "text-gray-600"
                                        }`}
                                    >
                                        {businessDetails.subscription.status ===
                                            "PAST_DUE" ||
                                        businessDetails.subscription.status ===
                                            "INACTIVE"
                                            ? "PAST DUE"
                                            : businessDetails.subscription.plan}
                                    </span>

                                    {businessDetails.subscription.plan ===
                                        "STARTER" &&
                                        businessDetails.subscription.status ===
                                            "ACTIVE" && (
                                            <span
                                                className={`text-[9px] font-medium border-l pl-1.5 ml-0.5 ${
                                                    businessDetails.usage
                                                        .isLimitReached
                                                        ? "text-red-600"
                                                        : "text-gray-400"
                                                }`}
                                            >
                                                {
                                                    businessDetails.usage
                                                        .transactionCount
                                                }
                                                /100
                                            </span>
                                        )}
                                </div>
                            )}

                            <div
                                className={user?.role === "user" ? "mr-4" : ""}
                            ></div>

                            <SignedIn>
                                <CustomUserButton />
                            </SignedIn>
                        </div>
                    </div>
                </div>

                {/* --- Mobile Navbar --- */}
                <div className="p-4 sticky top-0 left-0 z-40 bg-white shadow-sm lg:hidden flex justify-between items-center">
                    <Link href="/">
                        <Image
                            src="/logos/salesense-vertical.png"
                            alt="Logo"
                            width={40}
                            height={40}
                            className="w-12 h-12 object-contain ml-2"
                        />
                    </Link>
                    <div className="flex items-center gap-1">
                        {businessDetails?.usage.isLimitReached && (
                            <Link href="/payments">
                                <AlertTriangle
                                    size={20}
                                    className="text-red-500 mr-2"
                                />
                            </Link>
                        )}
                        <button
                            onClick={toggleSidebar}
                            className="p-2 hover:bg-slate-100 text-gray-600 rounded-lg relative transition-colors"
                        >
                            <ShoppingCart size={18} />
                            {cartCount > 0 && (
                                <span className="absolute top-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-600 text-[8px] text-white font-bold">
                                    {cartCount > 99 ? "99+" : cartCount}
                                </span>
                            )}
                        </button>
                        <button
                            className="p-2 text-gray-600"
                            onClick={() => setShowMobileMenu(!showMobileMenu)}
                        >
                            {showMobileMenu ? (
                                <X size={24} />
                            ) : (
                                <Menu size={24} />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                <div className="relative">
                    {showMobileMenu && (
                        <>
                            <div className="fixed top-40 inset-0 bg-black/70 blur z-20"></div>
                            <div className="lg:hidden absolute z-30 w-full flex flex-col bg-white shadow-lg p-4">
                                <div className="relative flex items-center mb-4">
                                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search inventory..."
                                        className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all text-sm shadow-sm"
                                        value={inputValue}
                                        onChange={handleInputValueChange}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                handleSearch();
                                            }
                                        }}
                                    />
                                    <button
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-slate-100 text-gray-600 rounded-lg transition-colors"
                                        onClick={toggleFilterPopUp}
                                    >
                                        <SlidersHorizontal size={20} />
                                    </button>
                                </div>

                                {/* Mobile Store Switcher */}
                                {user?.role === "admin" && (
                                    <div className="mt-4 px-2">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                            Current Branch
                                        </p>
                                        <div className="flex flex-col gap-2 bg-gray-50 rounded-lg p-2">
                                            {stores
                                                .filter(
                                                    (s) => s.isActive !== false,
                                                )
                                                .map((store) => (
                                                    <button
                                                        key={store.id}
                                                        onClick={() =>
                                                            handleStoreChange(
                                                                store,
                                                            )
                                                        }
                                                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors text-left ${
                                                            activeStore?.id ===
                                                            store.id
                                                                ? "bg-white shadow-sm border border-gray-100"
                                                                : "hover:bg-gray-100"
                                                        }`}
                                                    >
                                                        <div>
                                                            <p
                                                                className={`text-sm font-bold ${activeStore?.id === store.id ? "text-green-500" : "text-gray-700"}`}
                                                            >
                                                                {store.name}
                                                            </p>
                                                            {activeStore?.id ===
                                                                store.id && (
                                                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                                                                    Active
                                                                    Location
                                                                </p>
                                                            )}
                                                        </div>
                                                    </button>
                                                ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-col gap-6 mt-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                                    {linkGroups.map((group, groupIdx) => {
                                        const visibleLinks = group.items.filter(
                                            (link) =>
                                                link.allowedRoles.some(
                                                    (role) =>
                                                        role?.toLowerCase() ===
                                                        user?.role?.toLowerCase(),
                                                ),
                                        );

                                        if (visibleLinks.length === 0)
                                            return null;

                                        return (
                                            <div
                                                key={groupIdx}
                                                className="w-full"
                                            >
                                                <h3 className="px-2 mb-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                                    {group.label}
                                                </h3>
                                                <ul className="flex flex-col gap-1.5">
                                                    {visibleLinks.map(
                                                        (link: any) => {
                                                            if (link.subItems) {
                                                                const isOpen =
                                                                    openDropdowns[
                                                                        link
                                                                            .label
                                                                    ];
                                                                const isGroupActive =
                                                                    link.subItems.some(
                                                                        (
                                                                            sub: any,
                                                                        ) =>
                                                                            pathname ===
                                                                            sub.href,
                                                                    );
                                                                const Icon =
                                                                    link.icon;
                                                                return (
                                                                    <li
                                                                        key={
                                                                            link.label
                                                                        }
                                                                        className="flex flex-col gap-1"
                                                                    >
                                                                        <button
                                                                            onClick={() =>
                                                                                setOpenDropdowns(
                                                                                    (
                                                                                        prev,
                                                                                    ) => ({
                                                                                        ...prev,
                                                                                        [link.label]:
                                                                                            !prev[
                                                                                                link
                                                                                                    .label
                                                                                            ],
                                                                                    }),
                                                                                )
                                                                            }
                                                                            className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg transition-all duration-200 ${isGroupActive ? "bg-green-50/50" : "hover:bg-green-50"}`}
                                                                        >
                                                                            <div className="flex items-center gap-3">
                                                                                <Icon
                                                                                    size={
                                                                                        20
                                                                                    }
                                                                                    className="stroke-green-500"
                                                                                />
                                                                                <span
                                                                                    className={`text-sm font-medium ${isGroupActive ? "text-green-500 font-bold" : "text-gray-600"}`}
                                                                                >
                                                                                    {
                                                                                        link.label
                                                                                    }
                                                                                </span>
                                                                            </div>
                                                                            <ChevronDown
                                                                                size={
                                                                                    14
                                                                                }
                                                                                className={`text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                                                                            />
                                                                        </button>
                                                                        <AnimatePresence>
                                                                            {isOpen && (
                                                                                <motion.ul
                                                                                    initial={{
                                                                                        height: 0,
                                                                                        opacity: 0,
                                                                                    }}
                                                                                    animate={{
                                                                                        height: "auto",
                                                                                        opacity: 1,
                                                                                    }}
                                                                                    exit={{
                                                                                        height: 0,
                                                                                        opacity: 0,
                                                                                    }}
                                                                                    className="flex flex-col gap-1 pl-11 pr-2 overflow-hidden"
                                                                                >
                                                                                    {link.subItems.map(
                                                                                        (
                                                                                            sub: any,
                                                                                        ) => {
                                                                                            const isSubActive =
                                                                                                pathname ===
                                                                                                sub.href;
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
                                                                                                        onClick={() =>
                                                                                                            setShowMobileMenu(
                                                                                                                false,
                                                                                                            )
                                                                                                        }
                                                                                                        className={`block py-1.5 text-xs transition-colors duration-200 ${isSubActive ? "text-green-500 font-bold" : "text-gray-500 hover:text-green-500 font-medium"}`}
                                                                                                    >
                                                                                                        {
                                                                                                            sub.label
                                                                                                        }
                                                                                                    </Link>
                                                                                                </li>
                                                                                            );
                                                                                        },
                                                                                    )}
                                                                                </motion.ul>
                                                                            )}
                                                                        </AnimatePresence>
                                                                    </li>
                                                                );
                                                            }

                                                            const isActive =
                                                                pathname ===
                                                                link.href;
                                                            const Icon =
                                                                link.icon;
                                                            return (
                                                                <li
                                                                    key={
                                                                        link.href
                                                                    }
                                                                >
                                                                    <Link
                                                                        href={
                                                                            link.href
                                                                        }
                                                                        onClick={() =>
                                                                            setShowMobileMenu(
                                                                                false,
                                                                            )
                                                                        }
                                                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                                                                            isActive
                                                                                ? "bg-[#22c55e] text-white shadow-sm"
                                                                                : "hover:bg-green-50 text-gray-600"
                                                                        }`}
                                                                    >
                                                                        <div className="flex-shrink-0">
                                                                            <Icon
                                                                                size={
                                                                                    20
                                                                                }
                                                                                className={
                                                                                    isActive
                                                                                        ? "stroke-white"
                                                                                        : "stroke-green-500 group-hover:stroke-green-500"
                                                                                }
                                                                            />
                                                                        </div>
                                                                        <span
                                                                            className={`text-sm font-medium ${
                                                                                isActive
                                                                                    ? "text-white font-bold"
                                                                                    : "group-hover:text-green-500"
                                                                            }`}
                                                                        >
                                                                            {
                                                                                link.label
                                                                            }
                                                                        </span>
                                                                    </Link>
                                                                </li>
                                                            );
                                                        },
                                                    )}
                                                </ul>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="flex justify-between p-2 mt-6">
                                    {businessDetails?.subscription && (
                                        <div
                                            className={`flex items-center gap-2 border px-2 py-0.5 rounded-full ml-1 ${
                                                businessDetails.usage
                                                    .isLimitReached ||
                                                (businessDetails.subscription
                                                    .status !== "ACTIVE" &&
                                                    businessDetails.subscription
                                                        .status !== "TRIALING")
                                                    ? "bg-red-50 border-red-200"
                                                    : "bg-gray-50 border-gray-200"
                                            }`}
                                        >
                                            <div
                                                className={`h-1.5 w-1.5 rounded-full ${
                                                    businessDetails.usage
                                                        .isLimitReached ||
                                                    (businessDetails
                                                        .subscription.status !==
                                                        "ACTIVE" &&
                                                        businessDetails
                                                            .subscription
                                                            .status !==
                                                            "TRIALING")
                                                        ? "bg-red-500 animate-pulse"
                                                        : "bg-green-500"
                                                }`}
                                            />

                                            <span
                                                className={`text-[10px] font-bold uppercase tracking-tight ${
                                                    businessDetails.subscription
                                                        .status !== "ACTIVE" &&
                                                    businessDetails.subscription
                                                        .status !== "TRIALING"
                                                        ? "text-red-600"
                                                        : "text-gray-600"
                                                }`}
                                            >
                                                {businessDetails.subscription
                                                    .status !== "ACTIVE" &&
                                                businessDetails.subscription
                                                    .status !== "TRIALING"
                                                    ? "PAST DUE"
                                                    : businessDetails
                                                          .subscription.plan}
                                            </span>

                                            {businessDetails.subscription
                                                .plan === "STARTER" &&
                                                businessDetails.subscription
                                                    .status === "ACTIVE" && (
                                                    <span
                                                        className={`text-[9px] font-medium border-l pl-1.5 ml-0.5 ${
                                                            businessDetails
                                                                .usage
                                                                .isLimitReached
                                                                ? "text-red-600"
                                                                : "text-gray-400"
                                                        }`}
                                                    >
                                                        {
                                                            businessDetails
                                                                .usage
                                                                .transactionCount
                                                        }
                                                        /100
                                                    </span>
                                                )}
                                        </div>
                                    )}

                                    <SignedIn>
                                        <CustomUserButton />
                                    </SignedIn>
                                </div>
                                {/* User Details */}
                                <div className="w-full flex justify-between items-center mt-2">
                                    <Link
                                        className="w-1/2 flex items-center space-x-3 px-2 py-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer group"
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
                                                {clerkUser?.firstName}{" "}
                                                {clerkUser?.lastName}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">
                                                {user?.role}
                                            </p>
                                        </div>
                                    </Link>
                                    <button
                                        onClick={handleSignOut}
                                        className="w-1/4 flex items-center space-x-3 px-2 py-2 rounded-lg hover:bg-red-50 transition-colors cursor-pointer group"
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
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* --- Body Content --- */}
                <main
                    className={`flex-grow px-4 lg:px-10 py-4 overflow-y-auto bg-gray-50/50 transition-all duration-300 ${
                        sideBarState
                            ? "lg:max-w-[calc(100vw-11rem)]"
                            : "lg:max-w-[calc(100vw-5rem)]"
                    }`}
                >
                    <BusinessOnboardingModal />
                    <SubscriptionWarningModal />
                    {children}
                </main>
            </div>
        </div>
    );
}

"use client";

import { AppState } from "@/store";
import { setUser } from "@/store/slices/authSlice";
import {
    setBusinessDetails,
    setBusinessLoading,
} from "@/store/slices/businessDataSlice";
import { hide, show } from "@/store/slices/visibilitySlice";
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
import axios from "axios";
import {
    AlertTriangle,
    LogOut,
    Menu,
    Search as SearchIcon,
    ShoppingCart,
    SlidersHorizontal,
    X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import BusinessOnboardingModal from "../BusinessOnboardingModal";
import CustomUserButton from "../CustomUserButton";
import FilterOverlay from "../FilterOverlay";
import Sidebar from "./Sidebar";
import { signOut as signOutAction } from "@/store/slices/authSlice";
import SubscriptionWarningModal from "../SubscriptionWarningModal";
import SubscriptionChecker from "../SubscriptionChecker";

const allLinks = [
    {
        href: "/dashboard",
        text: "Dashboard",
        allowedRoles: ["admin", "manager", "user"],
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
    { href: "/tax", text: "Tax Returns", allowedRoles: ["admin", "manager"] },
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
    status: string;
    Business: {};
};

export default function Navbar({
    children,
    setFilteredProducts,
}: {
    children: React.ReactNode;
    setFilteredProducts?: (products: any[]) => void;
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
                    const res = await axios.get("/api/auth/user/profile");
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
                    const res = await axios.get(
                        `/api/business/${user.businessId}`,
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

        if (val.length === 0) {
            setFilteredProducts?.(originalProducts);
        }

        console.log();
        setInputValue(val);
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

            // Clear user state in Redux
            dispatch(signOutAction());
        }
    };

    if (user == null) return null;

    return (
        <div className="flex h-screen overflow-hidden z-50">
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
                                    href="/payments"
                                    className="flex items-center gap-2 px-2 py-1 bg-red-50 text-red-700 rounded-lg border border-red-100 hover:bg-red-100 transition-colors"
                                >
                                    <AlertTriangle size={14} />
                                    <span className="text-[10px] font-bold uppercase tracking-tight">
                                        Limit Reached
                                    </span>
                                </Link>
                            )}

                            {isProductsPage && (
                                <div className="flex items-center bg-gray-100 rounded-lg shadow-sm w-full">
                                    <input
                                        type="text"
                                        placeholder="Search inventory..."
                                        className="py-2 px-4 bg-transparent outline-none w-full text-sm"
                                        value={inputValue}
                                        onChange={handleInputValueChange}
                                        onKeyDown={(e) =>
                                            e.key === "Enter" && handleSearch()
                                        }
                                    />
                                    <div
                                        className="pr-4 text-gray-400 cursor-pointer"
                                        onClick={handleSearch}
                                    >
                                        <SearchIcon
                                            size={18}
                                            className="stroke-green-500"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Section: Icons, User, and Plan Badge */}
                        <div className="flex items-center gap-2">
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
                                            <PopoverContent className="h-[500px] w-[350px] bg-white border border-gray-200 rounded-xl shadow-2xl z-[100] mt-2 overflow-hidden">
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
                                        businessDetails.usage.isLimitReached
                                            ? "bg-red-50 border-red-200"
                                            : "bg-gray-50 border-gray-200"
                                    }`}
                                >
                                    <div
                                        className={`h-1.5 w-1.5 rounded-full ${
                                            businessDetails.usage.isLimitReached
                                                ? "bg-red-500 animate-pulse"
                                                : "bg-green-500"
                                        }`}
                                    />
                                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-tight">
                                        {businessDetails.subscription.plan}
                                    </span>
                                    {businessDetails.subscription.plan ===
                                        "STARTER" && (
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

                            <SignedIn>
                                <CustomUserButton />
                            </SignedIn>
                        </div>
                    </div>
                </div>

                {/* --- Mobile Navbar --- */}
                <div className="p-4 sticky top-0 left-0 z-40 bg-white shadow-sm lg:hidden flex justify-between items-center">
                    <Link href="/dashboard">
                        <Image
                            src="/logos/salesense-vertical.png"
                            alt="Logo"
                            width={40}
                            height={40}
                            className="w-8"
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
                                <div className="flex items-center bg-gray-100 rounded-lg shadow-sm flex-grow mb-4">
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        className="py-3 px-4 rounded-l-lg bg-transparent outline-none w-full"
                                        value={inputValue}
                                        onChange={handleInputValueChange}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                handleSearch();
                                            }
                                        }}
                                    />
                                    <div className="py-2 px-4 text-black">
                                        <SearchIcon size={25} />
                                    </div>
                                    <div className="p-2 hover:bg-slate-100 text-black rounded-lg cursor-pointer flex items-center justify-center">
                                        <div className="relative">
                                            <button
                                                className="p-2 hover:bg-slate-100 text-black mx-2 rounded-lg cursor-pointer flex items-center justify-center"
                                                onClick={toggleFilterPopUp}
                                            >
                                                <SlidersHorizontal size={25} />
                                            </button>
                                            {filterPopUp && (
                                                <FilterOverlay
                                                    filterPopUp={filterPopUp}
                                                    setFilterPopUp={
                                                        setFilterPopUp
                                                    }
                                                    setFilteredProducts={
                                                        setFilteredProducts
                                                    }
                                                    toggleFilterPopUp={
                                                        toggleFilterPopUp
                                                    }
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col space-y-4">
                                    {links.map((link) => (
                                        <a
                                            key={link.href}
                                            href={link.href}
                                            className="flex items-center p-2 hover:bg-slate-100 text-black rounded-lg cursor-pointer"
                                        >
                                            {link.text}
                                        </a>
                                    ))}
                                </div>
                                <div className="flex justify-between p-2 mt-6">
                                    {businessDetails?.subscription && (
                                        <div
                                            className={`flex items-center gap-2 border px-2 py-0.5 rounded-full ml-1 ${
                                                businessDetails.usage
                                                    .isLimitReached
                                                    ? "bg-red-50 border-red-200"
                                                    : "bg-gray-50 border-gray-200"
                                            }`}
                                        >
                                            <div
                                                className={`h-1.5 w-1.5 rounded-full ${
                                                    businessDetails.usage
                                                        .isLimitReached
                                                        ? "bg-red-500 animate-pulse"
                                                        : "bg-green-500"
                                                }`}
                                            />
                                            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-tight">
                                                {
                                                    businessDetails.subscription
                                                        .plan
                                                }
                                            </span>
                                            {businessDetails.subscription
                                                .plan === "STARTER" && (
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
                    <SubscriptionChecker />
                    <SubscriptionWarningModal />
                    {children}
                </main>
            </div>
        </div>
    );
}

"use client";

import { show } from "@/store/slices/visibilitySlice";
import { SignedIn } from "@clerk/nextjs";
import {
    Bell,
    CheckCheck,
    Menu,
    Search as SearchIcon,
    ShoppingCart,
    SlidersHorizontal,
    Trash2,
    X,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import React, { useState } from "react";
import Image from "next/image";
import logo from "@/assets/Icon.png";
import { useDispatch } from "react-redux";
import CustomUserButton from "../CustomUserButton";
import NotificationCard from "../NotificationCard";
import Sidebar from "./Sidebar";
import Link from "next/link";

const links = [
    { href: "/dashboard", text: "Dashboard" },
    { href: "/products", text: "Products" },
    { href: "/invoices", text: "Invoices" },
    { href: "/products/list", text: "Product List" },
    { href: "/settings", text: "Settings" },
];

export default function Navbar({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const dispatch = useDispatch();
    const [showPopup, setShowPopup] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [notifications, setNotifications] = useState([
        { id: 1, isRead: false },
        { id: 2, isRead: true },
    ]);

    const togglePopup = () => {
        setShowPopup(!showPopup);
    };

    const markAsRead = (id: number) => {
        setNotifications((prevNotifications) =>
            prevNotifications.map((notification) =>
                notification.id === id
                    ? { ...notification, isRead: true }
                    : notification
            )
        );
    };

    const markAllAsRead = () => {
        setNotifications((prevNotifications) =>
            prevNotifications.map((notification) => ({
                ...notification,
                isRead: true,
            }))
        );
    };

    const deleteAllNotifications = () => {
        setNotifications([]);
    };

    const toggleSidebar = () => {
        if (pathname !== "/products") {
            router.push("/products");
            dispatch(show());
        } else {
            dispatch(show());
        }
    };

    const toggleMobileMenu = () => {
        setShowMobileMenu(!showMobileMenu);
    };

    return (
        <div className="flex h-screen overflow-hidden">
            <div className="fixed h-full">
                <Sidebar />
            </div>
            <div
                className="flex-grow lg:ml-20 flex flex-col"
                style={{ width: "calc(100% - 5rem)" }}
            >
                {/* Top navbar */}
                <div className="p-6 sticky top-0 right-0 z-10 bg-white shadow-sm lg:flex hidden">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center w-full">
                            <div className="flex items-center mx-4 bg-gray-100 rounded-lg shadow-sm flex-grow">
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="py-3 px-4 rounded-l-lg bg-transparent outline-none w-full"
                                />
                                <div className="py-2 px-4 text-black">
                                    <SearchIcon size={25} />
                                </div>
                            </div>
                            <div className="p-2 hover:bg-slate-100 text-black rounded-lg cursor-pointer flex items-center justify-center">
                                <SlidersHorizontal size={25} />
                            </div>
                        </div>

                        <div className="flex items-center">
                            <div className="relative">
                                <div
                                    className="p-2 hover:bg-slate-100 text-black mx-2 rounded-lg cursor-pointer flex items-center justify-center"
                                    onClick={togglePopup}
                                >
                                    <Bell size={25} />
                                </div>
                                {showPopup && (
                                    <div className="absolute min-w-[400px] top-full right-0 bg-white border border-gray-300 rounded-lg shadow-lg p-4 whitespace-nowrap overflow-hidden text-ellipsis">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg font-semibold">
                                                Notifications
                                            </h3>
                                            <div className="flex space-x-2">
                                                <CheckCheck
                                                    size={20}
                                                    className="cursor-pointer"
                                                    onClick={markAllAsRead}
                                                />
                                                <Trash2
                                                    size={20}
                                                    className=" cursor-pointer"
                                                    onClick={
                                                        deleteAllNotifications
                                                    }
                                                />
                                            </div>
                                        </div>
                                        {notifications.length === 0 ? (
                                            <p className="text-stone-400 mb-4">
                                                No new notifications
                                            </p>
                                        ) : (
                                            notifications.map(
                                                (notification) => (
                                                    <NotificationCard
                                                        key={notification.id}
                                                        isRead={
                                                            notification.isRead
                                                        }
                                                        notification={
                                                            notification
                                                        }
                                                        markAsRead={markAsRead}
                                                    />
                                                )
                                            )
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="p-2 text-black rounded-lg flex items-center gap-4 cursor-pointer">
                                <SignedIn>
                                    <CustomUserButton />
                                </SignedIn>
                            </div>

                            <div
                                className="p-2 hover:bg-slate-100 text-black mx-2 rounded-lg cursor-pointer flex items-center justify-center"
                                onClick={toggleSidebar}
                            >
                                <ShoppingCart size={25} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile navbar */}
                <div className="p-6 sticky top-0 right-0 z-10 bg-white shadow-sm lg:hidden flex justify-between items-center">
                    <div className="flex items-center">
                        <Link href="/">
                            <Image
                                src={logo}
                                alt="Logo"
                                className="w-10 rounded-full cursor-pointer"
                            />
                        </Link>
                    </div>
                    <div className="flex items-center">
                        <div className="relative">
                            <div
                                className="p-2 hover:bg-slate-100 text-black mx-2 rounded-lg cursor-pointer flex items-center justify-center"
                                onClick={togglePopup}
                            >
                                <Bell size={25} />
                            </div>
                            {showPopup && (
                                <div className="absolute min-w-[300px] top-full right-0 bg-white border border-gray-300 rounded-lg shadow-lg p-4 whitespace-nowrap overflow-hidden text-ellipsis">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-semibold">
                                            Notifications
                                        </h3>
                                        <div className="flex space-x-2">
                                            <CheckCheck
                                                size={20}
                                                className="cursor-pointer"
                                                onClick={markAllAsRead}
                                            />
                                            <Trash2
                                                size={20}
                                                className=" cursor-pointer"
                                                onClick={deleteAllNotifications}
                                            />
                                        </div>
                                    </div>
                                    {notifications.length === 0 ? (
                                        <p className="text-stone-400 mb-4">
                                            No new notifications
                                        </p>
                                    ) : (
                                        notifications.map((notification) => (
                                            <NotificationCard
                                                key={notification.id}
                                                isRead={notification.isRead}
                                                notification={notification}
                                                markAsRead={markAsRead}
                                            />
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                        <button
                            className="p-2 text-black rounded-lg cursor-pointer"
                            onClick={toggleMobileMenu}
                        >
                            {showMobileMenu ? (
                                <X size={25} />
                            ) : (
                                <Menu size={25} />
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
                                    />
                                    <div className="py-2 px-4 text-black">
                                        <SearchIcon size={25} />
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
                                <div className="flex justify-end p-2 mt-6">
                                    <SignedIn>
                                        <CustomUserButton />
                                    </SignedIn>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Body content goes here */}
                <div className="flex-grow px-10 py-1 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}

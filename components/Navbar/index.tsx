"use client";

import { show } from "@/store/slices/visibilitySlice";
import {
    Bell,
    Search as SearchIcon,
    ShoppingCart,
    SlidersHorizontal,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import Sidebar from "./Sidebar";
import { SignedIn } from "@clerk/nextjs";
import CustomUserButton from "../CustomUserButton";
import NotificationCard from "../NotificationCard";

export default function Navbar({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const dispatch = useDispatch();
    const [showPopup, setShowPopup] = useState(false);

    const togglePopup = () => {
        setShowPopup(!showPopup);
    };

    const toggleSidebar = () => {
        if (pathname !== "/products") {
            router.push("/products");
            dispatch(show());
        } else {
            dispatch(show());
        }
    };

    return (
        <div className="flex h-screen overflow-hidden">
            <div className="fixed h-full">
                <Sidebar />
            </div>
            <div
                className="flex-grow ml-20 flex flex-col"
                style={{ width: "calc(100% - 5rem)" }}
            >
                {/* Top navbar */}
                <div className="p-6 sticky top-0 right-0 z-10 bg-white shadow-sm">
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
                                    <div className="absolute top-full right-0 bg-white border border-gray-300 rounded-lg shadow-lg p-4 whitespace-nowrap overflow-hidden text-ellipsis">
                                        <p className="text-stone-400 hidden mb-4">
                                            No new notifications
                                        </p>
                                        <p className="text-stone-400 mb-4">
                                            New notifications
                                        </p>
                                        <NotificationCard isRead={false} />
                                        <NotificationCard isRead={true} />
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

                {/* Body content goes here */}
                <div className="flex-grow px-10 py-1 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}

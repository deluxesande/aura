"use client";

import { show } from "@/store/slices/visibilitySlice";
import {
    Bell,
    Search as SearchIcon,
    ShoppingCart,
    SlidersHorizontal,
} from "lucide-react";
import React from "react";
import { useDispatch } from "react-redux";
import Sidebar from "./Sidebar";

export default function Navbar({ children }: { children: React.ReactNode }) {
    const dispatch = useDispatch();

    const toggleSidebar = () => {
        dispatch(show());
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
                <div className="p-6 sticky top-0 right-0 z-10">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center w-full">
                            <div className="flex items-center mx-4 bg-white rounded-lg shadow-sm flex-grow">
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="py-3 px-4 rounded-l-lg focus:outline-none w-full"
                                />
                                <div className="py-2 px-4">
                                    <SearchIcon size={25} />
                                </div>
                            </div>
                            <div className="p-2 bg-white rounded-lg cursor-pointer flex items-center justify-center">
                                <SlidersHorizontal size={25} />
                            </div>
                        </div>

                        <div className="flex items-center">
                            <div className="p-2 bg-white mx-2 rounded-lg cursor-pointer flex items-center justify-center">
                                <Bell size={25} />
                            </div>

                            <div className="p-2 bg-white rounded-lg flex items-center gap-4 cursor-pointer">
                                <div className="w-8 h-8 rounded-full bg-red-500"></div>
                                <div className="w-28">
                                    <p className="font-bold text-sm">
                                        John Doe
                                    </p>
                                    <p className="font-light text-xs">Admin</p>
                                </div>
                            </div>

                            <div
                                className="p-2 bg-white mx-2 rounded-lg cursor-pointer flex items-center justify-center"
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

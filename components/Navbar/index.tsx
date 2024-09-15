import { Bell, SlidersHorizontal, Search as SearchIcon } from "lucide-react";
import React from "react";
import Sidebar from "./Sidebar";

export default function Navbar() {
    return (
        <div className="flex">
            <Sidebar />
            <div className="w-full p-6">
                <div className="flex items-center  justify-between gap-4">
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
                            <SlidersHorizontal size={30} />
                        </div>
                    </div>

                    <div className="flex items-center">
                        <div className="p-2 bg-white rounded-lg flex items-center gap-4 cursor-pointer">
                            <div className="w-8 h-8 rounded-full bg-red-500"></div>
                            <div className="w-28">
                                <p className="font-bold text-sm">John Doe</p>
                                <p className="font-light text-xs">Admin</p>
                            </div>
                        </div>
                        <div className="p-2 bg-white mx-4 rounded-lg cursor-pointer flex items-center justify-center">
                            <Bell size={30} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

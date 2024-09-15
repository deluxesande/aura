import { Bell } from "lucide-react";
import React from "react";

export default function Navbar() {
    return (
        <div className="p-6 bg-red-200">
            <div className="flex items-center  justify-between">
                <h1 className="text-2xl">LOGO</h1>
                <ul className="flex">
                    <li>
                        <a href="/" className="text-lg">
                            Home
                        </a>
                    </li>
                    <li>
                        <a href="/dashboard" className="text-lg ml-4">
                            Dashboard
                        </a>
                    </li>

                    <div className="p-2 bg-slate-50 rounded-lg">
                        <Bell />
                    </div>
                </ul>
            </div>
        </div>
    );
}

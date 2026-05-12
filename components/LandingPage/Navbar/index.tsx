"use client";

import { RootState } from "@/store/rootReducer";
import { ChevronDown, ChevronRight, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useSelector } from "react-redux";

export default function Navbar({
    isMenuOpen,
    setIsMenuOpen,
}: {
    isMenuOpen: boolean;
    setIsMenuOpen: (value: boolean) => void;
}) {
    const isSignedIn = useSelector((state: RootState) => state.auth.isSignedIn);
    const [isResourcesOpen, setIsResourcesOpen] = useState(false);

    return (
        <nav className="fixed w-full bg-white/90 backdrop-blur-md z-50 border-b border-gray-100 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* LOGO */}
                    <Link
                        href="/"
                        className="flex items-center hover:opacity-90 transition-opacity"
                    >
                        <Image
                            src="/logos/salesense-horizontal.png"
                            width={150}
                            height={40}
                            alt="SaleSense Logo"
                            className="hidden sm:block w-auto h-10"
                        />
                        <Image
                            src="/logos/salesense-vertical.png"
                            width={45}
                            height={45}
                            alt="SaleSense Logo"
                            className="block sm:hidden w-auto h-10"
                        />
                    </Link>

                    {/* DESKTOP NAVIGATION */}
                    <div className="hidden md:flex items-center space-x-1">
                        <Link
                            href="/features"
                            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-green-500 hover:bg-green-50 rounded-full transition-all"
                        >
                            Features
                        </Link>
                        <Link
                            href="/ai"
                            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-green-500 hover:bg-green-50 rounded-full transition-all"
                        >
                            AI
                        </Link>
                        <Link
                            href="/pricing"
                            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-green-500 hover:bg-green-50 rounded-full transition-all"
                        >
                            Pricing
                        </Link>
                        <Link
                            href="/integration"
                            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-green-500 hover:bg-green-50 rounded-full transition-all"
                        >
                            Integration
                        </Link>
                        <Link
                            href="/download"
                            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-green-500 hover:bg-green-50 rounded-full transition-all"
                        >
                            Download
                        </Link>

                        {/* RESOURCES DROPDOWN */}
                        <div
                            className="relative group px-2"
                            onMouseEnter={() => setIsResourcesOpen(true)}
                            onMouseLeave={() => setIsResourcesOpen(false)}
                        >
                            <button className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-600 group-hover:text-green-500 group-hover:bg-green-50 rounded-full transition-all outline-none">
                                Resources
                                <ChevronDown
                                    size={14}
                                    className={`transition-transform duration-200 group-hover:stroke-green-500 ${isResourcesOpen ? "rotate-180" : ""}`}
                                />
                            </button>

                            {/* Dropdown Menu */}
                            <div
                                className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden transition-all duration-200 origin-top ${isResourcesOpen ? "opacity-100 scale-100 translate-y-0 visible" : "opacity-0 scale-95 -translate-y-2 invisible"}`}
                            >
                                <div className="p-2 space-y-1">
                                    <Link
                                        href="/blog"
                                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-green-50 transition-colors group/item"
                                    >
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 group-hover/item:text-green-500">
                                                Blog
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Guides & Updates
                                            </p>
                                        </div>
                                    </Link>
                                    <Link
                                        href="/help-center"
                                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-green-50 transition-colors group/item"
                                    >
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 group-hover/item:text-green-500">
                                                Help Center
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                FAQs & Support
                                            </p>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <Link
                            href="/about"
                            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-green-500 hover:bg-green-50 rounded-full transition-all"
                        >
                            About
                        </Link>
                    </div>

                    {/* AUTH BUTTONS */}
                    <div className="hidden md:flex items-center space-x-4">
                        {!isSignedIn ? (
                            <>
                                <Link
                                    href="/sign-in"
                                    className="text-sm font-medium text-gray-600 hover:text-green-500 transition-colors"
                                >
                                    Sign in
                                </Link>
                                <Link
                                    href="/sign-up"
                                    className="bg-green-500 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-green-600 transition-all transform hover:-translate-y-0.5"
                                >
                                    Get Started
                                </Link>
                            </>
                        ) : (
                            <Link
                                href="/dashboard"
                                className="flex items-center gap-2 bg-green-50 text-green-500 px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-green-100 transition-all border border-green-100"
                            >
                                Dashboard
                                <ChevronRight
                                    size={16}
                                    className="stroke-green-500"
                                />
                            </Link>
                        )}
                    </div>

                    {/* MOBILE TOGGLE */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 text-gray-600 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* MOBILE MENU */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-lg h-screen">
                    <div className="px-4 pt-4 pb-20 space-y-2">
                        <Link
                            href="/features"
                            className="block px-4 py-3 rounded-lg text-base font-medium text-gray-600 hover:text-green-500 hover:bg-green-50 transition-colors"
                        >
                            Features
                        </Link>
                        <Link
                            href="/ai"
                            className="block px-4 py-3 rounded-lg text-base font-medium text-gray-600 hover:text-green-500 hover:bg-green-50 transition-colors"
                        >
                            AI
                        </Link>
                        <Link
                            href="/pricing"
                            className="block px-4 py-3 rounded-lg text-base font-medium text-gray-600 hover:text-green-500 hover:bg-green-50 transition-colors"
                        >
                            Pricing
                        </Link>
                        <Link
                            href="/integration"
                            className="block px-4 py-3 rounded-lg text-base font-medium text-gray-600 hover:text-green-500 hover:bg-green-50 transition-colors"
                        >
                            Integration
                        </Link>

                        <div className="border-t border-gray-100 my-2 pt-2">
                            <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                Resources
                            </p>
                            <Link
                                href="/blog"
                                className="flex items-center justify-between px-4 py-3 rounded-lg text-base font-medium text-gray-600 hover:text-green-500 hover:bg-green-50 transition-colors"
                            >
                                Blog
                            </Link>
                            <Link
                                href="/help-center"
                                className="block px-4 py-3 rounded-lg text-base font-medium text-gray-600 hover:text-green-500 hover:bg-green-50 transition-colors"
                            >
                                Help Center
                            </Link>
                        </div>

                        <Link
                            href="/about"
                            className="block px-4 py-3 rounded-lg text-base font-medium text-gray-600 hover:text-green-500 hover:bg-green-50 transition-colors"
                        >
                            About Us
                        </Link>

                        <div className="pt-4 mt-4 border-t border-gray-100 space-y-3">
                            {!isSignedIn ? (
                                <>
                                    <Link
                                        href="/sign-in"
                                        className="block w-full text-center px-4 py-3 rounded-lg text-base font-bold text-gray-600 hover:bg-gray-50 border border-gray-200"
                                    >
                                        Sign in
                                    </Link>
                                    <Link
                                        href="/sign-up"
                                        className="block w-full text-center px-4 py-3 rounded-lg text-base font-bold text-white bg-green-600 hover:bg-green-700 shadow-md"
                                    >
                                        Get Started
                                    </Link>
                                </>
                            ) : (
                                <Link
                                    href="/dashboard"
                                    className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg text-base font-bold text-white bg-green-500 hover:bg-green-600 shadow-md"
                                >
                                    Go to Dashboard
                                    <ChevronRight
                                        size={18}
                                        className="stroke-white"
                                    />
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}

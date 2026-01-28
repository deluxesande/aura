"use client";

import React, { useState } from "react";
import PrivacyModal from "@/components/modals/Privacy";
import TermsModal from "@/components/modals/Terms";
import Link from "next/link";

export default function Footer() {
    const [isTermsOpen, setIsTermsOpen] = useState(false);
    const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
    const currentYear = new Date().getFullYear();

    const modalVariants = {
        hidden: { opacity: 0, y: "-30%" },
        visible: {
            opacity: 1,
            y: "0%",
            transition: {
                duration: 0.4,
                staggerChildren: 0.3,
                ease: "easeInOut",
            },
        },
        exit: {
            opacity: 0,
            y: "-50%",
            transition: { duration: 0.6, ease: "easeInOut" },
        },
    };

    return (
        <footer className="relative bg-green-900 text-white overflow-hidden">
            {/* --- Background Design Elements --- */}
            <div className="absolute inset-0 pointer-events-none">
                {/* 1. Soft Glow Gradients (Depth) */}
                <div className="absolute -top-[50%] -left-[10%] w-[70%] h-[200%] rounded-full bg-green-900/20 blur-[100px]" />
                <div className="absolute bottom-0 right-0 w-[50%] h-[100%] bg-green-800/10 blur-[80px] rounded-full" />

                {/* 2. Flowing Lines (The new pattern) */}
                <svg
                    className="absolute inset-0 w-full h-full opacity-[0.03]"
                    viewBox="0 0 1440 400"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="none"
                >
                    <path
                        d="M0 400C230 400 340 300 500 300C660 300 780 400 1000 400C1220 400 1350 300 1440 300V0H0V400Z"
                        stroke="white"
                        strokeWidth="2"
                        className="opacity-20"
                    />
                    <path
                        d="M-100 450C130 450 240 250 400 250C560 250 680 450 900 450C1120 450 1250 250 1540 250V-50H-100V450Z"
                        stroke="white"
                        strokeWidth="1.5"
                        className="opacity-40"
                    />
                    <path
                        d="M0 200C200 200 300 100 500 100C700 100 900 300 1100 300C1300 300 1400 100 1440 100"
                        stroke="white"
                        strokeWidth="1"
                        fill="none"
                    />
                    <path
                        d="M0 150C250 150 350 50 600 50C850 50 950 250 1200 250C1450 250 1550 50 1600 50"
                        stroke="white"
                        strokeWidth="1"
                        fill="none"
                        className="opacity-60"
                    />
                </svg>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
                    {/* Column 1 */}
                    <div>
                        <h3 className="text-sm font-bold text-green-400 uppercase tracking-wider mb-6">
                            Product
                        </h3>
                        <ul className="space-y-4">
                            <li>
                                <Link
                                    href="/features"
                                    className="text-green-100/80 hover:text-white hover:pl-2 transition-all duration-300 block"
                                >
                                    Features
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/pricing"
                                    className="text-green-100/80 hover:text-white hover:pl-2 transition-all duration-300 block"
                                >
                                    Pricing
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/integration"
                                    className="text-green-100/80 hover:text-white hover:pl-2 transition-all duration-300 block"
                                >
                                    Integrations
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Column 2 */}
                    <div>
                        <h3 className="text-sm font-bold text-green-400 uppercase tracking-wider mb-6">
                            Company
                        </h3>
                        <ul className="space-y-4">
                            <li>
                                <Link
                                    href="/about"
                                    className="text-green-100/80 hover:text-white hover:pl-2 transition-all duration-300 block"
                                >
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="#"
                                    className="text-green-100/80 hover:text-white hover:pl-2 transition-all duration-300 block group"
                                >
                                    Careers
                                    <span className="ml-2 text-[10px] bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full border border-green-500/30 group-hover:bg-green-500 group-hover:text-white transition-colors">
                                        Hiring
                                    </span>
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Column 3 */}
                    <div>
                        <h3 className="text-sm font-bold text-green-400 uppercase tracking-wider mb-6">
                            Resources
                        </h3>
                        <ul className="space-y-4">
                            <li>
                                <Link
                                    href="/blog"
                                    className="text-green-100/80 hover:text-white hover:pl-2 transition-all duration-300 block"
                                >
                                    Blog
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/help-center"
                                    className="text-green-100/80 hover:text-white hover:pl-2 transition-all duration-300 block"
                                >
                                    Help Center
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/help-center/getting-started"
                                    className="text-green-100/80 hover:text-white hover:pl-2 transition-all duration-300 block"
                                >
                                    Guides
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Column 4 */}
                    <div>
                        <h3 className="text-sm font-bold text-green-400 uppercase tracking-wider mb-6">
                            Legal
                        </h3>
                        <ul className="space-y-4">
                            <li>
                                <button
                                    onClick={() => setIsPrivacyOpen(true)}
                                    className="text-green-100/80 hover:text-white text-left hover:pl-2 transition-all duration-300 block"
                                >
                                    Privacy Policy
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => setIsTermsOpen(true)}
                                    className="text-green-100/80 hover:text-white text-left hover:pl-2 transition-all duration-300 block"
                                >
                                    Terms & Conditions
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t border-green-800/30 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-green-400/60 text-sm text-center md:text-left font-light">
                        © {currentYear} SaleSense. Built for Kenyan Business.
                    </p>

                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-900/50 border border-green-800/50">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]"></div>
                        <span className="text-xs text-green-200 font-medium">
                            All Systems Operational
                        </span>
                    </div>
                </div>
            </div>

            {/* Terms and Conditions Modal */}
            {isTermsOpen && (
                <TermsModal
                    modalVariants={modalVariants}
                    setIsTermsOpen={setIsTermsOpen}
                />
            )}

            {/* Privacy Policy Modal */}
            {isPrivacyOpen && (
                <PrivacyModal
                    modalVariants={modalVariants}
                    setIsPrivacyOpen={setIsPrivacyOpen}
                />
            )}
        </footer>
    );
}

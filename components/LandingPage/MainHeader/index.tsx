"use client";

import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1,
        },
    },
};

const textVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.8, ease: "easeOut" },
    },
};

const dashboardVariants = {
    hidden: { opacity: 0, x: 30, rotateY: -10, scale: 0.95 },
    visible: {
        opacity: 1,
        x: 0,
        rotateY: 0,
        scale: 1,
        transition: { duration: 1, ease: [0.25, 0.1, 0.25, 1.0] },
    },
};

const itemPopVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
};

export default function MainHeader() {
    return (
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden bg-white">
            {/* Subtle background accent */}
            <div className="absolute top-0 right-0 w-[60%] h-[80%] bg-green-50/40 rounded-bl-[100px] -z-10 blur-3xl opacity-50" />

            <div className="max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* --- LEFT: Clean Text Content --- */}
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={containerVariants}
                        className="text-center lg:text-left z-10"
                    >
                        <motion.h1
                            className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6"
                            variants={textVariants}
                        >
                            Streamline Your Sales with
                            <br />
                            <span className="text-green-500 text-4xl sm:text-5xl md:text-6xl font-bold">
                                Kenyan Solutions
                            </span>
                        </motion.h1>
                        <motion.p
                            className="text-xl text-gray-600 mb-8 max-w-2xl"
                            variants={textVariants}
                        >
                            Seamlessly manage your sales with integrated M-Pesa
                            payments and KRA compliance. Built for Kenyan
                            businesses.
                        </motion.p>
                        <motion.div
                            className="flex flex-col w-full justify-start sm:flex-row gap-4 mb-16"
                            variants={textVariants}
                        >
                            {/* Primary CTA: Solid Color, Deep Colored Shadow, Tactile Lift */}
                            <Link
                                href="/sign-up"
                                className="group relative w-full md:w-auto"
                            >
                                <div className="relative z-10 w-full md:w-auto bg-green-500 text-white px-8 py-3.5 rounded-xl font-semibold shadow-[0_4px_14px_0_rgba(22,163,74,0.39)] hover:shadow-[0_6px_20px_rgba(22,163,74,0.23)] hover:bg-green-600 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center">
                                    Start Free Trial
                                    <ChevronRight
                                        className="ml-2 stroke-white transition-transform duration-300 group-hover:translate-x-1.5"
                                        size={20}
                                    />
                                </div>
                            </Link>

                            {/* Secondary CTA: Clean Outline with Subtle Tint on Hover */}
                            <Link
                                href="/features"
                                className="group w-full md:w-auto"
                            >
                                <div className="w-full md:w-auto bg-white text-gray-600 px-8 py-3.5 rounded-xl font-medium border border-gray-200 shadow-sm hover:text-green-700 hover:border-green-200 hover:bg-green-50/50 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center">
                                    Learn more
                                </div>
                            </Link>
                        </motion.div>
                    </motion.div>

                    {/* --- RIGHT: Simplified Abstract Dashboard Illustration --- */}
                    <motion.div
                        className="relative perspective-1000 w-full max-w-lg lg:max-w-none mx-auto"
                        initial="hidden"
                        animate="visible"
                        variants={dashboardVariants}
                    >
                        {/* Browser Window Container */}
                        <div className="relative z-10 bg-white rounded-xl shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden transform lg:rotate-y-6 hover:rotate-y-0 transition-transform duration-700 ease-out p-1">
                            {/* Fake Browser Toolbar */}
                            <div className="bg-gray-50 border-b border-gray-100 px-3 py-2 md:px-4 md:py-2.5 flex items-center gap-2 rounded-t-lg">
                                <div className="flex gap-1.5">
                                    <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-red-400/80" />
                                    <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-yellow-400/80" />
                                    <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-green-400/80" />
                                </div>
                            </div>

                            {/* Dashboard Body */}
                            <div className="flex bg-gray-50 h-[300px] md:h-[400px] lg:h-[450px] p-2 md:p-3 gap-2 md:gap-3">
                                {/* Sidebar (Hidden on mobile, visible on sm+) */}
                                <div className="hidden sm:flex w-12 lg:w-40 bg-white border border-gray-100 rounded-lg p-2 flex-col gap-2">
                                    <div className="h-5 lg:h-6 w-8 lg:w-16 bg-green-100 rounded-md mb-2 lg:mb-4 opacity-50"></div>
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <div
                                            key={i}
                                            className={`h-8 w-full rounded-md flex items-center justify-center lg:justify-start lg:px-2 ${i === 1 ? "bg-green-50 border border-green-100" : "opacity-40"}`}
                                        >
                                            <div
                                                className={`w-3 h-3 lg:w-4 lg:h-4 rounded-sm lg:mr-2 shrink-0 ${i === 1 ? "bg-green-500" : "bg-gray-300"}`}
                                            ></div>
                                            <div
                                                className={`hidden lg:block h-2 rounded-full ${i === 1 ? "w-12 bg-green-200" : "w-16 bg-gray-200"}`}
                                            ></div>
                                        </div>
                                    ))}
                                </div>

                                {/* Main Content Area */}
                                <div className="flex-1 flex flex-col gap-2 md:gap-3">
                                    {/* Top Stats Row */}
                                    <div className="grid grid-cols-3 gap-2 md:gap-3">
                                        {[1, 2, 3].map((i) => (
                                            <motion.div
                                                variants={itemPopVariants}
                                                key={i}
                                                className="bg-white p-2 md:p-3 rounded-lg border border-gray-100 shadow-sm flex flex-col justify-between h-16 md:h-24"
                                            >
                                                <div className="h-1.5 md:h-2 w-8 md:w-12 bg-gray-200 rounded-full mb-1 opacity-60"></div>
                                                <div className="h-3 md:h-5 w-12 md:w-20 bg-gray-800 rounded-md mb-1 opacity-80"></div>
                                                <div className="h-1 md:h-2 w-6 md:w-8 bg-green-100 rounded-full self-end"></div>
                                            </motion.div>
                                        ))}
                                    </div>

                                    {/* Main Chart Area */}
                                    <motion.div
                                        variants={itemPopVariants}
                                        className="flex-1 bg-white p-3 md:p-4 rounded-lg border border-gray-100 shadow-sm flex flex-col min-h-0" // min-h-0 allows flex child to shrink
                                    >
                                        <div className="flex justify-between mb-2 md:mb-4">
                                            <div className="h-2 md:h-3 w-16 md:w-24 bg-gray-200 rounded-full opacity-60"></div>
                                            <div className="h-3 md:h-4 w-8 md:w-10 bg-gray-100 rounded-md opacity-60"></div>
                                        </div>
                                        {/* SVG Line Chart */}
                                        <div className="flex-1 relative overflow-hidden flex items-end w-full">
                                            <svg
                                                viewBox="0 0 400 150"
                                                className="w-full h-full max-h-[120px] md:max-h-none"
                                                preserveAspectRatio="none"
                                            >
                                                <defs>
                                                    <linearGradient
                                                        id="cleanGradient"
                                                        x1="0"
                                                        y1="0"
                                                        x2="0"
                                                        y2="1"
                                                    >
                                                        <stop
                                                            offset="0%"
                                                            stopColor="#22c55e"
                                                            stopOpacity="0.15"
                                                        />
                                                        <stop
                                                            offset="100%"
                                                            stopColor="#22c55e"
                                                            stopOpacity="0"
                                                        />
                                                    </linearGradient>
                                                </defs>
                                                <path
                                                    d="M0,120 C80,100 120,40 200,50 C280,60 320,20 400,30 V150 H0 Z"
                                                    fill="url(#cleanGradient)"
                                                />
                                                <path
                                                    d="M0,120 C80,100 120,40 200,50 C280,60 320,20 400,30"
                                                    fill="none"
                                                    stroke="#22c55e"
                                                    strokeWidth="3"
                                                    strokeLinecap="round"
                                                />
                                            </svg>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        </div>

                        {/* Decorative BG element */}
                        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[200px] md:w-[400px] h-[200px] md:h-[400px] bg-gradient-to-tr from-green-100/30 to-transparent rounded-full blur-3xl -z-10" />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

"use client";

import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

// --- Animation Variants ---
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
                            <span className="text-green-600 text-4xl sm:text-5xl md:text-6xl font-bold">
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
                            <a
                                href="/sign-up"
                                className="w-full md:w-auto lg:w-auto bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                            >
                                Start Free Trial{" "}
                                <motion.span variants={itemPopVariants}>
                                    <ChevronRight
                                        color="#fff"
                                        className="ml-2"
                                        size={18}
                                    />
                                </motion.span>
                            </a>
                            <a
                                href="/features"
                                className="w-full md:w-auto lg:w-auto border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                            >
                                Learn more
                            </a>
                        </motion.div>
                    </motion.div>

                    {/* --- RIGHT: Simplified Abstract Dashboard Illustration --- */}
                    <motion.div
                        className="relative perspective-1000"
                        initial="hidden"
                        animate="visible"
                        variants={dashboardVariants}
                    >
                        {/* Browser Window Container */}
                        <div className="relative z-10 bg-white rounded-xl shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden transform rotate-y-6 hover:rotate-y-0 transition-transform duration-700 ease-out p-1">
                            {/* Fake Browser Toolbar */}
                            <div className="bg-gray-50 border-b border-gray-100 px-4 py-2.5 flex items-center gap-2 rounded-t-lg">
                                <div className="flex gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                                </div>
                            </div>

                            {/* Dashboard Body */}
                            <div className="flex bg-gray-50 h-[400px] lg:h-[450px] p-3 gap-3">
                                {/* Sidebar (Abstract) */}
                                <div className="w-12 lg:w-40 bg-white border border-gray-100 rounded-lg p-2 flex flex-col gap-2 sm:flex">
                                    <div className="h-6 w-16 bg-green-100 rounded-md mb-4 opacity-50"></div>
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <div
                                            key={i}
                                            className={`h-8 w-full rounded-md flex items-center px-2 ${i === 1 ? "bg-green-50 border border-green-100" : "opacity-40"}`}
                                        >
                                            <div
                                                className={`w-4 h-4 rounded-sm mr-2 ${i === 1 ? "bg-green-500" : "bg-gray-300"}`}
                                            ></div>
                                            <div
                                                className={`h-2 rounded-full ${i === 1 ? "w-12 bg-green-200" : "w-16 bg-gray-200"}`}
                                            ></div>
                                        </div>
                                    ))}
                                </div>

                                {/* Main Content Area */}
                                <div className="flex-1 flex flex-col gap-3">
                                    {/* Top Stats Row (Abstract) */}
                                    <div className="grid grid-cols-3 gap-3">
                                        {[1, 2, 3].map((i) => (
                                            <motion.div
                                                variants={itemPopVariants}
                                                key={i}
                                                className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm flex flex-col justify-between h-24"
                                            >
                                                <div className="h-2 w-12 bg-gray-200 rounded-full mb-3 opacity-60"></div>
                                                <div className="h-5 w-20 bg-gray-800 rounded-md mb-2 opacity-80"></div>
                                                <div className="h-2 w-8 bg-green-100 rounded-full self-end"></div>
                                            </motion.div>
                                        ))}
                                    </div>

                                    {/* Main Chart Area (Abstract Line) */}
                                    <motion.div
                                        variants={itemPopVariants}
                                        className="flex-1 bg-white p-4 rounded-lg border border-gray-100 shadow-sm flex flex-col"
                                    >
                                        <div className="flex justify-between mb-4">
                                            <div className="h-3 w-24 bg-gray-200 rounded-full opacity-60"></div>
                                            <div className="h-4 w-10 bg-gray-100 rounded-md opacity-60"></div>
                                        </div>
                                        {/* Abstract SVG Line Chart */}
                                        <div className="flex-1 relative overflow-hidden flex items-end">
                                            <svg
                                                viewBox="0 0 400 150"
                                                className="w-full h-3/4"
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

                        {/* Decorative BG element behind dashboard */}
                        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-tr from-green-100/30 to-transparent rounded-full blur-3xl -z-10" />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

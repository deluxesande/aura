"use client";

import { motion, useInView } from "framer-motion";
import {
    BarChart3,
    HandCoins,
    ShieldCheck,
    CheckCircle2,
    ArrowRight,
} from "lucide-react";
import { useRef } from "react";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            duration: 0.6,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: "easeOut" },
    },
};

export default function WhySalesense() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <motion.section
            ref={ref}
            className="py-24 bg-gray-50"
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={containerVariants}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    className="text-center mb-16"
                    variants={itemVariants}
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                        Why Choose SaleSense?
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Everything you need to run your business efficiently in
                        one platform.
                    </p>
                </motion.div>

                {/* BENTO GRID LAYOUT */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(280px,auto)]">
                    {/* Card 1: M-Pesa (Wide) */}
                    <motion.div
                        variants={itemVariants}
                        className="md:col-span-2 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
                    >
                        <div className="relative z-10 max-w-sm">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                                <HandCoins
                                    className="stroke-green-500"
                                    size={24}
                                />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                M-Pesa Integration
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Seamless payment processing with automatic
                                reconciliation. Funds settle directly to your
                                Paybill—we don&apos;t touch your money.
                            </p>
                        </div>

                        {/* Abstract UI: Transaction List */}
                        <div className="absolute top-10 -right-10 w-72 bg-gray-50 rounded-lg p-4 border border-gray-100 shadow-sm transform rotate-6 group-hover:rotate-3 transition-transform duration-500 hidden sm:block">
                            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
                                <span className="text-xs font-bold text-gray-400 uppercase">
                                    Recent Transactions
                                </span>
                            </div>
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between bg-white p-2 rounded-lg border border-gray-100 shadow-sm"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-[10px] font-bold text-green-500">
                                                MP
                                            </div>
                                            <div className="flex flex-col">
                                                <div className="h-2 w-16 bg-gray-200 rounded-full mb-1"></div>
                                                <div className="h-1.5 w-10 bg-gray-100 rounded-full"></div>
                                            </div>
                                        </div>
                                        <span className="text-xs font-bold text-green-500">
                                            + KES 500
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Card 2: KRA Compliance (Tall) */}
                    <motion.div
                        variants={itemVariants}
                        className="md:row-span-2 bg-green-100 rounded-3xl p-8 border border-green-100 relative overflow-hidden flex flex-col justify-between group"
                    >
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-6 shadow-sm text-green-500">
                                <ShieldCheck
                                    size={24}
                                    className="stroke-green-500"
                                />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                KRA Compliance
                            </h3>
                            <p className="text-green-800 mb-6 leading-relaxed">
                                Automated tax calculations and filing. We
                                generate your monthly returns so you never miss
                                a deadline.
                            </p>
                            <ul className="space-y-3">
                                {[
                                    "Auto-calculated Tax",
                                    "One-click Filing",
                                    "Audit-ready Reports",
                                ].map((item, i) => (
                                    <li
                                        key={i}
                                        className="flex items-center gap-2 text-sm font-medium"
                                    >
                                        <CheckCircle2
                                            size={16}
                                            className="stroke-green-500"
                                        />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Abstract Shield Decoration */}
                        <ShieldCheck className="absolute -bottom-10 -right-10 stroke-green-300 w-64 h-64 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                    </motion.div>

                    {/* Card 3: Business Insights (Wide) */}
                    <motion.div
                        variants={itemVariants}
                        className="md:col-span-2 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
                    >
                        <div className="flex flex-col md:flex-row gap-8 items-center">
                            <div className="flex-1 relative z-10">
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                                    <BarChart3
                                        className="stroke-green-500"
                                        size={24}
                                    />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                    Business Insights
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    Gain valuable clarity on your performance.
                                    Track top-selling products, peak hours, and
                                    monthly growth trends.
                                </p>
                            </div>

                            {/* Abstract UI: Chart */}
                            <div className="flex-1 w-full relative h-40">
                                <div className="absolute inset-0 bg-gray-50 rounded-lg border border-gray-100 p-4 flex flex-col justify-end gap-2 group-hover:translate-y-1 transition-transform duration-500">
                                    <div className="flex justify-between items-end h-full gap-2 px-2">
                                        <div className="w-full bg-green-200 rounded-t-md h-[40%] group-hover:h-[45%] transition-all duration-700"></div>
                                        <div className="w-full bg-green-300 rounded-t-md h-[65%] group-hover:h-[70%] transition-all duration-700 delay-75"></div>
                                        <div className="w-full bg-green-400 rounded-t-md h-[50%] group-hover:h-[55%] transition-all duration-700 delay-100"></div>
                                        <div className="w-full bg-green-500 rounded-t-md h-[85%] group-hover:h-[90%] transition-all duration-700 delay-150"></div>
                                        <div className="w-full bg-green-300 rounded-t-md h-[60%] group-hover:h-[65%] transition-all duration-700 delay-200"></div>
                                    </div>
                                    <div className="h-[1px] w-full bg-gray-200"></div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.section>
    );
}

"use client";
import Footer from "@/components/LandingPage/Footer";
import Navbar from "@/components/LandingPage/Navbar";
import { Check, X } from "lucide-react";
import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { isTauri } from "@/utils/tauri";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2,
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

    const isPricingInView = useInView(pricingRef, { once: true });

    if (isTauri()) return null;

    return (
        <div>
            <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

            {/* Hero Section */}
            <motion.section
                ref={heroRef}
                className="bg-gray-50 py-20"
                initial="hidden"
                animate={isHeroInView ? "visible" : "hidden"}
                variants={containerVariants}
            >
                <div className="max-w-7xl mx-auto pt-16 px-4 sm:px-6 lg:px-8">
                    <motion.div className="text-center" variants={itemVariants}>
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                            Fair Pricing for Every Stage <br />
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Connect your own M-Pesa Paybill directly. We handle
                            the receipts, inventory, and monthly KRA returns
                            automatically.
                        </p>
                    </motion.div>
                </div>
            </motion.section>

            {/* Pricing Cards */}
            <motion.section
                ref={pricingRef}
                className="py-20"
                initial="hidden"
                animate={isPricingInView ? "visible" : "hidden"}
                variants={containerVariants}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        className="grid md:grid-cols-3 gap-8"
                        variants={containerVariants}
                    >
                        {/* STARTER TIER */}
                        <motion.div
                            className="border border-gray-100 bg-white rounded-lg p-8 hover:border-green-200 transition-all shadow-sm hover:shadow-md"
                            variants={itemVariants}
                        >
                            <div className="text-center mb-8">
                                <h3 className="text-xl font-semibold mb-2 text-gray-900">
                                    Starter
                                </h3>
                                <div className="text-4xl font-bold mb-4 text-gray-900">
                                    Free
                                </div>
                                <p className="text-gray-500 text-sm">
                                    For side hustles just getting started
                                </p>
                            </div>
                            <ul className="space-y-4 mb-8 text-sm">
                                <li className="flex items-center text-gray-700">
                                    <Check
                                        className="text-green-500 mr-3 shrink-0"
                                        size={20}
                                    />
                                    <span>
                                        Connect{" "}
                                        <strong>Your Own Paybill</strong>
                                    </span>
                                </li>
                                <li className="flex items-center text-gray-700">
                                    <Check
                                        className="text-green-500 mr-3 shrink-0"
                                        size={20}
                                    />
                                    <span>1 Staff Account</span>
                                </li>
                                <li className="flex items-center text-gray-700">
                                    <Check
                                        className="text-green-500 mr-3 shrink-0"
                                        size={20}
                                    />
                                    <span>Max 100 Transactions/mo</span>
                                </li>
                                <li className="flex items-start text-gray-700">
                                    <Check
                                        className="text-green-500 mr-3 shrink-0"
                                        size={20}
                                    />
                                    <div className="flex flex-col">
                                        <span>Auto-Filing Only</span>
                                        <span className="text-xs text-gray-500 mt-0.5">
                                            Automatic monthly Sales returns
                                        </span>
                                    </div>
                                </li>
                                <li className="flex items-center text-gray-400">
                                    <X className="mr-3 shrink-0" size={20} />
                                    <span>No Data Export</span>
                                </li>
                            </ul>
                            <a
                                href="/sign-up"
                                className="block w-full text-center py-3 border border-green-200 text-green-500 font-semibold rounded-lg hover:bg-green-50 transition-colors"
                            >
                                Start Free
                            </a>
                        </motion.div>

                        {/* STANDARD TIER */}
                        <motion.div
                            className="border-2 border-green-500 rounded-lg p-8 relative bg-white shadow-xl scale-105 z-10"
                            variants={itemVariants}
                        >
                            <div className="absolute top-0 right-0 left-0 mx-auto w-32 -mt-4 bg-green-500 text-white text-center py-1 rounded-full text-sm font-bold shadow-sm">
                                Most Popular
                            </div>
                            <div className="text-center mb-8 pt-4">
                                <h3 className="text-xl font-semibold mb-2 text-gray-900">
                                    Standard
                                </h3>
                                <div className="text-4xl font-bold mb-4 text-gray-900">
                                    KSh 1,000
                                    <span className="text-gray-400 text-base font-normal">
                                        /mo
                                    </span>
                                </div>
                                <p className="text-gray-500 text-sm">
                                    For growing shops & hardware stores
                                </p>
                            </div>
                            <ul className="space-y-4 mb-8 text-sm">
                                <li className="flex items-center text-gray-900 font-medium">
                                    <Check
                                        className="text-green-500 mr-3 shrink-0"
                                        size={20}
                                    />
                                    <span>
                                        <strong>Unlimited</strong> Transactions
                                    </span>
                                </li>
                                <li className="flex items-center text-gray-900 font-medium">
                                    <Check
                                        className="text-green-500 mr-3 shrink-0"
                                        size={20}
                                    />
                                    <span>5 Staff Accounts</span>
                                </li>
                                <li className="flex items-center text-gray-900 font-medium">
                                    <Check
                                        className="text-green-500 mr-3 shrink-0"
                                        size={20}
                                    />
                                    <span>Connect Your Own Paybill</span>
                                </li>
                                <li className="flex items-start text-gray-900 font-medium">
                                    <Check
                                        className="text-green-500 mr-3 shrink-0"
                                        size={20}
                                    />
                                    <div className="flex flex-col">
                                        <span>Auto-Filing Included</span>
                                        <span className="text-xs text-gray-500 mt-0.5 font-normal">
                                            Automated monthly submission
                                        </span>
                                    </div>
                                </li>
                                <li className="flex items-center text-gray-500">
                                    <Check
                                        className="text-gray-400 mr-3 shrink-0"
                                        size={20}
                                    />
                                    <span>Salesense Branded Receipts</span>
                                </li>
                            </ul>
                            <a
                                href="/sign-up?plan=standard"
                                className="block w-full text-center py-3.5 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-colors shadow-lg shadow-green-200"
                            >
                                Get Started
                            </a>
                        </motion.div>

                        {/* PREMIUM TIER */}
                        <motion.div
                            className="border border-gray-100 bg-white rounded-lg p-8 hover:border-green-200 transition-all shadow-sm hover:shadow-md"
                            variants={itemVariants}
                        >
                            <div className="text-center mb-8">
                                <h3 className="text-xl font-semibold mb-2 text-gray-900">
                                    Premium
                                </h3>
                                <div className="text-4xl font-bold mb-4 text-gray-900">
                                    KSh 1,500
                                    <span className="text-gray-400 text-base font-normal">
                                        /mo
                                    </span>
                                </div>
                                <p className="text-gray-500 text-sm">
                                    For businesses that need full control
                                </p>
                            </div>
                            <ul className="space-y-4 mb-8 text-sm">
                                <li className="flex items-center text-gray-700">
                                    <Check
                                        className="text-green-500 mr-3 shrink-0"
                                        size={20}
                                    />
                                    <span>Unlimited Staff & Transactions</span>
                                </li>
                                <li className="flex items-center text-gray-700">
                                    <Check
                                        className="text-green-500 mr-3 shrink-0"
                                        size={20}
                                    />
                                    <span>
                                        Remove &quot;Powered by Salesense&quot;
                                    </span>
                                </li>
                                <li className="flex items-center text-gray-700">
                                    <Check
                                        className="text-green-500 mr-3 shrink-0"
                                        size={20}
                                    />
                                    <span>Full Excel/CSV Data Export</span>
                                </li>
                                <li className="flex items-start text-gray-700">
                                    <Check
                                        className="text-green-500 mr-3 shrink-0"
                                        size={20}
                                    />
                                    <div className="flex flex-col">
                                        <span>Advanced Filing Control</span>
                                        <span className="text-xs text-gray-500 mt-0.5">
                                            Manual review before submission
                                        </span>
                                    </div>
                                </li>
                                <li className="flex items-center text-gray-700">
                                    <Check
                                        className="text-green-500 mr-3 shrink-0"
                                        size={20}
                                    />
                                    <span>Priority Phone Support</span>
                                </li>
                            </ul>
                            <a
                                href="/sign-up?plan=premium"
                                className="block w-full text-center py-3 border border-gray-200 text-gray-600 font-semibold rounded-lg hover:border-green-500 hover:text-green-500 transition-colors"
                            >
                                Get Premium
                            </a>
                        </motion.div>
                    </motion.div>
                </div>
            </motion.section>

            {/* Comparison Table */}
            <motion.section
                className="py-20 bg-white"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={containerVariants}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        className="text-center mb-16"
                        variants={itemVariants}
                    >
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Compare Plans
                        </h2>
                        <p className="text-gray-600">
                            Choose the perfect fit for your business needs
                        </p>
                    </motion.div>

                    <motion.div
                        className="overflow-x-auto border border-gray-100 rounded-lg shadow-sm"
                        variants={itemVariants}
                    >
                        <table className="w-full text-left border-collapse bg-white">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="py-8 px-6 text-sm font-semibold text-gray-900 bg-gray-50/50">
                                        Features
                                    </th>
                                    <th className="py-8 px-6 text-center text-sm font-bold text-gray-900 bg-green-50/10 border-t-4 border-green-500">
                                        Starter
                                    </th>
                                    <th className="py-8 px-6 text-center text-sm font-bold text-green-500 bg-green-50/30 border-t-4 border-green-500">
                                        Standard
                                    </th>
                                    <th className="py-8 px-6 text-center text-sm font-bold text-gray-900 bg-green-50/10 border-t-4 border-green-500">
                                        Premium
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {/* Core Features */}
                                <tr>
                                    <td
                                        className="py-5 px-6 text-sm font-bold text-green-500 bg-green-50/50 border-l-4 border-green-500 uppercase tracking-wider"
                                        colSpan={4}
                                    >
                                        Core Features
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-4 px-6 text-sm text-gray-700">
                                        M-Pesa Paybill Integration
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <Check
                                            className="mx-auto text-green-500"
                                            size={18}
                                        />
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <Check
                                            className="mx-auto text-green-500"
                                            size={18}
                                        />
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <Check
                                            className="mx-auto text-green-500"
                                            size={18}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-4 px-6 text-sm text-gray-700">
                                        Transactions per month
                                    </td>
                                    <td className="py-4 px-6 text-center text-sm text-gray-600">
                                        Up to 100
                                    </td>
                                    <td className="py-4 px-6 text-center text-sm text-gray-900 font-medium">
                                        Unlimited
                                    </td>
                                    <td className="py-4 px-6 text-center text-sm text-gray-900 font-medium">
                                        Unlimited
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-4 px-6 text-sm text-gray-700">
                                        Staff Accounts
                                    </td>
                                    <td className="py-4 px-6 text-center text-sm text-gray-600">
                                        1 Account
                                    </td>
                                    <td className="py-4 px-6 text-center text-sm text-gray-900 font-medium">
                                        5 Accounts
                                    </td>
                                    <td className="py-4 px-6 text-center text-sm text-gray-900 font-medium">
                                        Unlimited
                                    </td>
                                </tr>

                                {/* Automation */}
                                <tr>
                                    <td
                                        className="py-5 px-6 text-sm font-bold text-green-500 bg-green-50/50 border-l-4 border-green-500 uppercase tracking-wider"
                                        colSpan={4}
                                    >
                                        Automation & Tax
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-4 px-6 text-sm text-gray-700">
                                        Auto-Filing (Monthly Sales)
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <Check
                                            className="mx-auto text-green-500"
                                            size={18}
                                        />
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <Check
                                            className="mx-auto text-green-500"
                                            size={18}
                                        />
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <Check
                                            className="mx-auto text-green-500"
                                            size={18}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-4 px-6 text-sm text-gray-700">
                                        Advanced Filing Review
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <X
                                            className="mx-auto text-gray-300"
                                            size={18}
                                        />
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <X
                                            className="mx-auto text-gray-300"
                                            size={18}
                                        />
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <Check
                                            className="mx-auto text-green-500"
                                            size={18}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-4 px-6 text-sm text-gray-700">
                                        Inventory Management
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <Check
                                            className="mx-auto text-green-500"
                                            size={18}
                                        />
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <Check
                                            className="mx-auto text-green-500"
                                            size={18}
                                        />
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <Check
                                            className="mx-auto text-green-500"
                                            size={18}
                                        />
                                    </td>
                                </tr>

                                {/* Branding & Support */}
                                <tr>
                                    <td
                                        className="py-5 px-6 text-sm font-bold text-green-500 bg-green-50/50 border-l-4 border-green-500 uppercase tracking-wider"
                                        colSpan={4}
                                    >
                                        Branding & Data
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-4 px-6 text-sm text-gray-700">
                                        Data Export (Excel/CSV)
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <X
                                            className="mx-auto text-gray-300"
                                            size={18}
                                        />
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <X
                                            className="mx-auto text-gray-300"
                                            size={18}
                                        />
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <Check
                                            className="mx-auto text-green-500"
                                            size={18}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-4 px-6 text-sm text-gray-700">
                                        Custom Receipt Branding
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <X
                                            className="mx-auto text-gray-300"
                                            size={18}
                                        />
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <X
                                            className="mx-auto text-gray-300"
                                            size={18}
                                        />
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <Check
                                            className="mx-auto text-green-500"
                                            size={18}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-4 px-6 text-sm text-gray-700">
                                        Priority Support
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        Email
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        Email + Chat
                                    </td>
                                    <td className="py-4 px-6 text-center font-medium">
                                        Priority Phone
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </motion.div>
                </div>
            </motion.section>

            <Footer />
        </div>
    );
}

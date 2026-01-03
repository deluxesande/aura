"use client";
import Footer from "@/components/LandingPage/Footer";
import Navbar from "@/components/LandingPage/Navbar";
import { Check, X, AlertCircle } from "lucide-react";
import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";

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

export default function PricingPage() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const heroRef = useRef(null);
    const pricingRef = useRef(null);

    const isHeroInView = useInView(heroRef, { once: true });
    const isPricingInView = useInView(pricingRef, { once: true });

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
                        <h1 className="text-4xl font-bold text-gray-900 mb-6">
                            Fair Pricing for Every Stage
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Start for free, upgrade as you grow. No hidden
                            charges.
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
                        {/* Free Tier */}
                        <motion.div
                            className="border border-gray-100 bg-white rounded-2xl p-8 hover:border-green-200 transition-colors"
                            variants={itemVariants}
                        >
                            <div className="text-center mb-8">
                                <h3 className="text-xl font-semibold mb-2">
                                    Starter
                                </h3>
                                <div className="text-4xl font-bold mb-4">
                                    Free
                                </div>
                                <p className="text-gray-600 text-sm">
                                    Perfect for side hustles & small dukas
                                </p>
                            </div>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center text-gray-600">
                                    <Check
                                        className="text-green-600 mr-3 shrink-0"
                                        size={20}
                                    />
                                    <span>1 User </span>
                                </li>
                                <li className="flex items-center text-gray-500 text-sm">
                                    <Check
                                        className="text-gray-400 mr-3 shrink-0"
                                        size={20}
                                    />
                                    <span>Salesense Branded Receipts</span>
                                </li>
                                <li className="flex items-center text-gray-400 text-sm">
                                    <AlertCircle
                                        className="text-gray-400 mr-3.5 shrink-0"
                                        size={18}
                                    />
                                    <span>Use Salesense Paybill</span>
                                </li>
                                <li className="flex items-center text-gray-400 text-sm">
                                    <AlertCircle
                                        className="text-gray-400 mr-3.5 shrink-0"
                                        size={18}
                                    />
                                    <span>Max 100 Transactions/mo</span>
                                </li>
                                <li className="flex items-center text-gray-400 text-sm">
                                    <AlertCircle
                                        className="mr-3.5 shrink-0"
                                        size={18}
                                    />
                                    <span>2% Transaction Fee</span>
                                </li>
                                <li className="flex items-center text-gray-400 text-sm">
                                    <X className="mr-3 shrink-0" size={20} />
                                    <span>No Data Export</span>
                                </li>
                            </ul>
                            <a
                                href="/sign-up"
                                className="block w-full text-center py-3 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
                            >
                                Start Free
                            </a>
                        </motion.div>

                        {/* Standard Plan (1,000 KSh) */}
                        <motion.div
                            className="border-2 border-green-600 rounded-2xl p-8 relative bg-white shadow-xl scale-105 z-10"
                            variants={itemVariants}
                        >
                            <div className="absolute top-0 right-0 left-0 mx-auto w-32 -mt-4 bg-green-600 text-white text-center py-1 rounded-full text-sm font-medium">
                                Most Popular
                            </div>
                            <div className="text-center mb-8 pt-4">
                                <h3 className="text-xl font-semibold mb-2">
                                    Standard
                                </h3>
                                <div className="text-4xl font-bold mb-4">
                                    KSh 1,000
                                    <span className="text-gray-500 text-base font-normal">
                                        /mo
                                    </span>
                                </div>
                                <p className="text-gray-600 text-sm">
                                    For busy hardware stores & cafes
                                </p>
                            </div>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center text-gray-900 font-bold">
                                    <Check
                                        className="text-green-600 mr-3 shrink-0"
                                        size={20}
                                    />
                                    <span>Unlimited Transactions</span>
                                </li>
                                <li className="flex items-center text-gray-900 font-medium">
                                    <Check
                                        className="text-green-600 mr-3 shrink-0"
                                        size={20}
                                    />
                                    <span>5 Staff Accounts</span>
                                </li>
                                <li className="flex items-center text-gray-900 font-medium">
                                    <Check
                                        className="mr-3 shrink-0"
                                        size={20}
                                    />
                                    <span>0% Commission (Keep 100%)</span>
                                </li>
                                <li className="flex items-center text-gray-900 font-medium">
                                    <Check
                                        className="text-green-600 mr-3 shrink-0"
                                        size={20}
                                    />
                                    <span>Connect YOUR Own Paybill</span>
                                </li>
                                <li className="flex items-center text-gray-500 text-sm">
                                    <Check
                                        className="text-gray-400 mr-3 shrink-0"
                                        size={20}
                                    />
                                    {/* Still branded on Standard - pushes them to Premium */}
                                    <span>Salesense Branded Receipts</span>
                                </li>
                                <li className="flex items-center text-gray-600">
                                    <Check
                                        className="text-green-600 mr-3 shrink-0"
                                        size={20}
                                    />
                                    <span>PDF Reports</span>
                                </li>
                            </ul>
                            <a
                                href="/sign-up?plan=standard"
                                className="block w-full text-center py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
                            >
                                Get Started
                            </a>
                        </motion.div>

                        {/* Premium Plan (1,500 KSh) */}
                        <motion.div
                            className="border border-gray-100 bg-white rounded-2xl p-8 hover:border-green-200 transition-colors"
                            variants={itemVariants}
                        >
                            <div className="text-center mb-8">
                                <h3 className="text-xl font-semibold mb-2">
                                    Premium
                                </h3>
                                <div className="text-4xl font-bold mb-4">
                                    KSh 1,500
                                    <span className="text-gray-500 text-base font-normal">
                                        /mo
                                    </span>
                                </div>
                                <p className="text-gray-600 text-sm">
                                    For shops that need data & scaling
                                </p>
                            </div>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center text-gray-900 font-bold">
                                    <Check
                                        className="text-green-600 mr-3 shrink-0"
                                        size={20}
                                    />
                                    <span>Unlimited Transactions</span>
                                </li>
                                <li className="flex items-center text-gray-600">
                                    <Check
                                        className="text-green-600 mr-3 shrink-0"
                                        size={20}
                                    />
                                    <span>Unlimited Staff Accounts</span>
                                </li>
                                <li className="flex items-center text-gray-900 font-medium">
                                    <Check
                                        className="text-green-600 mr-3 shrink-0"
                                        size={20}
                                    />
                                    <span>Connect YOUR Own Paybill</span>
                                </li>
                                <li className="flex items-center text-gray-900 font-bold">
                                    <Check
                                        className="text-green-600 mr-3 shrink-0"
                                        size={20}
                                    />
                                    <span>Custom Receipt Branding</span>
                                </li>
                                <li className="flex items-center text-gray-600">
                                    <Check
                                        className="text-green-600 mr-3 shrink-0"
                                        size={20}
                                    />
                                    <span>Full Excel/CSV Data Export</span>
                                </li>
                                <li className="flex items-center text-gray-600">
                                    <Check
                                        className="text-green-600 mr-3 shrink-0"
                                        size={20}
                                    />
                                    <span>Priority Support</span>
                                </li>
                            </ul>
                            <a
                                href="/sign-up?plan=premium"
                                className="block w-full text-center py-3 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
                            >
                                Get Premium
                            </a>
                        </motion.div>
                    </motion.div>
                </div>
            </motion.section>

            <Footer />
        </div>
    );
}

"use client";
import Footer from "@/components/LandingPage/Footer";
import Navbar from "@/components/LandingPage/Navbar";
import { Check } from "lucide-react";
import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2, // Stagger animations for child elements
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 }, // Start slightly below and invisible
    visible: {
        opacity: 1,
        y: 0, // Slide up into place
        transition: { duration: 0.6, ease: "easeOut" },
    },
};

export default function PricingPage() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Refs for sections
    const heroRef = useRef(null);
    const pricingRef = useRef(null);

    // Track visibility
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
                            Simple, Transparent Pricing
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Choose the perfect plan for your business needs
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
                        {/* Starter Plan */}
                        <motion.div
                            className="border border-gray-100 rounded-2xl p-8 hover:border-green-200 transition-colors"
                            variants={itemVariants}
                        >
                            <div className="text-center mb-8">
                                <h3 className="text-xl font-semibold mb-2">
                                    Starter
                                </h3>
                                <div className="text-4xl font-bold mb-4">
                                    KSh 2,999
                                    <span className="text-gray-500 text-base font-normal">
                                        /mo
                                    </span>
                                </div>
                                <p className="text-gray-600">
                                    Perfect for small businesses
                                </p>
                            </div>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center text-gray-600">
                                    <Check
                                        className="text-green-600 mr-3"
                                        size={20}
                                    />
                                    Up to 500 transactions/month
                                </li>
                                <li className="flex items-center text-gray-600">
                                    <Check
                                        className="text-green-600 mr-3"
                                        size={20}
                                    />
                                    Basic M-Pesa integration
                                </li>
                                <li className="flex items-center text-gray-600">
                                    <Check
                                        className="text-green-600 mr-3"
                                        size={20}
                                    />
                                    KRA compliance reports
                                </li>
                                <li className="flex items-center text-gray-600">
                                    <Check
                                        className="text-green-600 mr-3"
                                        size={20}
                                    />
                                    Email support
                                </li>
                            </ul>
                            <a
                                href="/sign-up"
                                className="w-full py-3 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
                            >
                                Get Started
                            </a>
                        </motion.div>

                        {/* Professional Plan */}
                        <motion.div
                            className="border-2 border-green-600 rounded-2xl p-8 relative bg-white shadow-lg"
                            variants={itemVariants}
                        >
                            <div className="absolute top-0 right-4 bg-green-600 text-white px-4 py-1 rounded-b-lg text-sm">
                                Popular
                            </div>
                            <div className="text-center mb-8">
                                <h3 className="text-xl font-semibold mb-2">
                                    Professional
                                </h3>
                                <div className="text-4xl font-bold mb-4">
                                    KSh 4,999
                                    <span className="text-gray-500 text-base font-normal">
                                        /mo
                                    </span>
                                </div>
                                <p className="text-gray-600">
                                    Best for growing businesses
                                </p>
                            </div>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center text-gray-600">
                                    <Check
                                        className="text-green-600 mr-3"
                                        size={20}
                                    />
                                    Unlimited transactions
                                </li>
                                <li className="flex items-center text-gray-600">
                                    <Check
                                        className="text-green-600 mr-3"
                                        size={20}
                                    />
                                    Advanced M-Pesa features
                                </li>
                                <li className="flex items-center text-gray-600">
                                    <Check
                                        className="text-green-600 mr-3"
                                        size={20}
                                    />
                                    Full KRA compliance suite
                                </li>
                                <li className="flex items-center text-gray-600">
                                    <Check
                                        className="text-green-600 mr-3"
                                        size={20}
                                    />
                                    Priority support
                                </li>
                                <li className="flex items-center text-gray-600">
                                    <Check
                                        className="text-green-600 mr-3"
                                        size={20}
                                    />
                                    Advanced analytics
                                </li>
                            </ul>
                            <a
                                href="/sign-up"
                                className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                Get Started
                            </a>
                        </motion.div>

                        {/* Enterprise Plan */}
                        <motion.div
                            className="border border-gray-100 rounded-2xl p-8 hover:border-green-200 transition-colors"
                            variants={itemVariants}
                        >
                            <div className="text-center mb-8">
                                <h3 className="text-xl font-semibold mb-2">
                                    Enterprise
                                </h3>
                                <div className="text-4xl font-bold mb-4">
                                    Custom
                                </div>
                                <p className="text-gray-600">
                                    For large organizations
                                </p>
                            </div>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center text-gray-600">
                                    <Check
                                        className="text-green-600 mr-3"
                                        size={20}
                                    />
                                    Custom transaction limits
                                </li>
                                <li className="flex items-center text-gray-600">
                                    <Check
                                        className="text-green-600 mr-3"
                                        size={20}
                                    />
                                    Custom integration options
                                </li>
                                <li className="flex items-center text-gray-600">
                                    <Check
                                        className="text-green-600 mr-3"
                                        size={20}
                                    />
                                    Dedicated account manager
                                </li>
                                <li className="flex items-center text-gray-600">
                                    <Check
                                        className="text-green-600 mr-3"
                                        size={20}
                                    />
                                    24/7 priority support
                                </li>
                                <li className="flex items-center text-gray-600">
                                    <Check
                                        className="text-green-600 mr-3"
                                        size={20}
                                    />
                                    Custom reporting
                                </li>
                            </ul>
                            <a
                                href="/sign-up"
                                className="w-full py-3 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
                            >
                                Contact Sales
                            </a>
                        </motion.div>
                    </motion.div>
                </div>
            </motion.section>

            <Footer />
        </div>
    );
}

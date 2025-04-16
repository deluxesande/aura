import React, { useState } from "react";
import { motion } from "framer-motion";

export default function Footer() {
    const [isTermsOpen, setIsTermsOpen] = useState(false);
    const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

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
        <footer className="bg-green-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="text-sm font-semibold text-green-100 mb-4">
                            Product
                        </h3>
                        <ul className="space-y-2">
                            <li>
                                <a
                                    href="/features"
                                    className="text-green-200 hover:text-white"
                                >
                                    Features
                                </a>
                            </li>
                            <li>
                                <a
                                    href="/pricing"
                                    className="text-green-200 hover:text-white"
                                >
                                    Pricing
                                </a>
                            </li>
                            <li>
                                <a
                                    href="/integrations"
                                    className="text-green-200 hover:text-white"
                                >
                                    Integrations
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-green-100 mb-4">
                            Company
                        </h3>
                        <ul className="space-y-2">
                            <li>
                                <a
                                    href="/about"
                                    className="text-green-200 hover:text-white"
                                >
                                    About
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-green-200 hover:text-white"
                                >
                                    Careers
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-green-100 mb-4">
                            Resources
                        </h3>
                        <ul className="space-y-2">
                            <li>
                                <a
                                    href="#"
                                    className="text-green-200 hover:text-white"
                                >
                                    Blog
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-green-200 hover:text-white"
                                >
                                    Help Center
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-green-200 hover:text-white"
                                >
                                    Guides
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-green-100 mb-4">
                            Legal
                        </h3>
                        <ul className="space-y-2">
                            <li>
                                <button
                                    onClick={() => setIsPrivacyOpen(true)}
                                    className="text-green-200 hover:text-white"
                                >
                                    Privacy
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => setIsTermsOpen(true)}
                                    className="text-green-200 hover:text-white"
                                >
                                    T&C
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="mt-12 pt-8 border-t border-green-800">
                    <p className="text-green-200 text-center">
                        © 2025 SaleSense. All rights reserved.
                    </p>
                </div>
            </div>

            {/* Terms and Conditions Modal */}
            {isTermsOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <motion.div
                        className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6"
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    >
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">
                            Terms and Conditions
                        </h2>
                        <p className="text-gray-700 mb-4">
                            Welcome to SaleSense! These terms and conditions
                            outline the rules and regulations for the use of our
                            website and services.
                        </p>
                        <p className="text-gray-700 mb-4">
                            By accessing or using our services, you agree to be
                            bound by these terms. If you do not agree, please do
                            not use our services.
                        </p>
                        <div className="flex justify-end mt-4">
                            <button
                                onClick={() => setIsTermsOpen(false)}
                                className="px-4 py-2 w-full bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                                Accept
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Privacy Policy Modal */}
            {isPrivacyOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <motion.div
                        className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6"
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    >
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">
                            Privacy Policy
                        </h2>
                        <p className="text-gray-700 mb-4">
                            Your privacy is important to us. This privacy policy
                            explains how we collect, use, and protect your
                            personal information.
                        </p>
                        <p className="text-gray-700 mb-4">
                            By using our services, you consent to the practices
                            described in this policy.
                        </p>
                        <div className="flex justify-end mt-4">
                            <button
                                onClick={() => setIsPrivacyOpen(false)}
                                className="px-4 py-2 w-full bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                                Accept
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </footer>
    );
}

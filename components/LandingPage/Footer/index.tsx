import React, { useState } from "react";
import { motion } from "framer-motion";
import PrivacyModal from "@/components/modals/Privacy";
import TermsModal from "@/components/modals/Terms";

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
                                    href="/integration"
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

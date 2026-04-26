"use client";

import Footer from "@/components/LandingPage/Footer";
import Navbar from "@/components/LandingPage/Navbar";
import {
    Monitor,
    Smartphone,
    Download,
    ChevronRight,
    CheckCircle2,
    Shield,
    Zap,
    RefreshCw,
} from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { isTauri } from "@/utils/tauri";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5 },
    },
};

export default function DownloadPage() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    if (isTauri()) return null;

    return (
        <div className="w-full min-h-screen bg-white">
            <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

            {/* Hero Section */}
            <section className="relative pt-32 pb-16 lg:pt-48 lg:pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-white">
                <div className="absolute top-0 right-0 w-[60%] h-[80%] bg-green-50/40 rounded-bl-[100px] -z-10 blur-3xl opacity-50" />

                <div className="max-w-7xl mx-auto text-center">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={containerVariants}
                    >
                        <motion.h1
                            variants={itemVariants}
                            className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6"
                        >
                            Experience SaleSense on <br />
                            <span className="text-green-500">Every Device</span>
                        </motion.h1>
                        <motion.p
                            variants={itemVariants}
                            className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
                        >
                            Take your business management to the next level with
                            our dedicated native apps built for speed, security,
                            and reliability.
                        </motion.p>
                    </motion.div>
                </div>
            </section>

            {/* Bento Grid Section */}
            <section className="pb-32 px-4 sm:px-6 lg:px-8">
                <motion.div
                    className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={containerVariants}
                >
                    {/* Windows App Card - Col Span 2 */}
                    <motion.div
                        variants={itemVariants}
                        className="md:col-span-2 bg-white rounded-3xl p-8 lg:p-12 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between relative overflow-hidden group"
                    >
                        <div className="absolute -right-32 -top-32 w-96 h-96 bg-green-50/50 rounded-full blur-3xl group-hover:bg-green-100/50 transition-colors duration-700" />

                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-8 border border-green-100 group-hover:scale-105 transition-transform">
                                <Monitor className="text-green-600" size={32} />
                            </div>
                            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                                SaleSense for Windows
                            </h2>
                            <p className="text-lg text-gray-600 mb-8 max-w-xl">
                                A powerful desktop experience optimized for
                                performance, multi-tasking, and deep integration
                                with your POS hardware.
                            </p>

                            <div className="grid sm:grid-cols-2 gap-4 mb-12">
                                {[
                                    "Direct receipt printing",
                                    "Barcode scanner support",
                                    "Native system notifications",
                                    "Optimized desktop UI",
                                ].map((feature, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center text-gray-700 font-medium"
                                    >
                                        <CheckCircle2
                                            className="text-green-500 mr-3 shrink-0"
                                            size={20}
                                        />
                                        {feature}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative z-10 mt-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <a
                                href="https://github.com/deluxesande/aura/releases/download/v1.0.0/SaleSense_1.0.0_x64_en-US.msi"
                                className="inline-flex items-center justify-center w-full sm:w-auto bg-green-500 text-white px-8 py-4 rounded-xl font-bold shadow-[0_4px_14px_0_rgba(22,163,74,0.39)] hover:bg-green-600 hover:-translate-y-1 transition-all duration-300"
                            >
                                <Download className="mr-2 shrink-0" size={20} />
                                Download for Windows (.msi)
                            </a>
                            <p className="text-xs text-gray-400 font-medium px-2">
                                Version 1.0.0 <br className="hidden sm:block" />{" "}
                                Windows 10/11
                            </p>
                        </div>
                    </motion.div>

                    {/* Android App Card - Col Span 1 */}
                    <motion.div
                        variants={itemVariants}
                        className="md:col-span-1 bg-green-600 rounded-3xl p-8 lg:p-10 shadow-lg shadow-green-900/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 w-48 h-48 bg-green-500 rounded-bl-full opacity-50" />

                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/20 group-hover:scale-105 transition-transform">
                                <Smartphone className="text-white" size={32} />
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-4">
                                SaleSense Mobile
                            </h2>
                            <p className="text-green-50 mb-8 leading-relaxed">
                                Manage your sales, stock, and customers on the
                                go. Perfect for deliveries and mobile teams.
                            </p>

                            <ul className="space-y-4 mb-12">
                                {[
                                    "Real-time M-Pesa tracking",
                                    "In-app camera scanner",
                                    "Contact sync for customers",
                                    "Instant push alerts",
                                ].map((feature, i) => (
                                    <li
                                        key={i}
                                        className="flex items-center text-white font-medium"
                                    >
                                        <CheckCircle2
                                            className="text-green-300 mr-3 shrink-0"
                                            size={20}
                                        />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="relative z-10 mt-auto cursor-not-allowed">
                            <a
                                href="https://github.com/deluxesande/aura/releases/latest/download/salesense-mobile.apk"
                                className="cursor-not-allowed inline-flex items-center justify-center w-full bg-white text-green-600 px-6 py-4 rounded-xl font-bold shadow-lg hover:bg-green-50 transition-colors"
                            >
                                <Download className="mr-2 shrink-0" size={20} />
                                Download (.apk)
                            </a>
                            <p className="text-center text-xs text-green-200 mt-4 font-medium">
                                Version 1.0.0 | Android 8.0+
                            </p>
                        </div>
                    </motion.div>

                    {/* Feature 1 */}
                    <motion.div
                        variants={itemVariants}
                        className="md:col-span-1 bg-green-50 rounded-3xl p-8 border border-green-100 hover:border-green-200 transition-colors group"
                    >
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-6 shadow-sm border border-green-100 group-hover:scale-110 transition-transform">
                            <Zap className="text-green-500" size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">
                            Faster Performance
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            Dedicated system resources ensure smooth scrolling
                            and instant data loading even with large
                            inventories.
                        </p>
                    </motion.div>

                    {/* Feature 2 */}
                    <motion.div
                        variants={itemVariants}
                        className="md:col-span-1 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group"
                    >
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Shield className="text-green-600" size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">
                            Enhanced Security
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            Biometric authentication and secure local storage
                            keep your business data protected at the OS level.
                        </p>
                    </motion.div>

                    {/* Feature 3 */}
                    <motion.div
                        variants={itemVariants}
                        className="md:col-span-1 bg-gray-50 rounded-3xl p-8 border border-gray-100 hover:bg-white hover:shadow-sm transition-all group"
                    >
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-6 shadow-sm border border-gray-100 group-hover:scale-110 transition-transform">
                            <RefreshCw className="text-green-500" size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">
                            Seamless Updates
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            Get the latest features and security patches
                            automatically without ever needing to refresh your
                            browser.
                        </p>
                    </motion.div>
                </motion.div>
            </section>

            <Footer />
        </div>
    );
}

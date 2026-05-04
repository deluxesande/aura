"use client";

import Footer from "@/components/LandingPage/Footer";
import Navbar from "@/components/LandingPage/Navbar";
import {
    Monitor,
    Smartphone,
    Download,
    CheckCircle2,
    Github,
    WifiOff,
    Printer,
    ScanBarcode,
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

            <section className="relative pt-32 pb-16 lg:pt-48 lg:pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-white">
                <div className="absolute top-0 right-0 w-[60%] h-[80%] bg-green-50/40 rounded-bl-[100px] -z-10 blur-3xl opacity-50" />

                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left: copy */}
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={containerVariants}
                        >
                            {/* Headline leads with the real reason to download (offline),
                                not the generic "Every Device" overpromise */}
                            <motion.h1
                                variants={itemVariants}
                                className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight"
                            >
                                Salesense works even when{" "}
                                <span className="text-green-500">
                                    your internet doesn&apos;t
                                </span>
                            </motion.h1>

                            <motion.p
                                variants={itemVariants}
                                className="text-xl text-gray-600 mb-8 max-w-lg"
                            >
                                The native apps add what the browser can&apos;t
                                — offline mode, direct receipt printing, and
                                instant barcode scanning. No setup, no drivers,
                                no IT department.
                            </motion.p>

                            <motion.div
                                variants={itemVariants}
                                className="flex flex-wrap gap-3"
                            >
                                <a
                                    href="https://github.com/deluxesande/aura/releases/download/v1.0.0/SaleSense_1.0.0_x64_en-US.msi"
                                    className="inline-flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-xl font-bold shadow-[0_4px_14px_0_rgba(22,163,74,0.39)] hover:bg-green-600 hover:-translate-y-0.5 transition-all duration-200 text-sm"
                                >
                                    <Monitor size={16} />
                                    Download for Windows
                                </a>
                            </motion.div>

                            <motion.p
                                variants={itemVariants}
                                className="mt-4 text-xs text-gray-400"
                            >
                                v1.0.0 &middot; Windows 10/11 &middot; 64-bit
                                &middot;{" "}
                            </motion.p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.7, delay: 0.2 }}
                            className="hidden lg:flex items-center justify-center"
                        >
                            <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden">
                                <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200">
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-red-400" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                        <div className="w-3 h-3 rounded-full bg-green-400" />
                                    </div>
                                    <div className="flex-1 mx-4 bg-white border border-gray-200 rounded-md px-3 py-1 text-xs text-gray-400 text-center">
                                        Salesense — Dashboard
                                    </div>
                                </div>
                                {/* Skeleton dashboard */}
                                <div className="p-5 bg-gray-50/50">
                                    <div className="grid grid-cols-3 gap-3 mb-4">
                                        {[0, 1, 2].map((i) => (
                                            <div
                                                key={i}
                                                className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm"
                                            >
                                                <div className="h-1.5 w-12 bg-gray-200 rounded mb-2" />
                                                <div
                                                    className={`h-5 rounded ${i === 0 ? "w-16 bg-green-200" : "w-10 bg-gray-200"}`}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                                        <div className="h-2 w-24 bg-gray-200 rounded mb-4" />
                                        {[0, 1, 2].map((i) => (
                                            <div
                                                key={i}
                                                className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-7 h-7 rounded-lg bg-green-100" />
                                                    <div>
                                                        <div className="h-1.5 w-20 bg-gray-200 rounded mb-1.5" />
                                                        <div className="h-1 w-12 bg-gray-100 rounded" />
                                                    </div>
                                                </div>
                                                <div className="h-2 w-10 bg-green-200 rounded" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            <section className="pb-24 px-4 sm:px-6 lg:px-8">
                <motion.div
                    className="max-w-7xl mx-auto"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={containerVariants}
                >
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                        {/* Windows */}
                        <motion.div
                            variants={itemVariants}
                            className="lg:col-span-2 bg-white rounded-3xl p-8 lg:p-10 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between relative overflow-hidden group"
                        >
                            <div className="absolute -right-32 -top-32 w-96 h-96 bg-green-50/50 rounded-full blur-3xl group-hover:bg-green-100/50 transition-colors duration-700" />

                            <div className="relative z-10">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center border border-green-100 group-hover:scale-105 transition-transform">
                                        <Monitor
                                            className="text-green-500"
                                            size={28}
                                        />
                                    </div>
                                    <span className="text-xs font-semibold text-green-500 bg-green-50 border border-green-100 px-2.5 py-1 rounded-full">
                                        Available Now
                                    </span>
                                </div>

                                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
                                    Salesense for Windows
                                </h2>
                                <p className="text-gray-600 mb-8 max-w-xl leading-relaxed">
                                    A full desktop experience built for shop
                                    floors. Works with your POS hardware
                                    out-of-the-box — no drivers, no browser, no
                                    fuss.
                                </p>

                                <div className="grid sm:grid-cols-2 gap-3 mb-10">
                                    {[
                                        "Direct receipt printing",
                                        "Barcode scanner support",
                                        "Works offline",
                                        "Native system notifications",
                                    ].map((feature, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center text-gray-700 text-sm font-medium"
                                        >
                                            <CheckCircle2
                                                className="text-green-500 mr-2.5 shrink-0"
                                                size={17}
                                            />
                                            {feature}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="relative z-10 mt-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                <a
                                    href="https://github.com/deluxesande/aura/releases/download/v1.0.0/SaleSense_1.0.0_x64_en-US.msi"
                                    className="inline-flex items-center justify-center w-full sm:w-auto bg-green-500 text-white px-7 py-3.5 rounded-xl font-bold shadow-[0_4px_14px_0_rgba(22,163,74,0.39)] hover:bg-green-600 hover:-translate-y-0.5 transition-all duration-200 text-sm"
                                >
                                    <Download
                                        className="mr-2 shrink-0"
                                        size={17}
                                    />
                                    Download for Windows (.msi)
                                </a>
                                <p className="text-xs text-gray-400 font-medium">
                                    v1.0.0 &middot; Windows 10/11 &middot;
                                    64-bit
                                </p>
                            </div>
                        </motion.div>

                        <motion.div
                            variants={itemVariants}
                            className="lg:col-span-1 bg-green-600 rounded-3xl p-8 lg:p-10 shadow-lg flex flex-col justify-between relative overflow-hidden group"
                        >
                            {/* Overlay */}
                            <div className="absolute inset-0 bg-green-700/60 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center rounded-3xl">
                                <span className="bg-white text-green-500 text-xs font-bold px-4 py-2 rounded-full shadow mb-3">
                                    Coming Soon
                                </span>
                                <p className="text-white/80 text-sm font-medium text-center px-6 leading-relaxed">
                                    Android app is in development.
                                </p>
                            </div>

                            <div className="absolute top-0 right-0 w-48 h-48 bg-green-500 rounded-bl-full opacity-50" />

                            <div className="relative z-10">
                                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6 border border-white/20">
                                    <Smartphone
                                        className="text-white"
                                        size={28}
                                    />
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-3">
                                    Salesense Mobile
                                </h2>
                                <p className="text-green-50 mb-8 leading-relaxed text-sm">
                                    Manage sales, stock, and customers on the
                                    go. Perfect for deliveries and mobile teams.
                                </p>
                                <ul className="space-y-3 mb-10">
                                    {[
                                        "Real-time M-Pesa tracking",
                                        "In-app camera scanner",
                                        "Contact sync for customers",
                                        "Instant push alerts",
                                    ].map((feature, i) => (
                                        <li
                                            key={i}
                                            className="flex items-center text-white text-sm font-medium"
                                        >
                                            <CheckCircle2
                                                className="text-white/60 mr-2.5 shrink-0"
                                                size={17}
                                            />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="relative z-10 mt-auto">
                                <div className="inline-flex items-center justify-center w-full bg-white/20 text-white/50 px-6 py-3.5 rounded-xl font-bold text-sm cursor-not-allowed select-none border border-white/10">
                                    <Download
                                        className="mr-2 shrink-0"
                                        size={17}
                                    />
                                    Download (.apk)
                                </div>
                                <p className="text-center text-xs text-white/40 mt-3 font-medium">
                                    Android 8.0+
                                </p>
                            </div>
                        </motion.div>
                    </div>

                    <div className="border-t border-gray-100 pt-10 mt-4">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">
                            Why native instead of browser
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <motion.div
                                variants={itemVariants}
                                className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:bg-white hover:border-gray-200 hover:shadow-sm transition-all group"
                            >
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mb-4 shadow-sm border border-gray-100 group-hover:scale-110 transition-transform">
                                    <WifiOff
                                        className="text-green-500"
                                        size={20}
                                    />
                                </div>
                                <h3 className="text-sm font-bold text-gray-900 mb-2">
                                    Works Without Internet
                                </h3>
                                <p className="text-gray-500 text-xs leading-relaxed">
                                    Record sales and count stock even when your
                                    connection drops. Everything syncs
                                    automatically when you&apos;re back online.
                                </p>
                            </motion.div>

                            <motion.div
                                variants={itemVariants}
                                className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:bg-white hover:border-gray-200 hover:shadow-sm transition-all group"
                            >
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mb-4 shadow-sm border border-gray-100 group-hover:scale-110 transition-transform">
                                    <Printer
                                        className="text-green-500"
                                        size={20}
                                    />
                                </div>
                                <h3 className="text-sm font-bold text-gray-900 mb-2">
                                    Direct Receipt Printing
                                </h3>
                                <p className="text-gray-500 text-xs leading-relaxed">
                                    Connects to your POS printer without browser
                                    print dialogs. Print receipts in one click,
                                    exactly as the customer expects.
                                </p>
                            </motion.div>

                            <motion.div
                                variants={itemVariants}
                                className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:bg-white hover:border-gray-200 hover:shadow-sm transition-all group"
                            >
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mb-4 shadow-sm border border-gray-100 group-hover:scale-110 transition-transform">
                                    <ScanBarcode
                                        className="text-green-500"
                                        size={20}
                                    />
                                </div>
                                <h3 className="text-sm font-bold text-gray-900 mb-2">
                                    Barcode Scanner Ready
                                </h3>
                                <p className="text-gray-500 text-xs leading-relaxed">
                                    Plug in a USB scanner and it works
                                    immediately — no pairing, no configuration.
                                    Speed up stocktakes and checkout.
                                </p>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </section>

            <Footer />
        </div>
    );
}

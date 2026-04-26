"use client";
import Footer from "@/components/LandingPage/Footer";
import Navbar from "@/components/LandingPage/Navbar";
import { motion, useInView } from "framer-motion";
import {
    BarChart3,
    Bell,
    CheckCircle2,
    HandCoins,
    ShieldCheck,
    Smartphone,
    Users,
    ArrowUpRight,
    FileText,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
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

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: "easeOut" },
    },
};

export default function FeaturesPage() {
    if (isTauri()) return null;
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Refs for sections
    const heroRef = useRef(null);
    const featuresRef = useRef(null);
    const ctaRef = useRef(null);

    // Track visibility
    const isHeroInView = useInView(heroRef, { once: true });
    const isFeaturesInView = useInView(featuresRef, {
        once: true,
        margin: "-100px",
    });
    const isCtaInView = useInView(ctaRef, { once: true });

    return (
        <div className="bg-gray-50">
            <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

            {/* Hero Section */}
            <motion.section
                ref={heroRef}
                className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
                initial="hidden"
                animate={isHeroInView ? "visible" : "hidden"}
                variants={containerVariants}
            >
                <div className="text-center max-w-5xl mx-auto">
                    <motion.h1
                        className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight"
                        variants={fadeInUp}
                    >
                        Powerful Features for Your Business
                    </motion.h1>
                    <motion.p
                        className="text-xl text-gray-600 mb-8"
                        variants={fadeInUp}
                    >
                        From seamless M-Pesa payments to automated KRA
                        compliance, SaleSense gives you the tools to manage your
                        business effectively.
                    </motion.p>
                </div>
            </motion.section>

            {/* Bento Grid Features */}
            <motion.section
                ref={featuresRef}
                className="pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
                initial="hidden"
                animate={isFeaturesInView ? "visible" : "hidden"}
                variants={containerVariants}
            >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(250px,auto)]">
                    {/* Feature 1: M-Pesa Integration (Large Span) */}
                    <motion.div
                        variants={fadeInUp}
                        className="md:col-span-2 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
                    >
                        <div className="relative z-10 max-w-md">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                                <HandCoins
                                    className="stroke-green-500"
                                    size={24}
                                />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                Seamless M-Pesa Integration
                            </h3>
                            <p className="text-gray-500 leading-relaxed">
                                Accept payments directly to your Till or
                                Paybill. We automatically reconcile transactions
                                in real-time, so you never have to guess who
                                paid what.
                            </p>
                        </div>

                        {/* Abstract UI Illustration */}
                        <div className="absolute top-8 right-8 w-64 hidden lg:block">
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 shadow-sm transform rotate-3 group-hover:rotate-0 transition-transform duration-500">
                                <div className="flex items-center justify-between mb-3 border-b border-gray-200 pb-2">
                                    <span className="text-xs font-bold text-gray-400">
                                        Recent Transactions
                                    </span>
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
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
                        </div>
                    </motion.div>

                    {/* Feature 2: KRA Compliance (Tall Card) */}
                    <motion.div
                        variants={fadeInUp}
                        className="md:row-span-2 bg-green-100 rounded-3xl p-8 border border-green-100 relative overflow-hidden group"
                    >
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-6 shadow-sm">
                                <ShieldCheck
                                    className="stroke-green-500"
                                    size={24}
                                />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                KRA Compliance
                            </h3>
                            <p className="text-green-800 leading-relaxed mb-6">
                                Stop worrying about tax deadlines. Our system
                                tracks your sales and automatically prepares
                                your returns.
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
                        {/* Background Decoration */}
                        <ShieldCheck className="absolute -bottom-10 -right-10 stroke-green-300 w-64 h-64 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                    </motion.div>

                    {/* Feature 3: Analytics */}
                    <motion.div
                        variants={fadeInUp}
                        className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-all group"
                    >
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                            <BarChart3 className="stroke-green-500" size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            Sales Analytics
                        </h3>
                        <p className="text-gray-500 text-sm">
                            Visual insights into your best performing products
                            and peak sales hours.
                        </p>
                        <div className="mt-4 flex items-end gap-1 h-16 w-full opacity-50 group-hover:opacity-100 transition-opacity">
                            <div className="bg-green-200 w-1/5 h-[40%] rounded-t"></div>
                            <div className="bg-green-300 w-1/5 h-[70%] rounded-t"></div>
                            <div className="bg-green-500 w-1/5 h-[50%] rounded-t"></div>
                            <div className="bg-green-400 w-1/5 h-[90%] rounded-t"></div>
                            <div className="bg-green-200 w-1/5 h-[60%] rounded-t"></div>
                        </div>
                    </motion.div>

                    {/* Feature 4: Customer Management */}
                    <motion.div
                        variants={fadeInUp}
                        className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-all"
                    >
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                            <Users className="stroke-green-500" size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            CRM Tools
                        </h3>
                        <p className="text-gray-500 text-sm">
                            Keep track of your loyal customers and purchase
                            history to build better relationships.
                        </p>
                    </motion.div>

                    {/* Feature 5: Mobile App (Wide) */}
                    <motion.div
                        variants={fadeInUp}
                        className="md:col-span-2 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-center gap-8 overflow-hidden"
                    >
                        <div className="flex-1 text-center md:text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-wider mb-4">
                                <Smartphone size={14} /> Mobile First
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                Manage on the Go
                            </h3>
                            <p className="text-gray-500 mb-6">
                                Your business in your pocket. Track sales, send
                                invoices, and check inventory levels from
                                anywhere using our mobile app.
                            </p>
                            <div className="flex gap-4 justify-center md:justify-start text-sm font-semibold text-green-500 cursor-pointer hover:text-green-500">
                                <span>Download for Android</span>{" "}
                                <ArrowUpRight size={18} />
                            </div>
                        </div>
                        <div className="relative w-48 h-48 bg-gray-50 rounded-lg border-4 border-gray-100 flex items-center justify-center shadow-inner">
                            <div className="text-center">
                                <div className="w-10 h-1 rounded-full bg-gray-200 mx-auto mb-4"></div>
                                <div className="w-12 h-12 rounded-lg mx-auto flex items-center justify-center text-white mb-2 shadow-lg shadow-green-200">
                                    <Image
                                        src="/logos/salesense-icon.png"
                                        alt="Logo"
                                        className="rounded-lg"
                                        width={48}
                                        height={48}
                                    />
                                </div>
                                <p className="text-xs text-gray-400 font-bold">
                                    SaleSense
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Feature 6: Notifications */}
                    <motion.div
                        variants={fadeInUp}
                        className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-all"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <Bell className="stroke-green-500" size={24} />
                            </div>
                            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            Smart Alerts
                        </h3>
                        <p className="text-gray-500 text-sm">
                            Get notified instantly for low stock, failed
                            payments, or when tax returns are due.
                        </p>
                    </motion.div>
                </div>
            </motion.section>

            {/* CTA Section */}
            <motion.section
                ref={ctaRef}
                className="py-24 bg-gray-50"
                initial="hidden"
                animate={isCtaInView ? "visible" : "hidden"}
                variants={containerVariants}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        variants={fadeInUp}
                        className="relative bg-white rounded-3xl p-8 md:p-16 text-center overflow-hidden shadow-2xl shadow-gray-200/50 border border-gray-100"
                    >
                        {/* --- BACKGROUND PATTERNS (Inverted for White Background) --- */}
                        {/* TODO: Make this it's own Component */}
                        <div className="absolute inset-0 pointer-events-none">
                            {/* 1. Soft Green Glow Gradients */}
                            <div className="absolute -top-[50%] -left-[20%] w-[80%] h-[200%] rounded-full bg-green-50/50 blur-[100px]" />
                            <div className="absolute bottom-0 right-0 w-[60%] h-[120%] bg-green-50/80 blur-[80px] rounded-full translate-y-1/4" />

                            {/* 2. Flowing Lines SVG (Green Strokes) */}
                            <svg
                                className="absolute inset-0 w-full h-full"
                                viewBox="0 0 1440 400"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                preserveAspectRatio="none"
                            >
                                <defs>
                                    <filter
                                        id="white-card-glow"
                                        x="-50%"
                                        y="-50%"
                                        width="200%"
                                        height="200%"
                                    >
                                        <feGaussianBlur
                                            stdDeviation="4"
                                            result="coloredBlur"
                                        />
                                        <feMerge>
                                            <feMergeNode in="coloredBlur" />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>
                                </defs>

                                {/* Background Wave - Very subtle gray/green */}
                                <path
                                    d="M0 400C230 400 340 300 500 300C660 300 780 400 1000 400C1220 400 1350 300 1440 300V0H0V400Z"
                                    stroke="#22c55e" // green-500
                                    strokeWidth="2"
                                    fill="none"
                                    className="opacity-[0.03]"
                                />

                                {/* Main Flowing Wave - Visible Green */}
                                <path
                                    d="M-100 450C130 450 240 250 400 250C560 250 680 450 900 450C1120 450 1250 250 1540 250V-50H-100V450Z"
                                    stroke="#16a34a" // green-600
                                    strokeWidth="2"
                                    className="opacity-10"
                                    fill="none"
                                    filter="url(#white-card-glow)"
                                />

                                {/* Sharp Foreground Waves */}
                                <path
                                    d="M0 200C200 200 300 100 500 100C700 100 900 300 1100 300C1300 300 1400 100 1440 100"
                                    stroke="#15803d" // green-700
                                    strokeWidth="1.5"
                                    fill="none"
                                    className="opacity-20"
                                />
                            </svg>
                        </div>

                        {/* --- CONTENT --- */}
                        <div className="relative z-10 max-w-3xl mx-auto">
                            <h2 className="text-3xl md:text-4xl font-bold text-green-500 mb-6">
                                Ready to modernize your business?
                            </h2>
                            <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                                Join thousands of Kenyan businesses using
                                SaleSense to simplify operations and stay
                                compliant.
                            </p>

                            {/* Green Button for contrast against White Card */}
                            <Link
                                href="/sign-up"
                                className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-green-500 rounded-lg hover:bg-green-600 hover:-translate-y-1 transition-all shadow-lg shadow-green-200"
                            >
                                Get Started Now
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </motion.section>

            <Footer />
        </div>
    );
}

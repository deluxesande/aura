"use client";

import { motion, useInView } from "framer-motion";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { useRef } from "react";
import Link from "next/link";

const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: "easeOut" },
    },
};

const imageVariant = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.8, ease: "easeOut" },
    },
};

export default function HowItWorks() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <section className="py-24 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* --- HEADER --- */}
                <motion.div
                    ref={ref}
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                    variants={fadeInUp}
                    className="text-center max-w-3xl mx-auto mb-24"
                >
                    <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
                        How It Works
                    </h2>
                    <p className="text-xl text-gray-600">
                        We removed the complexity. No hardware to buy, no
                        installation fees. Just sign up and start selling.
                    </p>
                </motion.div>

                {/* --- STEPS --- */}
                <div className="space-y-24 md:space-y-32">
                    {/* STEP 1: REGISTER */}
                    <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
                        {/* Text Side */}
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-100px" }}
                            variants={fadeInUp}
                            className="flex-1"
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <span className="flex items-center justify-center w-12 h-12 rounded-lg bg-green-100 text-green-500 font-bold text-xl">
                                    01
                                </span>
                                <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
                                    Create your account
                                </h3>
                            </div>
                            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                                Sign up with your business name and email. We
                                automatically configure your tax settings based
                                on your KRA PIN, so you don&apos;t have to worry
                                about compliance later.
                            </p>
                            <ul className="space-y-3">
                                {[
                                    "Instant verification",
                                    "Pre-configured KRA Tax Rates",
                                    "Cloud-based backup",
                                ].map((item, i) => (
                                    <li
                                        key={i}
                                        className="flex items-center gap-3 text-gray-700 font-medium"
                                    >
                                        <CheckCircle2
                                            className="stroke-green-500"
                                            size={20}
                                        />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>

                        {/* Visual Side (Abstract UI) */}
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-100px" }}
                            variants={imageVariant}
                            className="flex-1 w-full"
                        >
                            <div className="relative bg-gray-50 rounded-3xl border border-gray-100 p-6 md:p-10 shadow-lg shadow-gray-200/50">
                                {/* Abstract Form UI */}
                                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 space-y-4">
                                    <div className="space-y-2">
                                        <div className="h-4 w-24 bg-gray-200 rounded-full" />
                                        <div className="h-10 w-full bg-gray-50 border border-gray-200 rounded-lg" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-4 w-32 bg-gray-200 rounded-full" />
                                        <div className="h-10 w-full bg-gray-50 border border-gray-200 rounded-lg flex items-center px-3 text-gray-400">
                                            P051...
                                        </div>
                                    </div>
                                    <div className="pt-4">
                                        <div className="h-10 w-full bg-green-500 rounded-lg flex items-center justify-center text-white font-medium text-sm">
                                            Create Account
                                        </div>
                                    </div>
                                </div>
                                {/* Floating Badge */}
                                <div className="absolute -right-4 top-1/2 -translate-y-1/2 bg-white p-4 rounded-lg shadow-xl border border-green-100 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-500">
                                        <CheckCircle2
                                            size={16}
                                            className="stroke-green-500"
                                        />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-medium uppercase">
                                            Status
                                        </p>
                                        <p className="text-sm font-bold text-gray-900">
                                            Verified
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* STEP 2: CONNECT (Reversed Layout) */}
                    <div className="flex flex-col md:flex-row-reverse items-center gap-12 lg:gap-20">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-100px" }}
                            variants={fadeInUp}
                            className="flex-1"
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <span className="flex items-center justify-center w-12 h-12 rounded-lg bg-green-100 text-green-500 font-bold text-xl">
                                    02
                                </span>
                                <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
                                    Link M-Pesa
                                </h3>
                            </div>
                            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                                Enter your Till or Paybill number. We connect
                                directly to Safaricom to detect payments in
                                real-time, matching every shilling to a specific
                                sale automatically.
                            </p>
                            <ul className="space-y-3">
                                {[
                                    "Zero transaction errors",
                                    "Real-time payment detection",
                                    "Automatic reconciliation",
                                ].map((item, i) => (
                                    <li
                                        key={i}
                                        className="flex items-center gap-3 text-gray-700 font-medium"
                                    >
                                        <CheckCircle2
                                            className="stroke-green-500"
                                            size={20}
                                        />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>

                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-100px" }}
                            variants={imageVariant}
                            className="flex-1 w-full"
                        >
                            <div className="relative bg-green-500 rounded-3xl p-6 md:p-10 shadow-lg shadow-green-600/20 overflow-hidden">
                                {/* Abstract M-Pesa Connection UI */}
                                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/10">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="h-8 w-8 rounded-full bg-green-700" />
                                        <div className="h-0.5 flex-1 mx-4 bg-green-800/30 border-t border-dashed border-green-400/50" />
                                        <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center">
                                            <CheckCircle2
                                                size={16}
                                                className="stroke-green-600"
                                            />
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-lg p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-500 font-bold text-xs">
                                                MP
                                            </div>
                                            <div>
                                                <div className="h-3 w-20 bg-gray-200 rounded-full mb-1" />
                                                <div className="h-2 w-12 bg-gray-100 rounded-full" />
                                            </div>
                                        </div>
                                        <span className="text-green-500 text-sm font-bold">
                                            Connected
                                        </span>
                                    </div>
                                </div>
                                {/* Decor */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500 rounded-full blur-[60px] opacity-20" />
                            </div>
                        </motion.div>
                    </div>

                    {/* STEP 3: MANAGE */}
                    <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-100px" }}
                            variants={fadeInUp}
                            className="flex-1"
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <span className="flex items-center justify-center w-12 h-12 rounded-lg bg-green-100 text-green-500 font-bold text-xl">
                                    03
                                </span>
                                <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
                                    Start Selling
                                </h3>
                            </div>
                            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                                Use the POS to ring up sales. Watch your
                                dashboard update instantly with sales data,
                                inventory levels, and profit margins.
                            </p>
                            <Link
                                href="/sign-up"
                                className="inline-flex items-center gap-2 text-green-500 font-bold hover:gap-3 transition-all"
                            >
                                Start your free trial{" "}
                                <ArrowRight
                                    size={20}
                                    className="stroke-green-500"
                                />
                            </Link>
                        </motion.div>

                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-100px" }}
                            variants={imageVariant}
                            className="flex-1 w-full"
                        >
                            <div className="relative bg-gray-50 rounded-3xl border border-gray-100 p-6 md:p-10 shadow-lg shadow-gray-200/50">
                                {/* Abstract Dashboard UI */}
                                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 grid grid-cols-2 gap-3">
                                    <div className="col-span-2 h-32 bg-green-50 rounded-lg border border-green-100 relative overflow-hidden">
                                        <div className="absolute bottom-0 left-0 right-0 h-16 bg-green-200/50 rounded-t-full blur-xl" />
                                        <svg
                                            viewBox="0 0 100 40"
                                            className="absolute bottom-0 w-full h-full fill-green-500/20 stroke-green-500"
                                            preserveAspectRatio="none"
                                        >
                                            <path d="M0 40 L0 30 Q10 10 20 25 T40 15 T60 20 T80 5 L100 10 L100 40 Z" />
                                        </svg>
                                    </div>
                                    <div className="h-16 bg-gray-50 rounded-lg border border-gray-100" />
                                    <div className="h-16 bg-gray-50 rounded-lg border border-gray-100" />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}

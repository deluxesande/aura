"use client";

import { motion, useInView } from "framer-motion";
import React, { useRef } from "react";
import Link from "next/link";

const bannerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.6, ease: "easeOut" },
    },
};

const buttonVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: "easeOut",
            delay: 0.4,
        },
    },
};

export default function CTABanner() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <motion.section
            ref={ref}
            className="bg-gray-50 py-24 px-4 sm:px-6 lg:px-8"
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={bannerVariants}
        >
            <div className="max-w-7xl mx-auto">
                <motion.div
                    className="relative bg-green-500 rounded-3xl p-8 md:p-16 shadow-2xl shadow-green-900/20 border border-green-800 overflow-hidden text-center"
                    variants={bannerVariants}
                >
                    {/* --- BACKGROUND PATTERNS & LINES --- */}
                    <div className="absolute inset-0 pointer-events-none">
                        {/* 1. Soft Glow Gradients */}
                        <div className="absolute -top-[50%] -left-[20%] w-[80%] h-[200%] rounded-full bg-green-800/30 blur-[100px]" />
                        <div className="absolute bottom-0 right-0 w-[60%] h-[120%] bg-green-950/40 blur-[80px] rounded-full translate-y-1/4" />

                        {/* 2. Flowing Lines SVG */}
                        <svg
                            className="absolute inset-0 w-full h-full opacity-60"
                            viewBox="0 0 1440 400"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            preserveAspectRatio="none"
                        >
                            {/* Define filters for glow effect */}
                            <defs>
                                <filter
                                    id="cta-line-glow"
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

                            {/* Background Wave */}
                            <path
                                d="M0 400C230 400 340 300 500 300C660 300 780 400 1000 400C1220 400 1350 300 1440 300V0H0V400Z"
                                stroke="#064e3b" // darker green stroke
                                strokeWidth="4"
                                fill="none"
                                className="opacity-30"
                            />

                            {/* Main Glowing Wave */}
                            <path
                                d="M-100 450C130 450 240 250 400 250C560 250 680 450 900 450C1120 450 1250 250 1540 250V-50H-100V450Z"
                                stroke="white"
                                strokeWidth="3"
                                className="opacity-20"
                                fill="none"
                                filter="url(#cta-line-glow)"
                            />

                            {/* Sharp Foreground Waves */}
                            <path
                                d="M0 200C200 200 300 100 500 100C700 100 900 300 1100 300C1300 300 1400 100 1440 100"
                                stroke="white"
                                strokeWidth="2"
                                fill="none"
                                className="opacity-40"
                            />
                        </svg>
                    </div>

                    {/* --- CONTENT --- */}
                    <div className="relative z-10 max-w-3xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                            Ready to grow your business?
                        </h2>
                        <p className="text-green-100 text-lg mb-10 leading-relaxed">
                            Join thousands of Kenyan businesses using SaleSense
                            to streamline operations, track M-Pesa payments, and
                            stay KRA compliant.
                        </p>

                        <motion.div variants={buttonVariants}>
                            <Link
                                href="/sign-up"
                                className="inline-block bg-white text-green-800 font-bold px-10 py-4 rounded-xl shadow-lg shadow-green-900/30 hover:bg-green-50 hover:scale-105 transition-all duration-300 transform"
                            >
                                Get Started Now
                            </Link>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </motion.section>
    );
}

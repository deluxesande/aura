"use client";
import Footer from "@/components/LandingPage/Footer";
import Navbar from "@/components/LandingPage/Navbar";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import { useRef, useState } from "react";
import {
    ArrowRight,
    CheckCircle2,
    TrendingUp,
    ShieldCheck,
} from "lucide-react";
import Link from "next/link";

const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: "easeOut" },
    },
};

const fadeInRight = {
    hidden: { opacity: 0, x: -40 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.6, ease: "easeOut" },
    },
};

const fadeInLeft = {
    hidden: { opacity: 0, x: 40 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.6, ease: "easeOut" },
    },
};

export default function AboutPage() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const heroRef = useRef(null);
    const storyRef = useRef(null);
    const valuesRef = useRef(null);

    const isHeroInView = useInView(heroRef, { once: true });
    const isStoryInView = useInView(storyRef, {
        once: true,
        margin: "-100px",
    });
    const isValuesInView = useInView(valuesRef, {
        once: true,
        margin: "-100px",
    });

    return (
        <div className="bg-white selection:bg-green-100 selection:text-green-900">
            <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

            {/* --- HERO SECTION: Split Layout --- */}
            <section
                ref={heroRef}
                className="relative pt-32 pb-20 overflow-hidden"
            >
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-1/2 h-full bg-green-50/50 -skew-x-12 translate-x-20 -z-10" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        {/* Text Content (Left Aligned) */}
                        <motion.div
                            initial="hidden"
                            animate={isHeroInView ? "visible" : "hidden"}
                            variants={fadeInRight}
                        >
                            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 leading-[1.1] mb-8">
                                Built for Business. <br />
                                <span className="text-green-500">
                                    Designed for Growth.
                                </span>
                            </h1>
                            <p className="text-xl text-gray-600 leading-relaxed mb-8 max-w-lg">
                                SaleSense is the operating system for the modern
                                Kenyan entrepreneur. We bridge the gap between
                                inventory, seamless payments, and effortless
                                compliance.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="pl-6 border-l-4 border-green-500">
                                    <h3 className="font-bold text-gray-900 text-lg">
                                        100% Compliance
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        Automated KRA Returns
                                    </p>
                                </div>
                                <div className="pl-6 border-l-4 border-gray-200">
                                    <h3 className="font-bold text-gray-900 text-lg">
                                        0% Transaction Fees
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        Direct Paybill Integration
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Visual / Abstract UI (Right Aligned) */}
                        <motion.div
                            className="relative"
                            initial="hidden"
                            animate={isHeroInView ? "visible" : "hidden"}
                            variants={fadeInLeft}
                        >
                            <div className="relative z-10 rounded-lg p-6 shadow-2xl shadow-green-200 transform rotate-1 hover:rotate-0 transition-transform duration-500">
                                {/* Abstract UI Representation */}
                                <div className="flex items-center justify-between mb-8 pb-4">
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                        <div className="w-3 h-3 rounded-full bg-green-500" />
                                    </div>
                                    <div className="text-gray-400 text-xs font-mono">
                                        trysalesense.online/dashboard
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-slate-50 border-gray-100 p-4 rounded-lg">
                                        <p className="text-gray-400 text-xs mb-1">
                                            Total Revenue
                                        </p>
                                        <p className="text-2xl font-bold">
                                            KSh 1,240,000
                                        </p>
                                    </div>
                                    <div className="bg-slate-50 border-gray-100 p-4 rounded-lg">
                                        <p className="text-gray-400 text-xs mb-1">
                                            Tax Status
                                        </p>
                                        <p className="text-xl font-bold text-green-500 flex items-center gap-2">
                                            <CheckCircle2
                                                size={16}
                                                className="stroke-green-500"
                                            />{" "}
                                            Filed
                                        </p>
                                    </div>
                                </div>
                                <div className="rounded-lg p-4 h-32 flex items-end gap-2">
                                    <div className="w-1/5 bg-green-200 h-[40%] rounded-t-sm" />
                                    <div className="w-1/5 bg-green-200 h-[60%] rounded-t-sm" />
                                    <div className="w-1/5 bg-green-500 h-[85%] rounded-t-sm" />
                                    <div className="w-1/5 bg-green-200 h-[50%] rounded-t-sm" />
                                    <div className="w-1/5 bg-green-200 h-[70%] rounded-t-sm" />
                                </div>
                            </div>

                            {/* Floating Badge */}
                            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-lg border border-gray-100 flex items-center gap-3 z-20">
                                <div className="bg-green-100 p-2 rounded-lg">
                                    <TrendingUp className="stroke-green-500 w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-semibold uppercase">
                                        Growth Rate
                                    </p>
                                    <p className="text-lg font-bold text-gray-900">
                                        +128%
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* --- THE STORY: Minimal & Clean --- */}
            <section ref={storyRef} className="py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        className="grid md:grid-cols-12 gap-12"
                        initial="hidden"
                        animate={isStoryInView ? "visible" : "hidden"}
                        variants={fadeInUp}
                    >
                        <div className="md:col-span-5">
                            <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
                                Running a business is hard. <br />
                                <span className="text-gray-400">
                                    Your software shouldn&apos;t be.
                                </span>
                            </h2>
                            <div className="w-12 h-1 bg-green-500 mb-6" />
                        </div>
                        <div className="md:col-span-7 space-y-6 text-lg text-gray-300 font-light leading-relaxed">
                            <p>
                                We noticed a gap. Small businesses were drowning
                                in messy spreadsheets, losing receipts, and
                                stressing over tax deadlines every month. The
                                existing solutions were either too expensive,
                                too complex, or didn&apos;t understand the local
                                market.
                            </p>
                            <p>
                                That’s why we built{" "}
                                <strong className="font-semibold">
                                    SaleSense
                                </strong>
                                .
                            </p>
                            <p>
                                We are more than just a POS system. We are a
                                digital partner that helps you track every item
                                sold, accept M-Pesa payments seamlessly,
                                and—most importantly—handle your KRA tax returns
                                automatically.
                            </p>
                            <p>
                                Our goal is simple:{" "}
                                <span className="text-green-500 italic">
                                    Give business owners their time back.
                                </span>
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* --- BENTO GRID: Values --- */}
            <section ref={valuesRef} className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-16">
                        <h2 className="text-3xl font-bold text-gray-900">
                            Why SaleSense?
                        </h2>
                        <p className="text-gray-500 mt-2">
                            Real solutions for real problems.
                        </p>
                    </div>

                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(200px,auto)]"
                        initial="hidden"
                        animate={isValuesInView ? "visible" : "hidden"}
                        variants={{
                            hidden: { opacity: 0 },
                            visible: {
                                opacity: 1,
                                transition: { staggerChildren: 0.1 },
                            },
                        }}
                    >
                        {/* Card 1: Large Span (White Background) */}
                        <motion.div
                            variants={fadeInUp}
                            className="md:col-span-2 bg-white p-8 rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow group overflow-hidden relative"
                        >
                            <div className="relative z-10">
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                    Total Peace of Mind
                                </h3>
                                <p className="text-gray-600 max-w-md">
                                    Never worry about the 20th of the month
                                    again. Our automated filing engine ensures
                                    you stay compliant effortlessly, whether you
                                    have NIL returns or sales data.
                                </p>
                            </div>
                            <div className="absolute right-0 bottom-0 opacity-10 group-hover:opacity-20 transition-opacity">
                                <ShieldCheck
                                    size={200}
                                    className="text-green-500 transform translate-x-10 translate-y-10"
                                />
                            </div>
                        </motion.div>

                        {/* Card 2: Tall (Black Background for POP) */}
                        <motion.div
                            variants={fadeInUp}
                            className="md:row-span-2 p-8 bg-white border-gray-200 rounded-3xl shadow-sm flex flex-col justify-between group"
                        >
                            <div>
                                <h3 className="text-2xl font-bold mb-3">
                                    Financial Freedom
                                </h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    We believe you should keep your money.
                                    That’s why you connect your own Paybill, and
                                    we charge{" "}
                                    <strong>zero transaction fees</strong>.
                                </p>
                            </div>
                            <div className="mt-8 pt-8">
                                <Link
                                    href="/sign-up"
                                    className="flex items-center gap-3"
                                >
                                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                        <ArrowRight
                                            size={20}
                                            className="stroke-green-500 group-hover:translate-x-1 transition-transform"
                                        />
                                    </div>
                                    <span className="text-sm font-semibold text-green-500">
                                        Get Started Free
                                    </span>
                                </Link>
                            </div>
                        </motion.div>

                        {/* Card 3: Standard (White Background) */}
                        <motion.div
                            variants={fadeInUp}
                            className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <h3 className="text-xl font-bold text-gray-900 mb-3">
                                Simplicity First
                            </h3>
                            <p className="text-gray-600 text-sm">
                                No complex manuals needed. Our interface is
                                intuitive, clean, and designed for anyone to use
                                from day one.
                            </p>
                        </motion.div>

                        {/* Card 4: Standard (Green Background for POP) */}
                        <motion.div
                            variants={fadeInUp}
                            className="bg-green-500 p-8 rounded-3xl shadow-sm text-white hover:bg-green-600 transition-colors"
                        >
                            <h3 className="text-xl text-white font-bold mb-3">
                                Data Ownership
                            </h3>
                            <p className="text-green-100 text-sm">
                                Your data belongs to you. Export your sales,
                                inventory, and customer lists to Excel or CSV
                                whenever you want.
                            </p>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* --- LEADERSHIP: Horizontal & Clean --- */}
            <section className="py-24 bg-white border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row gap-12 items-center">
                        <div className="md:w-1/3">
                            <h2 className="text-4xl font-bold text-gray-900 mb-4">
                                Leadership
                            </h2>
                            <p className="text-gray-600 mb-6">
                                Driving the vision of a digital-first economy
                                for local businesses in Kenya.
                            </p>
                            <button className="text-green-500 font-semibold flex items-center gap-2 hover:gap-3 transition-all">
                                Join the team{" "}
                                <ArrowRight
                                    size={18}
                                    className="stroke-green-500"
                                />
                            </button>
                        </div>

                        <div className="md:w-2/3 w-full">
                            {/* Single Founder Card (Horizontal) */}
                            <div className="flex flex-col sm:flex-row bg-gray-50 rounded-lg p-6 md:p-8 gap-6 items-center sm:items-start hover:shadow-lg transition-shadow duration-300 border border-gray-100">
                                <div className="shrink-0 relative w-32 h-32 md:w-40 md:h-40">
                                    <Image
                                        src="/images/Profile.jpg"
                                        alt="Deluxe Sande"
                                        fill
                                        className="rounded-lg object-cover shadow-md"
                                    />
                                </div>
                                <div className="text-center sm:text-left">
                                    <h3 className="text-2xl font-bold text-gray-900">
                                        Deluxe Sande
                                    </h3>
                                    <p className="text-green-500 font-medium mb-4">
                                        CEO & Founder
                                    </p>
                                    <p className="text-gray-600 text-sm leading-relaxed italic">
                                        &quot;We aren&apos;t building a tool for
                                        Silicon Valley. We are building for
                                        Biashara Street. Technology should adapt
                                        to the business, not the other way
                                        around.&quot;
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}

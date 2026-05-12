"use client";
import Footer from "@/components/LandingPage/Footer";
import Navbar from "@/components/LandingPage/Navbar";
import { motion, useInView } from "framer-motion";
import {
    ArrowRight,
    Bot,
    CheckCircle2,
    FileText,
    Image as ImageIcon,
    MessageCircle,
    Sparkles,
    TrendingUp,
    Zap,
} from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { isTauri } from "@/utils/tauri";
import CTABanner from "@/components/LandingPage/CTABanner";

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

export default function AIPage() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const heroRef = useRef(null);
    const isHeroInView = useInView(heroRef, { once: true });

    const overviewRef = useRef(null);
    const isOverviewInView = useInView(overviewRef, { once: true });

    const dive1Ref = useRef(null);
    const isDive1InView = useInView(dive1Ref, { once: true, margin: "-100px" });

    const dive2Ref = useRef(null);
    const isDive2InView = useInView(dive2Ref, { once: true, margin: "-100px" });

    const dive3Ref = useRef(null);
    const isDive3InView = useInView(dive3Ref, { once: true, margin: "-100px" });

    const ctaRef = useRef(null);
    const isCtaInView = useInView(ctaRef, { once: true });

    if (isTauri()) return null;

    return (
        <div className="bg-white selection:bg-green-100 selection:text-green-900">
            <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

            {/* --- HERO SECTION --- */}
            <section
                ref={heroRef}
                className="relative pt-32 pb-20 overflow-hidden bg-gray-50 border-b border-gray-100"
            >
                <div className="absolute top-0 right-0 w-1/2 h-full bg-green-50/50 -skew-x-12 translate-x-20 -z-10" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial="hidden"
                            animate={isHeroInView ? "visible" : "hidden"}
                            variants={fadeInRight}
                        >
                            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 leading-[1.1] mb-8">
                                Stop Tracking. <br />
                                <span className="text-green-500">
                                    Start Growing.
                                </span>
                            </h1>
                            <p className="text-xl text-gray-600 leading-relaxed mb-8 max-w-lg">
                                We are expanding beyond the ERP. Meet your new
                                AI-powered Revenue Generation Engine. Automate
                                your WhatsApp marketing, close B2B deals
                                instantly, and let AI handle your customer
                                support without changing your existing systems.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link
                                    href="/sign-up"
                                    className="inline-flex items-center justify-center px-6 py-3 text-base font-bold text-white bg-green-500 rounded-lg hover:bg-green-600 hover:-translate-y-1 transition-all shadow-lg shadow-green-200 gap-2"
                                >
                                    Get Early Access <ArrowRight size={18} />
                                </Link>
                            </div>
                        </motion.div>

                        <motion.div
                            className="relative"
                            initial="hidden"
                            animate={isHeroInView ? "visible" : "hidden"}
                            variants={fadeInLeft}
                        >
                            <div className="relative z-10 bg-white rounded-2xl p-6 shadow-2xl shadow-green-100 border border-gray-100 transform -rotate-1 hover:rotate-0 transition-transform duration-500 max-w-md ml-auto">
                                <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                            <Bot
                                                size={20}
                                                className="text-green-500"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">
                                                SaleSense Agent
                                            </p>
                                            <p className="text-xs text-green-500 flex items-center gap-1">
                                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>{" "}
                                                Online
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-end">
                                        <div className="bg-gray-100 rounded-2xl rounded-tr-sm p-3 max-w-[80%]">
                                            <p className="text-xs text-gray-700 font-medium">
                                                Do you have the new stock in
                                                size 42? How much?
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex justify-start">
                                        <div className="bg-green-50 border border-green-100 rounded-2xl rounded-tl-sm p-3 max-w-[80%] relative">
                                            <Sparkles
                                                size={12}
                                                className="absolute -top-1 -left-1 text-green-400 fill-green-400"
                                            />
                                            <p className="text-xs text-green-500 font-medium">
                                                Yes! We have 3 pairs left in
                                                size 42. They are KSh 3,500.
                                                Would you like me to reserve a
                                                pair or send the Paybill number?
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg border border-gray-100 flex items-center gap-3 z-20">
                                <div className="bg-green-100 p-2 rounded-lg">
                                    <TrendingUp className="stroke-green-500 w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-semibold uppercase">
                                        Response Time
                                    </p>
                                    <p className="text-lg font-bold text-gray-900">
                                        &lt; 2 Seconds
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* --- DEEP DIVE 1: WhatsApp Agent --- */}
            <section ref={dive1Ref} className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        className="grid md:grid-cols-2 gap-16 items-center"
                        initial="hidden"
                        animate={isDive1InView ? "visible" : "hidden"}
                        variants={containerVariants}
                    >
                        <motion.div
                            variants={fadeInRight}
                            className="order-2 md:order-1"
                        >
                            <div className="relative z-10 bg-gray-50 rounded-3xl p-8 border border-gray-100 shadow-sm">
                                {/* Abstract UI: PDF to Chat Translation */}
                                <div className="flex flex-col gap-6">
                                    {/* Input Document */}
                                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-start gap-4">
                                        <div className="bg-red-100 p-3 rounded-lg text-red-500 shrink-0">
                                            <FileText size={24} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 mb-1">
                                                PriceList_2026.pdf
                                            </p>
                                            <p className="text-xs text-gray-500 mb-2">
                                                Uploaded 2 mins ago
                                            </p>
                                            <div className="space-y-1.5">
                                                <div className="h-1.5 w-full bg-gray-100 rounded-full"></div>
                                                <div className="h-1.5 w-4/5 bg-gray-100 rounded-full"></div>
                                                <div className="h-1.5 w-2/3 bg-gray-100 rounded-full"></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-center">
                                        <div className="w-px h-8 bg-green-300 relative">
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-green-100 p-1.5 rounded-full">
                                                <Bot
                                                    size={14}
                                                    className="text-green-500"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Output Chat */}
                                    <div className="bg-white p-4 rounded-xl border border-green-200 shadow-sm shadow-green-100/50">
                                        <div className="flex items-center gap-2 border-b border-gray-50 pb-2 mb-3">
                                            <MessageCircle
                                                size={14}
                                                className="text-green-500"
                                            />
                                            <span className="text-xs font-bold text-gray-600">
                                                WhatsApp Business API
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded-lg rounded-tr-none ml-auto w-[80%] mb-2">
                                            How much for 50 branded umbrellas?
                                        </p>
                                        <p className="text-xs text-green-500 bg-green-50 p-2 rounded-lg rounded-tl-none w-[80%] border border-green-100">
                                            Based on our wholesale list, 50
                                            umbrellas cost KSh 800 each. Total:
                                            KSh 40,000. Need an invoice?
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            variants={fadeInLeft}
                            className="order-1 md:order-2"
                        >
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                                Standalone WhatsApp Agent
                            </h2>
                            <h3 className="text-xl font-semibold text-gray-700 mb-4">
                                No database migration needed. Just upload your
                                files.
                            </h3>
                            <div className="space-y-6 text-gray-600 leading-relaxed">
                                <p>
                                    You don&apos;t need a massive ERP system to
                                    have world-class customer service. Most
                                    business owners lose sales because they are
                                    too busy to reply to a simple &quot;Where
                                    are you located?&quot; or &quot;Send the
                                    price list&quot; DM on Instagram or
                                    WhatsApp.
                                </p>
                                <p>
                                    With SaleSense AI, you simply upload your
                                    existing, unstructured documents—your PDF
                                    menus, rough text FAQs, or Excel price
                                    lists. Our AI reads and understands them
                                    instantly.
                                </p>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-3">
                                        <CheckCircle2
                                            className="stroke-green-500 shrink-0 mt-0.5"
                                            size={20}
                                        />
                                        <span>
                                            <strong>24/7 Availability:</strong>{" "}
                                            Never miss a midnight inquiry. The
                                            AI answers instantly, keeping leads
                                            warm.
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle2
                                            className="stroke-green-500 shrink-0 mt-0.5"
                                            size={20}
                                        />
                                        <span>
                                            <strong>Context Aware:</strong> It
                                            knows when to answer a question and
                                            when to escalate a complex issue to
                                            a human.
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle2
                                            className="stroke-green-500 shrink-0 mt-0.5"
                                            size={20}
                                        />
                                        <span>
                                            <strong>Zero Friction:</strong>{" "}
                                            Works entirely on top of your
                                            existing WhatsApp Business number.
                                        </span>
                                    </li>
                                </ul>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* --- DEEP DIVE 2: B2B Pitch Generator --- */}
            <section
                ref={dive2Ref}
                className="py-24 bg-gray-50 border-y border-gray-100"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        className="grid md:grid-cols-2 gap-16 items-center"
                        initial="hidden"
                        animate={isDive2InView ? "visible" : "hidden"}
                        variants={containerVariants}
                    >
                        <motion.div variants={fadeInRight}>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                                Instant B2B Pitch & Proposal Generator
                            </h2>
                            <h3 className="text-xl font-semibold text-gray-700 mb-4">
                                Turn rough notes into signed contracts in
                                seconds.
                            </h3>
                            <div className="space-y-6 text-gray-600 leading-relaxed">
                                <p>
                                    For service-based businesses, winning
                                    tenders and corporate clients requires
                                    professional documentation. But formatting
                                    Word documents and aligning PDFs takes hours
                                    you don&apos;t have.
                                </p>
                                <p>
                                    Our AI acts as your personal executive
                                    assistant. You simply type in rough bullet
                                    points like{" "}
                                    <em className="text-gray-800 font-medium">
                                        &quot;Client wants 100 t-shirts,
                                        delivery next Tuesday, 50% deposit
                                        required, KSh 1200 per shirt.&quot;
                                    </em>
                                </p>
                                <p>
                                    The AI instantly processes the math,
                                    structures the terms and conditions, applies
                                    your company logo and brand colors, and
                                    generates a beautiful, enterprise-grade PDF
                                    proposal ready to be sent to the client.
                                </p>
                            </div>
                        </motion.div>

                        <motion.div variants={fadeInLeft}>
                            <div className="relative z-10 bg-green-500 rounded-3xl p-8 shadow-xl shadow-gray-200/50">
                                {/* Abstract UI: Notes to PDF */}
                                <div className="space-y-4">
                                    {/* Input Note */}
                                    <div className="bg-green-100 p-4 rounded-xl">
                                        <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wide">
                                            Your Rough Notes
                                        </div>
                                        <p className="text-sm font-mono leading-relaxed">
                                            &gt; Safaricom event next week
                                            <br />
                                            &gt; 200 lanyards @ 350
                                            <br />
                                            &gt; 200 notebooks @ 800
                                            <br />
                                            &gt; Need 60% upfront before print
                                        </p>
                                    </div>

                                    {/* Processing Animation */}
                                    <div className="flex justify-center py-2">
                                        <div className="flex gap-1">
                                            <div
                                                className="w-1.5 h-1.5 rounded-full bg-white animate-bounce"
                                                style={{
                                                    animationDelay: "0ms",
                                                }}
                                            ></div>
                                            <div
                                                className="w-1.5 h-1.5 rounded-full bg-white animate-bounce"
                                                style={{
                                                    animationDelay: "150ms",
                                                }}
                                            ></div>
                                            <div
                                                className="w-1.5 h-1.5 rounded-full bg-white animate-bounce"
                                                style={{
                                                    animationDelay: "300ms",
                                                }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Output PDF */}
                                    <div className="bg-white p-5 rounded-xl border border-gray-200 relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-full h-2 bg-green-500"></div>
                                        <div className="flex justify-between items-start mb-6 mt-2">
                                            <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                                                <div className="w-4 h-4 bg-gray-300 rounded-sm"></div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">
                                                    Quotation
                                                </p>
                                                <p className="text-xs font-bold text-gray-900">
                                                    QT-2026-089
                                                </p>
                                            </div>
                                        </div>
                                        <div className="space-y-3 mb-6">
                                            <div className="flex justify-between items-center bg-gray-50 p-2 rounded text-xs">
                                                <span className="text-gray-600">
                                                    200x Branded Lanyards
                                                </span>
                                                <span className="font-medium text-gray-900">
                                                    KSh 70,000
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center bg-gray-50 p-2 rounded text-xs">
                                                <span className="text-gray-600">
                                                    200x A5 Notebooks
                                                </span>
                                                <span className="font-medium text-gray-900">
                                                    KSh 160,000
                                                </span>
                                            </div>
                                        </div>
                                        <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                                            <span className="text-[10px] text-red-500 font-bold bg-red-50 px-2 py-1 rounded">
                                                60% Deposit: KSh 138,000
                                            </span>
                                            <span className="text-sm font-bold text-gray-900">
                                                Total: KSh 230,000
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* --- DEEP DIVE 3: Social Commerce --- */}
            <section ref={dive3Ref} className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        className="grid md:grid-cols-2 gap-16 items-center"
                        initial="hidden"
                        animate={isDive3InView ? "visible" : "hidden"}
                        variants={containerVariants}
                    >
                        <motion.div
                            variants={fadeInRight}
                            className="order-2 md:order-1"
                        >
                            <div className="relative z-10 bg-gray-50 rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
                                {/* Abstract UI: Image Processing */}
                                <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                                    <div className="h-48 bg-gray-200 relative overflow-hidden group flex items-center justify-center">
                                        {/* Scanner effect line */}
                                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-green-400/20 to-transparent -translate-y-full animate-[scan_3s_ease-in-out_infinite]"></div>
                                        <ImageIcon
                                            className="text-gray-400"
                                            size={48}
                                        />
                                        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded">
                                            Background Removed
                                        </div>
                                    </div>
                                    <div className="p-4 bg-white">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-yellow-400 to-fuchsia-600 flex items-center justify-center">
                                                    <div className="w-5 h-5 rounded-full bg-white border border-gray-100"></div>
                                                </div>
                                                <span className="text-xs font-bold text-gray-900">
                                                    Ready to Post
                                                </span>
                                            </div>
                                            <Sparkles
                                                size={14}
                                                className="text-green-500"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-600 leading-relaxed">
                                            Mzigo mpya imeland! 🔥 High-quality
                                            canvas sneakers perfect for the
                                            weekend. We deliver countrywide via
                                            G4S/Fargo. <br />
                                            <br />
                                            <span className="text-blue-500">
                                                #NairobiFashion #SneakersKenya
                                                #Biashara
                                            </span>
                                        </p>
                                        <button className="w-full mt-4 bg-green-50 text-green-500 text-xs font-bold py-2 rounded-lg border border-green-100 hover:bg-green-100 transition-colors">
                                            Publish to Instagram
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            variants={fadeInLeft}
                            className="order-1 md:order-2"
                        >
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                                Your Personal Creative Director
                            </h2>
                            <h3 className="text-xl font-semibold text-gray-700 mb-4">
                                Professional marketing, zero agency fees.
                            </h3>
                            <div className="space-y-6 text-gray-600 leading-relaxed">
                                <p>
                                    Retail and fashion businesses live and die
                                    by their Instagram feeds and WhatsApp
                                    Statuses. But hiring a photographer and a
                                    social media manager eats directly into your
                                    profits.
                                </p>
                                <p>
                                    With our Social Marketing Agent, you simply
                                    snap a raw photo of your new stock on your
                                    phone.
                                </p>
                                <p>
                                    The AI immediately removes the messy
                                    background, applies a clean, brand-specific
                                    studio backdrop, and generates highly
                                    engaging, localized copy (perfectly
                                    balancing English and Sheng) optimized for
                                    your local audience. It turns a quick phone
                                    photo into an agency-quality ad in under ten
                                    seconds.
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* --- CTA SECTION --- */}
            <CTABanner />

            {/* Added CSS for the scanner animation in Deep Dive 3 */}
            <style jsx global>{`
                @keyframes scan {
                    0% {
                        transform: translateY(-100%);
                    }
                    50% {
                        transform: translateY(100%);
                    }
                    100% {
                        transform: translateY(-100%);
                    }
                }
            `}</style>

            <Footer />
        </div>
    );
}

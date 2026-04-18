"use client";

import { motion, useInView } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

const TESTIMONIALS = [
    {
        name: "John Mwangi",
        role: "Nairobi Retail",
        image: "https://randomuser.me/api/portraits/men/50.jpg",
        quote: "SaleSense has transformed how we handle our daily sales. The M-Pesa integration is seamless, no more manual reconciliation errors.",
        highlight: true, // Highlights this card
    },
    {
        name: "Sarah Kamau",
        role: "Mombasa Foods",
        image: "https://randomuser.me/api/portraits/women/89.jpg",
        quote: "The KRA compliance features save us so much time. Highly recommended for any shop owner who hates paperwork.",
    },
    {
        name: "David Ochieng",
        role: "Kisumu Electronics",
        image: "https://randomuser.me/api/portraits/men/25.jpg",
        quote: "Great customer support and the analytics help us make better decisions.",
    },
    {
        name: "Alice Wanjiku",
        role: "Thika Supermart",
        image: "https://randomuser.me/api/portraits/women/92.jpg",
        quote: "I can finally track my stock levels from my phone while I'm away buying supplies. It gives me peace of mind.",
    },
    {
        name: "Kevin Mutua",
        role: "Machakos Hardware",
        image: "https://randomuser.me/api/portraits/men/80.jpg",
        quote: "Simple, affordable, and it just works. The offline mode is a lifesaver when the internet acts up.",
    },
    {
        name: "Grace Njoroge",
        role: "Nakuru Chemist",
        image: "https://randomuser.me/api/portraits/women/36.jpg",
        quote: "Setting up was incredibly fast. I was selling within 10 minutes of signing up.",
    },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.15 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Testimonials() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <section className="py-24 bg-gray-50 overflow-hidden relative">
            {/* Background Gradient Blur */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-green-100/30 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Header */}
                <div className="text-center mb-16 max-w-2xl mx-auto">
                    <h2 className="text-4xl font-bold text-gray-900 mb-6">
                        What Our Customers Say
                    </h2>
                    <p className="text-xl text-gray-600">
                        Join the community of Kenyan entrepreneurs who trust
                        SaleSense to run their shops.
                    </p>
                </div>

                {/* Masonry Grid */}
                <motion.div
                    ref={ref}
                    className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6"
                    variants={containerVariants}
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                >
                    {TESTIMONIALS.map((t, i) => (
                        <motion.div
                            key={i}
                            variants={itemVariants}
                            className={`break-inside-avoid rounded-lg p-6 md:p-8 border shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1
                                ${
                                    t.highlight
                                        ? "bg-green-600 text-white border-green-500 shadow-green-900/20"
                                        : "bg-white text-gray-900 border-gray-100 hover:border-green-200"
                                }
                            `}
                        >
                            <p
                                className={`text-lg font-medium mb-6 leading-relaxed ${t.highlight ? "text-white" : "text-gray-700"}`}
                            >
                                &quot;{t.quote}&quot;
                            </p>

                            <div className="flex items-center gap-4">
                                <Image
                                    src={t.image}
                                    alt={t.name}
                                    width={48}
                                    height={48}
                                    className={`rounded-full border-2 ${t.highlight ? "border-green-400" : "border-gray-100"}`}
                                    unoptimized
                                />
                                <div>
                                    <h4
                                        className={`font-bold ${t.highlight ? "text-white" : "text-gray-900"}`}
                                    >
                                        {t.name}
                                    </h4>
                                    <p
                                        className={`text-sm ${t.highlight ? "text-green-200" : "text-green-500 font-medium"}`}
                                    >
                                        {t.role}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Bottom Fade Effect (Optional: gives infinite feel) */}
                <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none" />
            </div>
        </section>
    );
}

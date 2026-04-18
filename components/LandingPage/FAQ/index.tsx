"use client";

import React, { useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";

// --- FAQ Data ---
const FAQS = [
    {
        question: "How does M-Pesa integration work?",
        answer: "Simply connect your M-Pesa Till or Paybill number in the settings. Our system listens for transaction messages in real-time and automatically records them against your sales, so you never have to manually reconcile payments.",
    },
    {
        question: "Is my business data secure?",
        answer: "Absolutely. We use bank-level encryption (AES-256) to protect your data. Your information is stored on secure cloud servers with daily backups, ensuring you never lose your records.",
    },
    {
        question: "How does KRA compliance work?",
        answer: "We automatically track your taxable sales and generate the exact reports required by KRA (VAT, Turnover Tax). You can download these reports and upload them to iTax, or use our premium feature to file directly.",
    },
    {
        question: "Do you offer training for my staff?",
        answer: "Yes! We provide a comprehensive onboarding guide, video tutorials, and dedicated support. For larger teams, we can arrange virtual training sessions to ensure everyone knows how to use the POS efficiently.",
    },
];

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
        transition: { duration: 0.5, ease: "easeOut" },
    },
};

export default function FAQ() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleFaq = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <motion.section
            ref={ref}
            className="py-20 bg-white"
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={containerVariants}
        >
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    className="text-center mb-12"
                    variants={itemVariants}
                >
                    <h2 className="text-3xl font-bold text-gray-900">
                        Frequently Asked Questions
                    </h2>
                    <p className="mt-4 text-gray-600 text-lg">
                        Everything you need to know about SaleSense.
                    </p>
                </motion.div>

                <motion.div className="space-y-4" variants={containerVariants}>
                    {FAQS.map((faq, idx) => (
                        <motion.div
                            key={idx}
                            variants={itemVariants}
                            className={`border rounded-lg overflow-hidden transition-all duration-300 ${
                                openIndex === idx
                                    ? "border-green-200 bg-green-50/50 shadow-sm"
                                    : "border-gray-200 bg-white hover:border-green-200"
                            }`}
                        >
                            <button
                                onClick={() => toggleFaq(idx)}
                                className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                            >
                                <span
                                    className={`font-semibold text-lg ${
                                        openIndex === idx
                                            ? "text-green-500"
                                            : "text-gray-900"
                                    }`}
                                >
                                    {faq.question}
                                </span>
                                {openIndex === idx ? (
                                    <ChevronUp
                                        className="text-green-500 shrink-0 ml-4"
                                        size={20}
                                    />
                                ) : (
                                    <ChevronDown
                                        className="text-gray-400 shrink-0 ml-4"
                                        size={20}
                                    />
                                )}
                            </button>
                            <AnimatePresence>
                                {openIndex === idx && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="px-6 pb-6 text-gray-600 leading-relaxed">
                                            {faq.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </motion.section>
    );
}

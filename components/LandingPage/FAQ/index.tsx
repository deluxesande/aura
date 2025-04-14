import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2, // Stagger the animation of child elements
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 }, // Start slightly below and invisible
    visible: {
        opacity: 1,
        y: 0, // Slide up into place
        transition: { duration: 0.6, ease: "easeOut" },
    },
};

export default function FAQ() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    return (
        <motion.section
            ref={ref}
            className="py-20 bg-gray-50"
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={containerVariants}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    className="text-center mb-16"
                    variants={itemVariants}
                >
                    <h2 className="text-3xl font-bold text-gray-900">
                        Frequently Asked Questions
                    </h2>
                    <p className="mt-4 text-gray-600">
                        Everything you need to know about SaleSense
                    </p>
                </motion.div>
                <motion.div
                    className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto"
                    variants={containerVariants}
                >
                    <motion.div variants={itemVariants}>
                        <h3 className="font-semibold text-lg mb-2">
                            How does M-Pesa integration work?
                        </h3>
                        <p className="text-gray-600">
                            Simply connect your Till or Paybill number, and
                            we&apos;ll automatically track all transactions in
                            real-time.
                        </p>
                    </motion.div>
                    <motion.div variants={itemVariants}>
                        <h3 className="font-semibold text-lg mb-2">
                            Is my data secure?
                        </h3>
                        <p className="text-gray-600">
                            Yes, we use bank-level encryption and security
                            measures to protect your business data.
                        </p>
                    </motion.div>
                    <motion.div variants={itemVariants}>
                        <h3 className="font-semibold text-lg mb-2">
                            How does KRA compliance work?
                        </h3>
                        <p className="text-gray-600">
                            We automatically generate KRA-compliant reports and
                            help you stay updated with tax requirements.
                        </p>
                    </motion.div>
                    <motion.div variants={itemVariants}>
                        <h3 className="font-semibold text-lg mb-2">
                            Do you offer training?
                        </h3>
                        <p className="text-gray-600">
                            Yes, we provide comprehensive training to help you
                            get the most out of our platform.
                        </p>
                    </motion.div>
                </motion.div>
            </div>
        </motion.section>
    );
}

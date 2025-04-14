import { motion, useInView } from "framer-motion";
import React, { useRef } from "react";

const bannerVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.6, ease: "easeOut" },
    },
};

const buttonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
        opacity: 1,
        scale: 1.1,
        transition: {
            duration: 0.8,
            ease: "easeOut",
            delay: 0.8, // Delay to ensure it pops after the rest fades in
        },
    },
};

export default function CTABanner() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    return (
        <motion.section
            ref={ref}
            className="bg-gray-50 py-20"
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={bannerVariants}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    className="bg-green-600 rounded-2xl p-8 md:p-12 shadow-sm border border-green-100"
                    variants={bannerVariants}
                >
                    <div className="text-center max-w-3xl mx-auto">
                        <h2 className="text-3xl font-bold text-white mb-4">
                            Ready to grow your business?
                        </h2>
                        <p className="text-gray-50 mb-8">
                            Join thousands of Kenyan businesses using SaleSense
                            to manage their operations.
                        </p>
                        <motion.a
                            href="/sign-up"
                            className="bg-gray-50 text-green-600 px-8 py-3 rounded-lg hover:text-gray-50 hover:bg-green-700 transition-colors"
                            variants={buttonVariants}
                        >
                            Get Started Now
                        </motion.a>
                    </div>
                </motion.div>
            </div>
        </motion.section>
    );
}

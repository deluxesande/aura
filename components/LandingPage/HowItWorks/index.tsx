import { Building2, ArrowRight, Receipt, BarChart3 } from "lucide-react";
import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.8,
            ease: "easeIn",
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, x: -50 }, // Start slightly off-screen to the left
    visible: {
        opacity: 1,
        x: 0, // Slide into place
        transition: { duration: 1 },
    },
};

const arrowVariants = {
    hidden: { opacity: 0, x: 50 }, // Start slightly off-screen to the right
    visible: {
        opacity: 1,
        x: 0, // Slide into place
        transition: {
            duration: 0.9,
            ease: "easeOut",
            repeat: Infinity, // Make it bounce
            repeatType: "reverse" as const, // Reverse the animation on repeat
        },
    },
};

export default function HowItWorks() {
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
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-gray-900">
                        How It Works
                    </h2>
                    <p className="mt-4 text-gray-600">Get started in minutes</p>
                </div>
                <motion.div
                    className="grid md:grid-cols-3 gap-20"
                    variants={containerVariants}
                >
                    <motion.div className="relative" variants={itemVariants}>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                                <Building2 color="#16a34a" size={24} />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">
                                1. Register Business
                            </h3>
                            <p className="text-gray-600">
                                Quick registration with your business details
                                and KRA PIN
                            </p>
                        </div>
                        <motion.div
                            variants={arrowVariants}
                            className="hidden md:block absolute right-[-28px] top-[40%] transform translate-y-1/2 z-10"
                        >
                            <ArrowRight color="#16a34a" size={24} />
                        </motion.div>
                    </motion.div>
                    <motion.div className="relative" variants={itemVariants}>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                                <Receipt color="#16a34a" size={24} />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">
                                2. Connect M-Pesa
                            </h3>
                            <p className="text-gray-600">
                                Link your M-Pesa Till or Paybill number
                            </p>
                        </div>
                        <motion.div
                            variants={arrowVariants}
                            className="hidden md:block absolute right-[-28px] top-[40%] transform translate-y-1/2 z-10"
                        >
                            <ArrowRight color="#16a34a" size={24} />
                        </motion.div>
                    </motion.div>
                    <motion.div
                        className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                        variants={itemVariants}
                    >
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                            <BarChart3 color="#16a34a" size={24} />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">
                            3. Start Managing
                        </h3>
                        <p className="text-gray-600">
                            Begin tracking sales and managing your business
                        </p>
                    </motion.div>
                </motion.div>
            </div>
        </motion.section>
    );
}

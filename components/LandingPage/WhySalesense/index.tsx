import { Receipt, Shield, BarChart3 } from "lucide-react";
import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2,
            duration: 0.6,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, staggerChildren: 0.2 },
    },
};

export default function WhySalesense() {
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
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        Why Choose SaleSense?
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Everything you need to run your business efficiently in
                        one platform
                    </p>
                </motion.div>
                <motion.div
                    className="grid md:grid-cols-3 gap-8"
                    variants={containerVariants}
                >
                    <motion.div
                        className="text-center p-6"
                        variants={itemVariants}
                    >
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Receipt color="#16a34a" size={32} />
                        </div>
                        <h3 className="text-xl font-semibold mb-4">
                            M-Pesa Integration
                        </h3>
                        <p className="text-gray-600">
                            Seamless payment processing with automatic
                            reconciliation and real-time tracking
                        </p>
                    </motion.div>
                    <motion.div
                        className="text-center p-6"
                        variants={itemVariants}
                    >
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Shield color="#16a34a" size={32} />
                        </div>
                        <h3 className="text-xl font-semibold mb-4">
                            KRA Compliance
                        </h3>
                        <p className="text-gray-600">
                            Simplify tax compliance with automated VAT and
                            income tax calculations
                        </p>
                    </motion.div>
                    <motion.div
                        className="text-center p-6"
                        variants={itemVariants}
                    >
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <BarChart3 color="#16a34a" size={32} />
                        </div>
                        <h3 className="text-xl font-semibold mb-4">
                            Business Insights
                        </h3>
                        <p className="text-gray-600">
                            Gain valuable insights into your sales and
                            performance with detailed analytics
                        </p>
                    </motion.div>
                </motion.div>
            </div>
        </motion.section>
    );
}

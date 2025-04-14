"use client";
import Footer from "@/components/LandingPage/Footer";
import Navbar from "@/components/LandingPage/Navbar";
import {
    BarChart3,
    Bell,
    Receipt,
    Shield,
    Smartphone,
    Users,
} from "lucide-react";
import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2, // Stagger animations for child elements
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

export default function FeaturesPage() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Refs for sections
    const heroRef = useRef(null);
    const featuresRef = useRef(null);
    const ctaRef = useRef(null);

    // Track visibility
    const isHeroInView = useInView(heroRef, { once: true });
    const isFeaturesInView = useInView(featuresRef, { once: true });
    const isCtaInView = useInView(ctaRef, { once: true });

    return (
        <div>
            <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

            {/* Hero Section */}
            <motion.section
                ref={heroRef}
                className="bg-gray-50 py-20"
                initial="hidden"
                animate={isHeroInView ? "visible" : "hidden"}
                variants={containerVariants}
            >
                <div className="max-w-7xl mx-auto pt-16 px-4 sm:px-6 lg:px-8">
                    <motion.div className="text-center" variants={itemVariants}>
                        <h1 className="text-4xl font-bold text-gray-900 mb-6">
                            Powerful Features for Your Business
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Everything you need to manage your business
                            effectively with integrated M-Pesa payments and KRA
                            compliance
                        </p>
                    </motion.div>
                </div>
            </motion.section>

            {/* Features Grid */}
            <motion.section
                ref={featuresRef}
                className="py-20 bg-white"
                initial="hidden"
                animate={isFeaturesInView ? "visible" : "hidden"}
                variants={containerVariants}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
                        variants={containerVariants}
                    >
                        {[
                            {
                                icon: <Receipt color="#16a34a" size={24} />,
                                title: "M-Pesa Integration",
                                description:
                                    "Seamless payment processing with real-time transaction tracking and automated reconciliation.",
                            },
                            {
                                icon: <Shield color="#16a34a" size={24} />,
                                title: "KRA Compliance",
                                description:
                                    "Automated tax calculations, reporting, and compliance management for your business.",
                            },
                            {
                                icon: <BarChart3 color="#16a34a" size={24} />,
                                title: "Sales Analytics",
                                description:
                                    "Comprehensive analytics and reporting tools to track your business performance.",
                            },
                            {
                                icon: <Users color="#16a34a" size={24} />,
                                title: "Customer Management",
                                description:
                                    "Track customer information, purchase history, and manage relationships effectively.",
                            },
                            {
                                icon: <Smartphone color="#16a34a" size={24} />,
                                title: "Mobile App",
                                description:
                                    "Manage your business on the go with our powerful mobile application.",
                            },
                            {
                                icon: <Bell color="#16a34a" size={24} />,
                                title: "Smart Notifications",
                                description:
                                    "Stay updated with real-time alerts for transactions, compliance deadlines, and more.",
                            },
                        ].map((feature, index) => (
                            <motion.div
                                key={index}
                                className="p-6 rounded-xl border border-gray-100 hover:border-green-200 transition-colors"
                                variants={itemVariants}
                            >
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-semibold mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </motion.section>

            {/* CTA Section */}
            <motion.section
                ref={ctaRef}
                className="bg-gray-50 py-20"
                initial="hidden"
                animate={isCtaInView ? "visible" : "hidden"}
                variants={containerVariants}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-gray-100"
                        variants={itemVariants}
                    >
                        <div className="text-center max-w-3xl mx-auto">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                Ready to grow your business?
                            </h2>
                            <p className="text-gray-600 mb-8">
                                Join thousands of Kenyan businesses using
                                SaleSense to manage their operations.
                            </p>
                            <a
                                href="/sign-up"
                                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors"
                            >
                                Get Started Now
                            </a>
                        </div>
                    </motion.div>
                </div>
            </motion.section>

            <Footer />
        </div>
    );
}

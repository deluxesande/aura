"use client";
import Footer from "@/components/LandingPage/Footer";
import Navbar from "@/components/LandingPage/Navbar";
import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";

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

export default function AboutPage() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    // Refs for sections
    const heroRef = useRef(null);
    const missionRef = useRef(null);
    const teamRef = useRef(null);

    // Track visibility
    const isHeroInView = useInView(heroRef, { once: true });
    const isMissionInView = useInView(missionRef, { once: true });
    const isTeamInView = useInView(teamRef, { once: true });

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
                    {/* First Section */}
                    <motion.div className="text-center" variants={itemVariants}>
                        <h1 className="text-4xl font-bold text-gray-900 mb-6">
                            About Us
                        </h1>
                        <p className="hidden text-xl text-gray-600 max-w-2xl mx-auto mb-8">
                            Your intelligent companion in mastering modern sales
                            and growth.
                        </p>
                    </motion.div>

                    {/* Second Section */}
                    <motion.div
                        className="mt-16 text-center"
                        variants={itemVariants}
                    >
                        {/* Text on the Right */}
                        <motion.div
                            className="flex-1 space-y-6 flex flex-col"
                            variants={{
                                hidden: { opacity: 0, y: 50 },
                                visible: {
                                    opacity: 1,
                                    y: 0,
                                    transition: { duration: 0.8 },
                                },
                            }}
                        >
                            <p className="text-lg text-gray-600">
                                At SaleSense, we believe sales is more than just
                                numbers. It’s about understanding people,
                                predicting needs, and building trust at every
                                touchpoint. That’s why we’ve created a smart
                                platform designed to empower individuals, teams,
                                and businesses with the insights, tools, and
                                strategies needed to scale sustainably.
                            </p>
                            <p className="text-lg text-gray-600">
                                Behind SaleSense is{" "}
                                <span className="font-semibold">
                                    Deluxe<sup>TM</sup>
                                </span>
                                , a visionary Fullstack Engineer and Designer
                                with a passion for turning bold ideas into
                                meaningful experiences. With a strong background
                                in product design, development, and user
                                behavior, Deluxe TM combines tech and creativity
                                to build solutions that don’t just work — they
                                feel right.
                            </p>
                        </motion.div>
                    </motion.div>
                </div>

                {/* Stats Section */}
                <motion.div
                    className="mt-20 bg-white shadow-sm max-w-7xl mx-auto rounded-md py-4"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={containerVariants}
                >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <motion.div
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center"
                            variants={containerVariants}
                        >
                            {/* Stat 1 */}
                            <motion.div
                                className="p-6 rounded-md border border-gray-100 hover:border-green-200 transition-colors text-center"
                                variants={itemVariants}
                            >
                                <h2 className="text-4xl font-bold text-green-600">
                                    10,000+
                                </h2>
                                <p className="text-gray-600 mt-2">
                                    Businesses Empowered
                                </p>
                            </motion.div>

                            {/* Stat 2 */}
                            <motion.div
                                className="p-6 rounded-md border border-gray-100 hover:border-green-200 transition-colors text-center"
                                variants={itemVariants}
                            >
                                <h2 className="text-4xl font-bold text-green-600">
                                    95%
                                </h2>
                                <p className="text-gray-600 mt-2">
                                    Customer Satisfaction
                                </p>
                            </motion.div>

                            {/* Stat 3 */}
                            <motion.div
                                className="p-6 rounded-md border border-gray-100 hover:border-green-200 transition-colors text-center"
                                variants={itemVariants}
                            >
                                <h2 className="text-4xl font-bold text-green-600">
                                    50+
                                </h2>
                                <p className="text-gray-600 mt-2">
                                    Features Delivered
                                </p>
                            </motion.div>

                            {/* Stat 4 */}
                            <motion.div
                                className="p-6 rounded-md border border-gray-100 hover:border-green-200 transition-colors text-center"
                                variants={itemVariants}
                            >
                                <h2 className="text-4xl font-bold text-green-600">
                                    24/7
                                </h2>
                                <p className="text-gray-600 mt-2">
                                    Customer Support
                                </p>
                            </motion.div>
                        </motion.div>
                    </div>
                </motion.div>
            </motion.section>

            {/* Our Values Section */}
            <motion.section
                className="py-20 bg-white"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={containerVariants}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        className="text-center max-w-3xl mx-auto mb-12"
                        variants={itemVariants}
                    >
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Our Values
                        </h2>
                        <p className="text-gray-600">
                            Powered by{" "}
                            <span className="font-semibold">
                                Deluxe<sup>TM</sup>
                            </span>{" "}
                            ethos of simplicity, strategy, and style — SaleSense
                            isn’t just a tool, it’s your edge in the sales game.
                        </p>
                    </motion.div>
                    <motion.div
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                        variants={containerVariants}
                    >
                        {/* Value 1 */}
                        <motion.div
                            className="p-6 rounded-xl border border-gray-100 hover:border-green-200 transition-colors text-center"
                            variants={itemVariants}
                        >
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Clarity Over Clutter
                            </h3>
                            <p className="text-gray-600">
                                Every feature is built with purpose and
                                ease-of-use in mind.
                            </p>
                        </motion.div>

                        {/* Value 2 */}
                        <motion.div
                            className="p-6 rounded-xl border border-gray-100 hover:border-green-200 transition-colors text-center"
                            variants={itemVariants}
                        >
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Design Meets Functionality
                            </h3>
                            <p className="text-gray-600">
                                We blend stunning interfaces with powerful
                                backends.
                            </p>
                        </motion.div>

                        {/* Value 3 */}
                        <motion.div
                            className="p-6 rounded-xl border border-gray-100 hover:border-green-200 transition-colors text-center"
                            variants={itemVariants}
                        >
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Human-Centered Innovation
                            </h3>
                            <p className="text-gray-600">
                                We put people first, always.
                            </p>
                        </motion.div>
                    </motion.div>
                </div>
            </motion.section>

            {/* Team Section */}
            <motion.section
                ref={teamRef}
                className="py-20 bg-gray-50"
                initial="hidden"
                animate={isTeamInView ? "visible" : "hidden"}
                variants={containerVariants}
                whileInView="visible"
                viewport={{ once: true }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        className="text-center max-w-3xl mx-auto mb-12"
                        variants={itemVariants}
                    >
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Meet Our Team
                        </h2>
                        <p className="text-gray-600">
                            Our team is made up of passionate individuals
                            dedicated to helping businesses succeed. We bring
                            together expertise in technology, business, and
                            customer support to deliver the best experience.
                        </p>
                    </motion.div>
                    <motion.div
                        className="flex items-center justify-center gap-8 flex-wrap w-full"
                        variants={containerVariants}
                    >
                        {[
                            {
                                name: "Deluxe Sande",
                                role: "CEO & Founder",
                                image: "https://randomuser.me/api/portraits/men/70.jpg",
                            },
                        ].map((member, index) => (
                            <motion.div
                                key={index}
                                className="p-6 w-full md:w-96 rounded-xl border border-gray-100 hover:border-green-200 transition-colors text-center"
                                initial="hidden"
                                animate={isTeamInView ? "visible" : "hidden"}
                                variants={containerVariants}
                                whileInView="visible"
                                viewport={{ once: true }}
                            >
                                <img
                                    src={member.image}
                                    alt={member.name}
                                    className="w-24 h-24 rounded-full mx-auto mb-4"
                                />
                                <h3 className="text-xl font-semibold mb-2">
                                    {member.name}
                                </h3>
                                <p className="text-gray-600">{member.role}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </motion.section>

            <Footer />
        </div>
    );
}

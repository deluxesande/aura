"use client";

import Footer from "@/components/LandingPage/Footer";
import Navbar from "@/components/LandingPage/Navbar";
import { motion, useInView } from "framer-motion";
import { Clock, MapPin, Banknote, ArrowRight, SearchX } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { isTauri } from "@/utils/tauri";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 },
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

// Simulated empty array to trigger the not-found state
const jobDepartments: any[] = [];

/* // Original Data for reference:
const jobDepartments = [
    {
        name: "Engineering",
        description: "Build the core infrastructure powering payments and inventory for thousands of businesses.",
        roles: [
            { title: "Senior Fullstack Engineer", tag: "Engineering", location: "Chuka, Kenya (Hybrid)", type: "Full-time", salary: "Competitive" },
            { title: "Android Developer", tag: "Engineering", location: "Nairobi, Kenya (Remote)", type: "Full-time", salary: "Competitive" },
        ],
    },
    {
        name: "Growth & Sales",
        description: "Help us reach more merchants and ensure our current users are getting the most out of SaleSense.",
        roles: [
            { title: "Sales Executive", tag: "Sales", location: "Nairobi, Kenya", type: "Full-time", salary: "Base + Commission" },
            { title: "Customer Success Lead", tag: "Success", location: "Chuka, Kenya", type: "Full-time", salary: "Competitive" },
        ],
    },
];
*/

export default function CareersPage() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const heroRef = useRef(null);
    const isHeroInView = useInView(heroRef, { once: true });
    const jobsRef = useRef(null);
    const isJobsInView = useInView(jobsRef, { once: true });
    const ctaRef = useRef(null);
    const isCtaInView = useInView(ctaRef, { once: true });

    if (isTauri()) return null;

    return (
        <div className="bg-gray-50 min-h-screen flex flex-col">
            <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

            {/* Hero Section */}
            <motion.section
                ref={heroRef}
                className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full"
                initial="hidden"
                animate={isHeroInView ? "visible" : "hidden"}
                variants={containerVariants}
            >
                <div className="text-center max-w-4xl mx-auto">
                    <motion.h1
                        className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight"
                        variants={fadeInUp}
                    >
                        Start doing work that matters
                    </motion.h1>
                    <motion.p
                        className="text-xl text-gray-600"
                        variants={fadeInUp}
                    >
                        Join a team of diverse, passionate people building the
                        financial and operational intelligence layer for Kenyan
                        businesses.
                    </motion.p>
                </div>
            </motion.section>

            {/* Job Listings Section */}
            <motion.section
                ref={jobsRef}
                className="pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex-grow"
                initial="hidden"
                animate={isJobsInView ? "visible" : "hidden"}
                variants={containerVariants}
            >
                {jobDepartments.length === 0 ? (
                    /* Empty State Pattern */
                    <motion.div
                        className="max-w-2xl mx-auto bg-white rounded-lg p-10 md:p-16 text-center border border-gray-100 shadow-sm"
                        variants={fadeInUp}
                    >
                        <div className="flex justify-center mb-8">
                            <div className="w-24 h-24 bg-green-50 rounded-2xl flex items-center justify-center border border-green-100 shadow-inner -rotate-3 hover:rotate-0 transition-all duration-300">
                                <SearchX
                                    className="w-12 h-12 text-green-500"
                                    strokeWidth={1.5}
                                />
                            </div>
                        </div>

                        <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-4">
                            No open roles right now
                        </h3>
                        <p className="text-lg text-gray-500 leading-relaxed">
                            Our engineering and operations crews are currently
                            at full capacity. We don&apos;t have any specific
                            open roles at this exact moment, but our radar is
                            always scanning for great talent.
                        </p>
                    </motion.div>
                ) : (
                    /* Populated State Pattern */
                    <div className="space-y-16">
                        {jobDepartments.map((dept, index) => (
                            <motion.div
                                key={index}
                                variants={fadeInUp}
                                className="grid grid-cols-1 lg:grid-cols-12 gap-8"
                            >
                                {/* Left Column: Department Info */}
                                <div className="lg:col-span-4 pt-2">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                                        {dept.name}
                                    </h2>
                                    <p className="text-gray-500 leading-relaxed pr-4">
                                        {dept.description}
                                    </p>
                                </div>

                                {/* Right Column: Job Cards */}
                                <div className="lg:col-span-8 space-y-4">
                                    {dept.roles.map(
                                        (role: any, roleIndex: number) => (
                                            <Link
                                                href={`/careers/${role.title.toLowerCase().replace(/\s+/g, "-")}`}
                                                key={roleIndex}
                                                className="block bg-white rounded-lg p-6 md:p-8 border border-gray-100 shadow-sm hover:shadow-md transition-all group"
                                            >
                                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-500 transition-colors">
                                                                {role.title}
                                                            </h3>
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-green-50 text-green-500 text-xs font-bold border border-green-100">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>
                                                                {role.tag}
                                                            </span>
                                                        </div>
                                                        <p className="text-gray-500 text-sm">
                                                            We are looking for
                                                            an experienced{" "}
                                                            {role.title.toLowerCase()}{" "}
                                                            to join our team.
                                                        </p>
                                                    </div>

                                                    <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 shrink-0">
                                                        <MapPin
                                                            size={16}
                                                            className="text-green-500"
                                                        />
                                                        {role.location}
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-6 mt-6 pt-6 border-t border-gray-50">
                                                    <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                                                        <Clock size={16} />
                                                        {role.type}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                                                        <Banknote size={16} />
                                                        {role.salary}
                                                    </div>

                                                    <div className="ml-auto text-green-500 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                                        <ArrowRight size={20} />
                                                    </div>
                                                </div>
                                            </Link>
                                        ),
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.section>

            <Footer />
        </div>
    );
}

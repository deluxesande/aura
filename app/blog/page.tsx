"use client";

import Navbar from "@/components/LandingPage/Navbar";
import Footer from "@/components/LandingPage/Footer";
import { BLOG_POSTS, BlogPost } from "@/utils/blog/blog-data";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, Clock, Tag } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

export default function BlogPage() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="bg-gray-50 min-h-screen">
            <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

            {/* Header Section */}
            <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-500 text-xs font-bold uppercase tracking-wider mb-6">
                            Resources & Guides
                        </div>
                        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
                            Master Your Business Growth
                        </h1>
                        <p className="text-xl text-gray-600 mb-8 max-w-lg">
                            Expert advice, technical guides, and business tips
                            for the modern Kenyan entrepreneur.
                        </p>
                    </motion.div>
                    {/* Abstract Decoration Right */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="hidden lg:block relative"
                    >
                        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 relative z-10">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                                <Tag className="stroke-green-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                Featured Guide
                            </h3>
                            <p className="text-gray-600 mb-4">
                                How to Integrate M-Pesa with SaleSense in 5
                                minutes.
                            </p>
                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full w-2/3 bg-green-500 rounded-full"></div>
                            </div>
                        </div>
                        <div className="absolute top-10 -right-10 w-full h-full bg-green-500/10 rounded-3xl -z-10 transform rotate-6"></div>
                    </motion.div>
                </div>
            </section>

            {/* Blog Grid */}
            <section className="pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {BLOG_POSTS.map((post: BlogPost, index: number) => (
                        <motion.div
                            key={post.slug}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="group bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-green-100/50 transition-all duration-300 flex flex-col h-full"
                        >
                            <div className="aspect-video bg-gray-200 relative overflow-hidden">
                                {/* Fallback pattern (visible while loading or if image fails) */}
                                <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-gray-100 flex items-center justify-center">
                                    <span className="text-green-200 font-bold text-6xl opacity-20">
                                        SaleSense
                                    </span>
                                </div>
                                <Image
                                    src={post.image}
                                    alt={post.title}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-green-500 uppercase tracking-wide">
                                    {post.category}
                                </div>
                            </div>

                            <div className="p-8 flex flex-col flex-1">
                                <div className="flex items-center gap-4 text-xs text-gray-400 mb-4 font-medium">
                                    <div className="flex items-center gap-1">
                                        <Calendar size={14} /> {post.date}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock size={14} /> {post.readTime}
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors">
                                    {post.title}
                                </h3>
                                <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-1">
                                    {post.excerpt}
                                </p>

                                <Link
                                    href={`/blog/${post.slug}`}
                                    className="inline-flex items-center text-green-500 font-bold text-sm hover:gap-2 transition-all"
                                >
                                    Read Article{" "}
                                    <ArrowRight
                                        size={16}
                                        className="ml-1 stroke-green-500"
                                    />
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            <Footer />
        </div>
    );
}

"use client";

import CTABanner from "@/components/LandingPage/CTABanner";
import Footer from "@/components/LandingPage/Footer";
import Navbar from "@/components/LandingPage/Navbar";
import { HELP_ARTICLES, HELP_CATEGORIES } from "@/utils/help/help-data";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronRight, HelpCircle, Search, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const fadeIn = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function HelpCenterPage() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const filteredArticles =
        searchQuery.length > 0
            ? HELP_ARTICLES.filter(
                  (article) =>
                      article.title
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase()) ||
                      article.content.some((block: any) =>
                          block.text
                              ?.toLowerCase()
                              .includes(searchQuery.toLowerCase()),
                      ),
              )
            : [];

    const clearSearch = () => setSearchQuery("");

    return (
        <div className="bg-white min-h-screen">
            <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
            <section className="bg-gray-50 border-b border-gray-100 pt-36 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto text-center">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={fadeIn}
                    >
                        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
                            How can we help?
                        </h1>

                        <div className="relative max-w-2xl mx-auto mb-8">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search for articles (e.g., 'Paybill', 'Tax')"
                                className="w-full pl-14 pr-12 py-5 bg-white border border-gray-200 rounded-lg text-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-lg shadow-gray-100 transition-all"
                            />
                            <Search
                                className="absolute left-5 top-1/2 -translate-y-1/2 stroke-green-500"
                                size={24}
                            />

                            {searchQuery && (
                                <button
                                    onClick={clearSearch}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 bg-gray-100 rounded-full"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>

                        {!searchQuery && (
                            <div className="flex flex-wrap justify-center gap-3 text-sm text-gray-600">
                                <span className="font-medium text-gray-400">
                                    Popular:
                                </span>
                                <button
                                    onClick={() => setSearchQuery("M-Pesa")}
                                    className="hover:text-green-500 hover:underline"
                                >
                                    M-Pesa Integration
                                </button>
                                <span className="text-gray-300">•</span>
                                <button
                                    onClick={() => setSearchQuery("Tax")}
                                    className="hover:text-green-500 hover:underline"
                                >
                                    Tax Reports
                                </button>
                                <span className="text-gray-300">•</span>
                                <button
                                    onClick={() => setSearchQuery("Reset")}
                                    className="hover:text-green-500 hover:underline"
                                >
                                    Reset Password
                                </button>
                            </div>
                        )}
                    </motion.div>
                </div>
            </section>

            {/* --- CONTENT AREA --- */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto min-h-[400px]">
                <AnimatePresence mode="wait">
                    {/* CASE 1: SEARCH RESULTS */}
                    {searchQuery.length > 0 ? (
                        <motion.div
                            key="search-results"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="max-w-3xl mx-auto"
                        >
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">
                                {filteredArticles.length} Results found for
                                &quot;
                                {searchQuery}&quot;
                            </h3>

                            {filteredArticles.length > 0 ? (
                                <div className="space-y-4">
                                    {filteredArticles.map((article) => (
                                        <Link
                                            key={article.slug}
                                            href={`/help-center/${article.categorySlug}/${article.slug}`}
                                            className="block bg-white p-6 rounded-lg border border-gray-200 hover:border-green-500 hover:shadow-md transition-all group"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="text-lg font-bold text-gray-900 group-hover:text-green-500 mb-2">
                                                        {article.title}
                                                    </h4>
                                                    <p className="text-gray-500 text-sm line-clamp-2">
                                                        {/* Preview text from first paragraph */}
                                                        {article.content.find(
                                                            (c: any) =>
                                                                c.type ===
                                                                "paragraph",
                                                        )?.text ||
                                                            "Click to read more..."}
                                                    </p>
                                                </div>
                                                <ArrowRight
                                                    className="text-gray-300 group-hover:text-green-500 shrink-0 mt-1"
                                                    size={20}
                                                />
                                            </div>
                                            <div className="mt-4 flex gap-2">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    {article.categorySlug.replace(
                                                        "-",
                                                        " ",
                                                    )}
                                                </span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 shadow-sm">
                                        <HelpCircle
                                            className="stroke-green-500"
                                            size={32}
                                        />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900">
                                        No results found
                                    </h3>
                                    <p className="text-gray-500 mt-1">
                                        Try using different keywords or browse
                                        the categories below.
                                    </p>
                                    <button
                                        onClick={clearSearch}
                                        className="mt-6 text-green-500 font-bold hover:underline"
                                    >
                                        Clear Search
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        /* CASE 2: CATEGORY LIST (Default View) */
                        <motion.div
                            key="categories"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <div className="grid md:grid-cols-2 gap-x-12 gap-y-12">
                                {HELP_CATEGORIES.map((category, idx) => {
                                    const Icon = category.icon;
                                    return (
                                        <div key={idx} className="group">
                                            <Link
                                                href={`/help-center/${category.slug}`}
                                                className="flex items-start gap-6 hover:bg-gray-50 p-4 -ml-4 rounded-lg transition-colors"
                                            >
                                                <div className="shrink-0 w-14 h-14 bg-green-50 rounded-lg flex items-center justify-center text-green-500 group-hover:bg-green-500 group-hover:text-white transition-colors duration-300">
                                                    <Icon
                                                        size={28}
                                                        className="stroke-green-500 group-hover:stroke-white transition-colors duration-300"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-500">
                                                            {category.title}
                                                        </h3>
                                                        <ChevronRight
                                                            size={18}
                                                            className="text-gray-300 group-hover:text-green-500 group-hover:translate-x-1 transition-all"
                                                        />
                                                    </div>
                                                    <p className="text-gray-600 text-sm leading-relaxed">
                                                        {category.description}
                                                    </p>

                                                    {/* Optional: Show popular articles count or quick links here if avail in data */}
                                                    <div className="mt-4 flex items-center gap-2 text-xs font-medium text-green-500 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                                                        View Articles
                                                    </div>
                                                </div>
                                            </Link>
                                            {/* Divider */}
                                            <div className="h-px bg-gray-100 w-full mt-6" />
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>

            <CTABanner />
            <Footer />
        </div>
    );
}

"use client";

import Navbar from "@/components/LandingPage/Navbar";
import Footer from "@/components/LandingPage/Footer";
import { HELP_ARTICLES, HELP_CATEGORIES } from "@/utils/help/help-data";
import { ArrowLeft, ThumbsUp, ThumbsDown } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useState, use } from "react";

export default function HelpArticlePage({
    params,
}: {
    params: Promise<{ category: string; slug: string }>;
}) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { category, slug } = use(params);

    const article = HELP_ARTICLES.find(
        (a) => a.slug === slug && a.categorySlug === category,
    );

    const categoryData = HELP_CATEGORIES.find((c) => c.slug === category);

    if (!article || !categoryData) {
        return notFound();
    }

    return (
        <div className="bg-white min-h-screen">
            <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Sidebar Navigation (Desktop) */}
                    <aside className="hidden lg:block w-64 shrink-0">
                        <Link
                            href={`/help-center/${category}`}
                            className="flex items-center text-sm font-semibold text-gray-500 hover:text-green-500 mb-8 transition-colors"
                        >
                            <ArrowLeft size={16} className="mr-2" />{" "}
                            {categoryData.title}
                        </Link>

                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                            In this category
                        </h4>
                        <nav className="space-y-1">
                            {HELP_ARTICLES.filter(
                                (a) => a.categorySlug === category,
                            ).map((link) => (
                                <Link
                                    key={link.slug}
                                    href={`/help-center/${category}/${link.slug}`}
                                    className={`block px-3 py-2 rounded-lg text-sm transition-colors ${link.slug === slug ? "bg-green-50 text-green-700 font-medium" : "text-gray-600 hover:bg-gray-50"}`}
                                >
                                    {link.title}
                                </Link>
                            ))}
                        </nav>
                    </aside>

                    {/* Main Content */}
                    <article className="flex-1 max-w-3xl">
                        {/* Mobile Back Link */}
                        <Link
                            href={`/help-center/${category}`}
                            className="lg:hidden inline-flex items-center text-sm text-gray-500 mb-6"
                        >
                            <ArrowLeft size={16} className="mr-2" /> Back
                        </Link>

                        <div className="mb-8 pb-8 border-b border-gray-100">
                            <div className="flex gap-2 text-sm text-green-600 font-medium mb-3">
                                <span>Help Center</span>
                                <span>/</span>
                                <span>{categoryData.title}</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                {article.title}
                            </h1>
                            <p className="text-gray-500 text-sm">
                                Last updated: {article.updatedAt}
                            </p>
                        </div>

                        <div className="prose prose-green max-w-none text-gray-600">
                            {article.content.map((block: any, i: number) => {
                                switch (block.type) {
                                    case "paragraph":
                                        return (
                                            <p
                                                key={i}
                                                className="mb-6 leading-relaxed"
                                            >
                                                {block.text}
                                            </p>
                                        );
                                    case "step":
                                        return (
                                            <div
                                                key={i}
                                                className="flex gap-4 mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100"
                                            >
                                                <div className="shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                                                    {i + 1}
                                                </div>
                                                <div className="text-gray-800 font-medium">
                                                    {block.text}
                                                </div>
                                            </div>
                                        );
                                    case "alert":
                                        return (
                                            <div
                                                key={i}
                                                className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg mb-8 text-yellow-800 text-sm"
                                            >
                                                <span className="font-bold block mb-1">
                                                    Note:
                                                </span>
                                                {block.text}
                                            </div>
                                        );
                                    default:
                                        return null;
                                }
                            })}
                        </div>

                        {/* Feedback Section */}
                        <div className="mt-16 pt-8 border-t border-gray-100">
                            <h4 className="font-bold text-gray-900 mb-4">
                                Was this article helpful?
                            </h4>
                            <div className="flex gap-4">
                                <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:border-green-500 hover:text-green-500 transition-all">
                                    <ThumbsUp size={18} /> Yes
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:border-red-500 hover:text-red-600 transition-all">
                                    <ThumbsDown size={18} /> No
                                </button>
                            </div>
                        </div>
                    </article>
                </div>
            </div>

            <Footer />
        </div>
    );
}

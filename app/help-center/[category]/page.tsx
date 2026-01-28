"use client";

import CTABanner from "@/components/LandingPage/CTABanner";
import Footer from "@/components/LandingPage/Footer";
import Navbar from "@/components/LandingPage/Navbar";
import { HELP_ARTICLES, HELP_CATEGORIES } from "@/utils/help/help-data";
import { ArrowLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { use, useState } from "react";

export default function HelpCategoryPage({
    params,
}: {
    params: Promise<{ category: string }>;
}) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { category } = use(params);

    // Find Category Info
    const categoryData = HELP_CATEGORIES.find((c) => c.slug === category);

    // Find Articles in this Category
    const articles = HELP_ARTICLES.filter((a) => a.categorySlug === category);

    if (!categoryData) {
        return notFound();
    }

    const Icon = categoryData.icon;

    return (
        <div className="bg-gray-50 min-h-screen">
            <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

            {/* Header */}
            <section className="bg-white border-b border-gray-100 pt-32 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    <Link
                        href="/help-center"
                        className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-green-500 mb-6 transition-colors"
                    >
                        <ArrowLeft size={16} className="mr-2" /> Back to Help
                        Center
                    </Link>

                    <div className="flex items-center gap-4 mb-4">
                        <h1 className="text-3xl font-bold text-gray-900">
                            {categoryData.title}
                        </h1>
                    </div>
                    <p className="text-gray-600 text-lg">
                        {categoryData.description}
                    </p>
                </div>
            </section>

            {/* Article List */}
            <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    {articles.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                            {articles.map((article) => (
                                <Link
                                    key={article.slug}
                                    href={`/help-center/${category}/${article.slug}`}
                                    className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors group"
                                >
                                    <div className="flex items-start gap-4">
                                        <div>
                                            <h3 className="font-semibold text-gray-900 group-hover:text-green-500 transition-colors">
                                                {article.title}
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Last updated:{" "}
                                                {article.updatedAt}
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronRight
                                        className="text-gray-300 group-hover:text-green-500"
                                        size={20}
                                    />
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="p-12 text-center text-gray-500">
                            <p>No articles found in this category yet.</p>
                        </div>
                    )}
                </div>
            </section>

            <CTABanner />
            <Footer />
        </div>
    );
}

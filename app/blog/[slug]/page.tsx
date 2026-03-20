"use client";

import Navbar from "@/components/LandingPage/Navbar";
import Footer from "@/components/LandingPage/Footer";
import { BLOG_POSTS, BlogPost } from "@/utils/blog/blog-data";
import { ArrowLeft, Clock, Share2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useState, use } from "react";
import CTABanner from "@/components/LandingPage/CTABanner";
import { toast } from "sonner";

export default function BlogPostPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const { slug } = use(params);

    const post = BLOG_POSTS.find((p: any) => p.slug === slug);

    if (!post) {
        return notFound();
    }

    const handleShare = () => {
        if (typeof window !== "undefined") {
            navigator.clipboard.writeText(window.location.href);
            toast.success("Link copied to clipboard!");
        }
    };

    return (
        <div className="bg-white min-h-screen">
            <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

            <article className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
                {/* Back Link */}
                <Link
                    href="/blog"
                    className="inline-flex items-center text-gray-500 hover:text-green-500 mb-8 transition-colors text-sm font-medium"
                >
                    <ArrowLeft
                        size={16}
                        className="mr-2 hover:stroke-green-500"
                    />{" "}
                    Back to Blog
                </Link>

                {/* Header */}
                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="bg-green-100 text-green-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                            {post.category}
                        </span>
                        <span className="text-gray-400 text-sm flex items-center gap-1">
                            <Clock size={14} className="stroke-gray-400" />{" "}
                            {post.readTime}
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
                        {post.title}
                    </h1>
                    <div className="flex items-center justify-between border-b border-gray-100 pb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-gray-500 font-bold text-xs">
                                DS
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900">
                                    Deluxe Sande
                                </p>
                                <p className="text-xs text-gray-500">
                                    {post.date}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleShare}
                            className="text-gray-400 hover:text-green-600 transition-colors p-2 hover:bg-gray-50 rounded-full"
                            title="Copy Link"
                        >
                            <Share2 size={20} className="stroke-green-500" />
                        </button>
                    </div>
                </div>

                {/* Content Renderer */}
                <div className="prose prose-lg prose-green max-w-none">
                    {post.content.map(
                        (
                            block: {
                                type:
                                    | "paragraph"
                                    | "heading"
                                    | "list"
                                    | "alert"
                                    | "step";
                                text?: string;
                                items?: string[];
                            },
                            i: number,
                        ) => {
                            switch (block.type) {
                                case "heading":
                                    return (
                                        <h2
                                            key={i}
                                            className="text-2xl font-bold text-gray-900 mt-10 mb-4"
                                        >
                                            {block.text}
                                        </h2>
                                    );
                                case "paragraph":
                                    return (
                                        <p
                                            key={i}
                                            className="text-gray-600 leading-relaxed mb-6"
                                        >
                                            {block.text}
                                        </p>
                                    );
                                case "step":
                                    return (
                                        <div
                                            key={i}
                                            className="flex gap-4 mb-6"
                                        >
                                            <div className="shrink-0 w-8 h-8 bg-green-50 text-green-600 rounded-full flex items-center justify-center font-bold text-sm border border-green-100">
                                                ✓
                                            </div>
                                            <p className="text-gray-700 mt-1">
                                                {block.text}
                                            </p>
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
                                case "list":
                                    return (
                                        <ul
                                            key={i}
                                            className="bg-gray-50 p-6 rounded-lg space-y-2 mb-8"
                                        >
                                            {block.items?.map(
                                                (item: any, idx: number) => (
                                                    <li
                                                        key={idx}
                                                        className="flex items-center gap-3 text-gray-700 font-light text-sm"
                                                    >
                                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                                        {item}
                                                    </li>
                                                ),
                                            )}
                                        </ul>
                                    );
                                default:
                                    return null;
                            }
                        },
                    )}
                </div>
            </article>
            <CTABanner />

            <Footer />
        </div>
    );
}

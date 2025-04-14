"use client";
import Footer from "@/components/LandingPage/Footer";
import Navbar from "@/components/LandingPage/Navbar";
import { Check } from "lucide-react";
import { useState } from "react";

export default function PricingPage() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    return (
        <div className="">
            <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

            {/* Hero Section */}
            <section className="bg-gray-50 py-20">
                <div className="max-w-7xl mx-auto pt-16 px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-gray-900 mb-6">
                            Simple, Transparent Pricing
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Choose the perfect plan for your business needs
                        </p>
                    </div>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Starter Plan */}
                        <div className="border border-gray-100 rounded-2xl p-8 hover:border-green-200 transition-colors">
                            <div className="text-center mb-8">
                                <h3 className="text-xl font-semibold mb-2">
                                    Starter
                                </h3>
                                <div className="text-4xl font-bold mb-4">
                                    KSh 2,999
                                    <span className="text-gray-500 text-base font-normal">
                                        /mo
                                    </span>
                                </div>
                                <p className="text-gray-600">
                                    Perfect for small businesses
                                </p>
                            </div>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center text-gray-600">
                                    <Check
                                        className="text-green-600 mr-3"
                                        size={20}
                                    />
                                    Up to 500 transactions/month
                                </li>
                                <li className="flex items-center text-gray-600">
                                    <Check
                                        className="text-green-600 mr-3"
                                        size={20}
                                    />
                                    Basic M-Pesa integration
                                </li>
                                <li className="flex items-center text-gray-600">
                                    <Check
                                        className="text-green-600 mr-3"
                                        size={20}
                                    />
                                    KRA compliance reports
                                </li>
                                <li className="flex items-center text-gray-600">
                                    <Check
                                        className="text-green-600 mr-3"
                                        size={20}
                                    />
                                    Email support
                                </li>
                            </ul>
                            <a
                                href="/sign-up"
                                className="w-full py-3 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
                            >
                                Get Started
                            </a>
                        </div>

                        {/* Professional Plan */}
                        <div className="border-2 border-green-600 rounded-2xl p-8 relative bg-white shadow-lg">
                            <div className="absolute top-0 right-4 bg-green-600 text-white px-4 py-1 rounded-b-lg text-sm">
                                Popular
                            </div>
                            <div className="text-center mb-8">
                                <h3 className="text-xl font-semibold mb-2">
                                    Professional
                                </h3>
                                <div className="text-4xl font-bold mb-4">
                                    KSh 4,999
                                    <span className="text-gray-500 text-base font-normal">
                                        /mo
                                    </span>
                                </div>
                                <p className="text-gray-600">
                                    Best for growing businesses
                                </p>
                            </div>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center text-gray-600">
                                    <Check
                                        className="text-green-600 mr-3"
                                        size={20}
                                    />
                                    Unlimited transactions
                                </li>
                                <li className="flex items-center text-gray-600">
                                    <Check
                                        className="text-green-600 mr-3"
                                        size={20}
                                    />
                                    Advanced M-Pesa features
                                </li>
                                <li className="flex items-center text-gray-600">
                                    <Check
                                        className="text-green-600 mr-3"
                                        size={20}
                                    />
                                    Full KRA compliance suite
                                </li>
                                <li className="flex items-center text-gray-600">
                                    <Check
                                        className="text-green-600 mr-3"
                                        size={20}
                                    />
                                    Priority support
                                </li>
                                <li className="flex items-center text-gray-600">
                                    <Check
                                        className="text-green-600 mr-3"
                                        size={20}
                                    />
                                    Advanced analytics
                                </li>
                            </ul>
                            <a
                                href="/sign-up"
                                className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                Get Started
                            </a>
                        </div>

                        {/* Enterprise Plan */}
                        <div className="border border-gray-100 rounded-2xl p-8 hover:border-green-200 transition-colors">
                            <div className="text-center mb-8">
                                <h3 className="text-xl font-semibold mb-2">
                                    Enterprise
                                </h3>
                                <div className="text-4xl font-bold mb-4">
                                    Custom
                                </div>
                                <p className="text-gray-600">
                                    For large organizations
                                </p>
                            </div>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center text-gray-600">
                                    <Check
                                        className="text-green-600 mr-3"
                                        size={20}
                                    />
                                    Custom transaction limits
                                </li>
                                <li className="flex items-center text-gray-600">
                                    <Check
                                        className="text-green-600 mr-3"
                                        size={20}
                                    />
                                    Custom integration options
                                </li>
                                <li className="flex items-center text-gray-600">
                                    <Check
                                        className="text-green-600 mr-3"
                                        size={20}
                                    />
                                    Dedicated account manager
                                </li>
                                <li className="flex items-center text-gray-600">
                                    <Check
                                        className="text-green-600 mr-3"
                                        size={20}
                                    />
                                    24/7 priority support
                                </li>
                                <li className="flex items-center text-gray-600">
                                    <Check
                                        className="text-green-600 mr-3"
                                        size={20}
                                    />
                                    Custom reporting
                                </li>
                            </ul>
                            <a
                                href="/sign-up"
                                className="w-full py-3 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
                            >
                                Contact Sales
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}

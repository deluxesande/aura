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
import { useState } from "react";

export default function FeaturesPage() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    return (
        <div className="">
            <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

            {/* Hero Section */}
            <section className="bg-gray-50 py-20">
                <div className="max-w-7xl mx-auto pt-16 px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-gray-900 mb-6">
                            Powerful Features for Your Business
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Everything you need to manage your business
                            effectively with integrated M-Pesa payments and KRA
                            compliance
                        </p>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="p-6 rounded-xl border border-gray-100 hover:border-green-200 transition-colors">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                                <Receipt color="#16a34a" size={24} />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">
                                M-Pesa Integration
                            </h3>
                            <p className="text-gray-600">
                                Seamless payment processing with real-time
                                transaction tracking and automated
                                reconciliation.
                            </p>
                        </div>
                        <div className="p-6 rounded-xl border border-gray-100 hover:border-green-200 transition-colors">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                                <Shield color="#16a34a" size={24} />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">
                                KRA Compliance
                            </h3>
                            <p className="text-gray-600">
                                Automated tax calculations, reporting, and
                                compliance management for your business.
                            </p>
                        </div>
                        <div className="p-6 rounded-xl border border-gray-100 hover:border-green-200 transition-colors">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                                <BarChart3 color="#16a34a" size={24} />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">
                                Sales Analytics
                            </h3>
                            <p className="text-gray-600">
                                Comprehensive analytics and reporting tools to
                                track your business performance.
                            </p>
                        </div>
                        <div className="p-6 rounded-xl border border-gray-100 hover:border-green-200 transition-colors">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                                <Users color="#16a34a" size={24} />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">
                                Customer Management
                            </h3>
                            <p className="text-gray-600">
                                Track customer information, purchase history,
                                and manage relationships effectively.
                            </p>
                        </div>
                        <div className="p-6 rounded-xl border border-gray-100 hover:border-green-200 transition-colors">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                                <Smartphone color="#16a34a" size={24} />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">
                                Mobile App
                            </h3>
                            <p className="text-gray-600">
                                Manage your business on the go with our powerful
                                mobile application.
                            </p>
                        </div>
                        <div className="p-6 rounded-xl border border-gray-100 hover:border-green-200 transition-colors">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                                <Bell color="#16a34a" size={24} />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">
                                Smart Notifications
                            </h3>
                            <p className="text-gray-600">
                                Stay updated with real-time alerts for
                                transactions, compliance deadlines, and more.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-gray-50 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-gray-100">
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
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}

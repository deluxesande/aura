"use client";
import Footer from "@/components/LandingPage/Footer";
import Navbar from "@/components/LandingPage/Navbar";
import { CheckCircle2, Receipt, Shield } from "lucide-react";
import { useState } from "react";

export default function IntegrationPage() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    return (
        <div className="">
            <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

            {/* Hero Section */}
            <section className="bg-gray-50 py-20">
                <div className="max-w-7xl mx-auto pt-16 px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-gray-900 mb-6">
                            Seamless Integration
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Connect your business with M-Pesa and KRA systems
                            effortlessly
                        </p>
                    </div>
                </div>
            </section>

            {/* M-Pesa Integration */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="inline-flex items-center px-4 py-2 bg-green-100 rounded-full text-green-600 mb-6">
                                <Receipt
                                    size={20}
                                    color="#16a34a"
                                    className="mr-2"
                                />{" "}
                                M-Pesa Integration
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">
                                Process Payments Seamlessly
                            </h2>
                            <div className="space-y-4">
                                <div className="flex items-start">
                                    <CheckCircle2
                                        className="text-green-600 mt-1 mr-3"
                                        color="#16a34a"
                                        size={20}
                                    />
                                    <p className="text-gray-600">
                                        Direct integration with M-Pesa Till and
                                        Paybill numbers
                                    </p>
                                </div>
                                <div className="flex items-start">
                                    <CheckCircle2
                                        className="text-green-600 mt-1 mr-3"
                                        color="#16a34a"
                                        size={20}
                                    />
                                    <p className="text-gray-600">
                                        Real-time transaction notifications
                                    </p>
                                </div>
                                <div className="flex items-start">
                                    <CheckCircle2
                                        className="text-green-600 mt-1 mr-3"
                                        color="#16a34a"
                                        size={20}
                                    />
                                    <p className="text-gray-600">
                                        Automated reconciliation and reporting
                                    </p>
                                </div>
                                <div className="flex items-start">
                                    <CheckCircle2
                                        className="text-green-600 mt-1 mr-3"
                                        color="#16a34a"
                                        size={20}
                                    />
                                    <p className="text-gray-600">
                                        Support for multiple payment methods
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-100 hover:border-green-200 transition-colors p-6 shadow-sm flex items-center justify-center">
                            <img
                                src="/images/M-PESA-logo-2.png"
                                alt="M-Pesa Integration"
                                className="max-w-[240px] lg:max-w-xl p-6 lg:p-32 rounded-xl"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* KRA Integration */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="order-2 md:order-1 bg-white rounded-2xl border border-gray-100 hover:border-green-200 transition-colors p-6 shadow-sm flex items-center justify-center">
                            <img
                                src="/images/kra-seeklogo.png"
                                alt="KRA Integration"
                                className="max-w-[240px] lg:max-w-xl p-6 lg:p-32 rounded-xl"
                            />
                        </div>
                        <div className="order-1 md:order-2">
                            <div className="inline-flex items-center px-4 py-2 bg-green-100 rounded-full text-green-600 mb-6">
                                <Shield
                                    size={20}
                                    color="#16a34a"
                                    className="mr-2"
                                />{" "}
                                KRA Compliance
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">
                                Automated Tax Compliance
                            </h2>
                            <div className="space-y-4">
                                <div className="flex items-start">
                                    <CheckCircle2
                                        className="text-green-600 mt-1 mr-3"
                                        color="#16a34a"
                                        size={20}
                                    />
                                    <p className="text-gray-600">
                                        Automatic tax calculations and returns
                                    </p>
                                </div>
                                <div className="flex items-start">
                                    <CheckCircle2
                                        className="text-green-600 mt-1 mr-3"
                                        color="#16a34a"
                                        size={20}
                                    />
                                    <p className="text-gray-600">
                                        Real-time compliance monitoring
                                    </p>
                                </div>
                                <div className="flex items-start">
                                    <CheckCircle2
                                        className="text-green-600 mt-1 mr-3"
                                        color="#16a34a"
                                        size={20}
                                    />
                                    <p className="text-gray-600">
                                        Automated reporting and documentation
                                    </p>
                                </div>
                                <div className="flex items-start">
                                    <CheckCircle2
                                        className="text-green-600 mt-1 mr-3"
                                        color="#16a34a"
                                        size={20}
                                    />
                                    <p className="text-gray-600">
                                        Tax deadline reminders and alerts
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}

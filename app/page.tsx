"use client";
import Footer from "@/components/LandingPage/Footer";
import MainHeader from "@/components/LandingPage/MainHeader";
import Navbar from "@/components/LandingPage/Navbar";
import {
    ArrowRight,
    BarChart3,
    Building2,
    ChevronRight,
    Phone,
    Receipt,
    Shield,
} from "lucide-react";
import { useState } from "react";
export default function App() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    return (
        <div className="w-full min-h-screen bg-white">
            <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

            <MainHeader />

            <section className="py-20 bg-gray-50 -mt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900">
                            How It Works
                        </h2>
                        <p className="mt-4 text-gray-600">
                            Get started in minutes
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="relative">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                                    <Building2
                                        className="text-green-600"
                                        size={24}
                                    />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">
                                    1. Register Business
                                </h3>
                                <p className="text-gray-600">
                                    Quick registration with your business
                                    details and KRA PIN
                                </p>
                            </div>
                            <div className="hidden md:block absolute -right-4 top-1/2 transform -translate-y-1/2 z-10">
                                <ArrowRight
                                    className="text-green-600"
                                    size={24}
                                />
                            </div>
                        </div>
                        <div className="relative">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                                    <Receipt
                                        className="text-green-600"
                                        size={24}
                                    />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">
                                    2. Connect M-Pesa
                                </h3>
                                <p className="text-gray-600">
                                    Link your M-Pesa Till or Paybill number
                                </p>
                            </div>
                            <div className="hidden md:block absolute -right-4 top-1/2 transform -translate-y-1/2 z-10">
                                <ArrowRight
                                    className="text-green-600"
                                    size={24}
                                />
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                                <BarChart3
                                    className="text-green-600"
                                    size={24}
                                />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">
                                3. Start Managing
                            </h3>
                            <p className="text-gray-600">
                                Begin tracking sales and managing your business
                            </p>
                        </div>
                    </div>
                </div>
            </section>
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900">
                            Everything You Need
                        </h2>
                        <p className="mt-4 text-gray-600">
                            Powerful features designed for Kenyan businesses
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                                <Receipt className="text-green-600" size={24} />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">
                                M-Pesa Integration
                            </h3>
                            <p className="text-gray-600">
                                Seamless payment processing with direct M-Pesa
                                integration for faster transactions.
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                                <Shield className="text-green-600" size={24} />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">
                                KRA Compliance
                            </h3>
                            <p className="text-gray-600">
                                Automated tax compliance and reporting for
                                worry-free business operations.
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                                <BarChart3
                                    className="text-green-600"
                                    size={24}
                                />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">
                                Sales Analytics
                            </h3>
                            <p className="text-gray-600">
                                Real-time insights and reporting to make
                                informed business decisions.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900">
                            Trusted By Leading Kenyan Businesses
                        </h2>
                        <p className="mt-4 text-gray-600">
                            Join the growing community of businesses using
                            SaleSense
                        </p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 mb-20">
                        <div className="flex items-center justify-center p-4 grayscale hover:grayscale-0 transition-all">
                            <img
                                src="https://placehold.co/200x80/e5e7eb/475569?text=Naivas"
                                alt="Naivas"
                                className="max-h-12"
                            />
                        </div>
                        <div className="flex items-center justify-center p-4 grayscale hover:grayscale-0 transition-all">
                            <img
                                src="https://placehold.co/200x80/e5e7eb/475569?text=Quickmart"
                                alt="Quickmart"
                                className="max-h-12"
                            />
                        </div>
                        <div className="flex items-center justify-center p-4 grayscale hover:grayscale-0 transition-all">
                            <img
                                src="https://placehold.co/200x80/e5e7eb/475569?text=Artcaffe"
                                alt="Artcaffe"
                                className="max-h-12"
                            />
                        </div>
                        <div className="flex items-center justify-center p-4 grayscale hover:grayscale-0 transition-all">
                            <img
                                src="https://placehold.co/200x80/e5e7eb/475569?text=Java+House"
                                alt="Java House"
                                className="max-h-12"
                            />
                        </div>
                    </div>
                </div>
            </section>
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900">
                            What Our Customers Say
                        </h2>
                        <p className="mt-4 text-gray-600">
                            Real experiences from real businesses
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                            <div className="flex items-center mb-4">
                                <img
                                    src="https://placehold.co/100/475569/ffffff?text=JM"
                                    alt="John Mwangi"
                                    className="w-12 h-12 rounded-full"
                                />
                                <div className="ml-4">
                                    <div className="font-semibold">
                                        John Mwangi
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Nairobi Retail
                                    </div>
                                </div>
                            </div>
                            <p className="text-gray-600">
                                "SaleSense has transformed how we handle our
                                daily sales. The M-Pesa integration is
                                seamless!"
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                            <div className="flex items-center mb-4">
                                <img
                                    src="https://placehold.co/100/475569/ffffff?text=SK"
                                    alt="Sarah Kamau"
                                    className="w-12 h-12 rounded-full"
                                />
                                <div className="ml-4">
                                    <div className="font-semibold">
                                        Sarah Kamau
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Mombasa Foods
                                    </div>
                                </div>
                            </div>
                            <p className="text-gray-600">
                                "The KRA compliance features save us so much
                                time. Highly recommended!"
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                            <div className="flex items-center mb-4">
                                <img
                                    src="https://placehold.co/100/475569/ffffff?text=DO"
                                    alt="David Ochieng"
                                    className="w-12 h-12 rounded-full"
                                />
                                <div className="ml-4">
                                    <div className="font-semibold">
                                        David Ochieng
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Kisumu Electronics
                                    </div>
                                </div>
                            </div>
                            <p className="text-gray-600">
                                "The analytics help us make better business
                                decisions. Great customer support too!"
                            </p>
                        </div>
                    </div>
                </div>
            </section>
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900">
                            Frequently Asked Questions
                        </h2>
                        <p className="mt-4 text-gray-600">
                            Everything you need to know about SaleSense
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        <div>
                            <h3 className="font-semibold text-lg mb-2">
                                How does M-Pesa integration work?
                            </h3>
                            <p className="text-gray-600">
                                Simply connect your Till or Paybill number, and
                                we'll automatically track all transactions in
                                real-time.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg mb-2">
                                Is my data secure?
                            </h3>
                            <p className="text-gray-600">
                                Yes, we use bank-level encryption and security
                                measures to protect your business data.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg mb-2">
                                How does KRA compliance work?
                            </h3>
                            <p className="text-gray-600">
                                We automatically generate KRA-compliant reports
                                and help you stay updated with tax requirements.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg mb-2">
                                Do you offer training?
                            </h3>
                            <p className="text-gray-600">
                                Yes, we provide free onboarding and training
                                sessions for all new customers.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}

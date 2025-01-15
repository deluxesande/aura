"use client";
import CTABanner from "@/components/LandingPage/CTABanner";
import Footer from "@/components/LandingPage/Footer";
import HowItWorks from "@/components/LandingPage/HowItWorks";
import MainHeader from "@/components/LandingPage/MainHeader";
import Navbar from "@/components/LandingPage/Navbar";
import WhySalesense from "@/components/LandingPage/WhySalesense";
import { BarChart3, Receipt, Shield } from "lucide-react";
import { useState } from "react";
export default function App() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    return (
        <div className="w-full min-h-screen bg-white">
            <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

            <MainHeader />

            <WhySalesense />

            <CTABanner />

            <HowItWorks />

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

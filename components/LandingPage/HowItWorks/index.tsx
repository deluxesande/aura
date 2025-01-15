import { Building2, ArrowRight, Receipt, BarChart3 } from "lucide-react";
import React from "react";

export default function HowItWorks() {
    return (
        <section className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-gray-900">
                        How It Works
                    </h2>
                    <p className="mt-4 text-gray-600">Get started in minutes</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="relative">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                                <Building2 color="#16a34a" size={24} />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">
                                1. Register Business
                            </h3>
                            <p className="text-gray-600">
                                Quick registration with your business details
                                and KRA PIN
                            </p>
                        </div>
                        <div className="hidden md:block absolute -right-4 top-1/2 transform -translate-y-1/2 z-10">
                            <ArrowRight color="#16a34a" size={24} />
                        </div>
                    </div>
                    <div className="relative">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                                <Receipt color="#16a34a" size={24} />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">
                                2. Connect M-Pesa
                            </h3>
                            <p className="text-gray-600">
                                Link your M-Pesa Till or Paybill number
                            </p>
                        </div>
                        <div className="hidden md:block absolute -right-4 top-1/2 transform -translate-y-1/2 z-10">
                            <ArrowRight color="#16a34a" size={24} />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                            <BarChart3 color="#16a34a" size={24} />
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
    );
}

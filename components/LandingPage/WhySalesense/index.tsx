import { Receipt, Shield, BarChart3 } from "lucide-react";
import React from "react";

export default function WhySalesense() {
    return (
        <section id="features" className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        Why Choose SaleSense?
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Everything you need to run your business efficiently in
                        one platform
                    </p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="text-center p-6">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Receipt color="#16a34a" size={32} />
                        </div>
                        <h3 className="text-xl font-semibold mb-4">
                            M-Pesa Integration
                        </h3>
                        <p className="text-gray-600">
                            Seamless payment processing with automatic
                            reconciliation and real-time tracking
                        </p>
                    </div>
                    <div className="text-center p-6">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Shield color="#16a34a" size={32} />
                        </div>
                        <h3 className="text-xl font-semibold mb-4">
                            KRA Compliance
                        </h3>
                        <p className="text-gray-600">
                            Stay compliant with automated tax calculations and
                            reporting
                        </p>
                    </div>
                    <div className="text-center p-6">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <BarChart3 color="#16a34a" size={32} />
                        </div>
                        <h3 className="text-xl font-semibold mb-4">
                            Business Analytics
                        </h3>
                        <p className="text-gray-600">
                            Make data-driven decisions with powerful insights
                            and reporting
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

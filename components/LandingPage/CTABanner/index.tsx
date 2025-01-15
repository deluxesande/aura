import { Receipt, Shield, BarChart3 } from "lucide-react";
import React from "react";

export default function CTABanner() {
    return (
        <section className="py-20 bg-white">
            <div className="bg-green-600 max-w-7xl rounded-md mx-10 py-16 px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-white">
                        Ready to grow your business?
                    </h2>
                    <p className="mt-4 text-white">
                        Join thousands of Kenyan businesses already using
                        SaleSense to manage their sales and compliance.
                    </p>
                    <button className="mt-6 bg-white text-green-600 px-8 py-3 rounded-lg hover:bg-green-50 transition-colors">
                        Get Started Now
                    </button>
                </div>
            </div>
        </section>
    );
}

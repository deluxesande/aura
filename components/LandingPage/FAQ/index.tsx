import React from "react";

export default function FAQ() {
    return (
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
                            We automatically generate KRA-compliant reports and
                            help you stay updated with tax requirements.
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
    );
}

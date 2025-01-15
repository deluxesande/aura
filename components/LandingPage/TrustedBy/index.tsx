import React from "react";

export default function TrustedBy() {
    return (
        <section className="py-5 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-gray-900">
                        Trusted By Leading Kenyan Businesses
                    </h2>
                    <p className="mt-4 text-gray-600">
                        Join the growing community of businesses using SaleSense
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
    );
}

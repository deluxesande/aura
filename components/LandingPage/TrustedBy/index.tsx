import React from "react";
import Image from "next/image";

export default function TrustedBy() {
    return (
        <section className="py-16 bg-gray-50 border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                        Trusted By Leading Kenyan Businesses
                    </h2>
                    <p className="mt-3 text-gray-600">
                        Join the growing community of businesses using SaleSense
                    </p>
                </div>

                {/* Flex layout ensures centering on all screen sizes.
                   gap-8 on mobile, gap-16 on desktop for breathing room.
                */}
                <div className="flex flex-wrap justify-center items-center gap-10 md:gap-20">
                    {/* M-Pesa */}
                    <div className="relative grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100">
                        <Image
                            src="/images/M-PESA-logo-2.png"
                            alt="Mpesa"
                            width={200}
                            height={100}
                            className="h-16 md:h-20 w-auto object-contain"
                        />
                    </div>

                    {/* KRA */}
                    <div className="relative grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100">
                        <Image
                            src="/images/kra-seeklogo.png"
                            alt="KRA"
                            width={200}
                            height={100}
                            className="h-16 md:h-20 w-auto object-contain"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}

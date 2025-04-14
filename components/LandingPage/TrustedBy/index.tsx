import React from "react";
import Image from "next/image";

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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 mb-20 items-center">
                    <div className="p-4 grayscale hover:grayscale-0 transition-all">
                        <Image
                            src="/images/SAF-MAIN-LOGO.png"
                            alt="Safaricom"
                            className="min-h-12"
                            width={200}
                            height={80}
                        />
                    </div>
                    <div className="p-4 grayscale hover:grayscale-0 transition-all">
                        <Image
                            src="/images/M-PESA-logo-2.png"
                            alt="Mpesa"
                            className="min-h-12"
                            width={200}
                            height={80}
                        />
                    </div>
                    <div className="p-4 grayscale hover:grayscale-0 transition-all">
                        <Image
                            src="/images/kra-seeklogo.png"
                            alt="KRA"
                            className="min-h-12"
                            width={200}
                            height={80}
                        />
                    </div>
                    <div className="p-4 grayscale hover:grayscale-0 transition-all">
                        <Image
                            src="/images/MDS.png"
                            alt="Media Documents Supplies"
                            className=""
                            width={200}
                            height={80}
                        />
                    </div>
                    {/* <div className="p-4 grayscale hover:grayscale-0 transition-all">
                        <Image
                            src="/images/Deluxe.png"
                            alt="Deluxe"
                            className=""
                            width={200}
                            height={80}
                        />
                    </div>
                    <div className="p-4 grayscale hover:grayscale-0 transition-all">
                        <Image
                            src="/logos/salesense-horizontal.png"
                            alt="Salesense"
                            className="max-h-12"
                            width={200}
                            height={80}
                        /> 
                    </div> */}
                </div>
            </div>
        </section>
    );
}

import React from "react";
import Image from "next/image";

export default function Testimonials() {
    return (
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
                            <Image
                                src="https://randomuser.me/api/portraits/men/50.jpg"
                                alt="John Mwangi"
                                className="w-12 h-12 rounded-full"
                                width={200}
                                height={80}
                            />
                            <div className="ml-4">
                                <div className="font-semibold">John Mwangi</div>
                                <div className="text-sm text-gray-600">
                                    Nairobi Retail
                                </div>
                            </div>
                        </div>
                        <p className="text-gray-600">
                            &quot;SaleSense has transformed how we handle our
                            daily sales. The M-Pesa integration is
                            seamless!&quot;
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <div className="flex items-center mb-4">
                            <Image
                                src="https://randomuser.me/api/portraits/women/89.jpg"
                                alt="Sarah Kamau"
                                className="w-12 h-12 rounded-full"
                                width={200}
                                height={80}
                            />
                            <div className="ml-4">
                                <div className="font-semibold">Sarah Kamau</div>
                                <div className="text-sm text-gray-600">
                                    Mombasa Foods
                                </div>
                            </div>
                        </div>
                        <p className="text-gray-600">
                            &quot;The KRA compliance features save us so much
                            time. Highly recommended!&quot;
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <div className="flex items-center mb-4">
                            <Image
                                src="https://randomuser.me/api/portraits/men/25.jpg"
                                alt="David Ochieng"
                                className="w-12 h-12 rounded-full"
                                width={200}
                                height={80}
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
                            &quot;The analytics help us make better business
                            decisions. Great customer support too!&quot;
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

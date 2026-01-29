"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import axios from "axios";
import { Mail, MapPin, Phone, Send, Loader2 } from "lucide-react";

export default function ContactForm() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const form = { name, email, message };

        try {
            await axios.post("/api/contact", form);
            toast.success(
                "Message sent successfully! We'll get back to you soon.",
            );
            setName("");
            setEmail("");
            setMessage("");
        } catch (error) {
            toast.error("Failed to send message. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="relative py-24 bg-gray-50 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16 max-w-2xl mx-auto">
                    <motion.h2
                        className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
                        initial={{ opacity: 0, y: -20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        Get in Touch
                    </motion.h2>
                    <motion.p
                        className="text-lg text-gray-600"
                        initial={{ opacity: 0, y: -20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                    >
                        Have questions about pricing, integrations, or just want
                        to say hello? We&apos;d love to hear from you.
                    </motion.p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
                    <motion.div
                        className="bg-green-500 rounded-3xl p-8 md:p-10 text-white flex flex-col justify-between overflow-hidden relative"
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="relative z-10">
                            <h3 className="text-2xl text-white font-bold mb-6">
                                Contact Information
                            </h3>
                            <p className="text-green-100 mb-10 leading-relaxed">
                                Fill out the form and our team will get back to
                                you within 24 hours.
                            </p>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-green-100 rounded-lg">
                                        <Phone className="w-5 h-5 stroke-green-500" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm text-green-300 mb-1">
                                            Call Us
                                        </p>
                                        <p className="text-white font-semibold">
                                            +254 117 805 393
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-green-100 rounded-lg">
                                        <Mail className="w-5 h-5 stroke-green-500" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm text-green-300 mb-1">
                                            Email Us
                                        </p>
                                        <p className="text-white font-semibold">
                                            support@trysalesense.online
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-green-100 rounded-lg">
                                        <MapPin className="w-5 h-5 stroke-green-500" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm text-green-300 mb-1">
                                            Visit Us
                                        </p>
                                        <p className="text-white font-semibold">
                                            Nairobi, Kenya
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="relative z-10 mt-12 flex gap-4">
                            {/* Social Icons could go here */}
                        </div>
                    </motion.div>

                    <motion.div
                        className="lg:col-span-2 bg-white rounded-3xl p-8 md:p-10 shadow-xl shadow-gray-200/50 border border-gray-100"
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <form onSubmit={handleFormSubmit} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label
                                        htmlFor="name"
                                        className="text-sm font-semibold text-gray-700 ml-1"
                                    >
                                        Full Name
                                    </label>
                                    <input
                                        id="name"
                                        type="text"
                                        value={name}
                                        onChange={(e) =>
                                            setName(e.target.value)
                                        }
                                        required
                                        placeholder="John Doe"
                                        className="w-full px-4 py-3 outline-none bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all placeholder-gray-400 text-gray-900"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label
                                        htmlFor="email"
                                        className="text-sm font-semibold text-gray-700 ml-1"
                                    >
                                        Email Address
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        required
                                        placeholder="john@example.com"
                                        className="w-full px-4 py-3 outline-none bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all placeholder-gray-400 text-gray-900"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label
                                    htmlFor="message"
                                    className="text-sm font-semibold text-gray-700 ml-1"
                                >
                                    Message
                                </label>
                                <textarea
                                    id="message"
                                    rows={5}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    required
                                    placeholder="Tell us how we can help..."
                                    className="w-full px-4 py-3 outline-none bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all placeholder-gray-400 text-gray-900 resize-none"
                                />
                            </div>

                            <div className="pt-4 w-full">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full md:w-auto min-w-full flex items-center justify-center gap-2 py-3.5 px-8 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold shadow-lg shadow-green-200 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2
                                                size={20}
                                                className="stroke-white animate-spin"
                                            />
                                            Sending...
                                        </>
                                    ) : (
                                        <>Send Message</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

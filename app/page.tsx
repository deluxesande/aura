"use client";
import ContactForm from "@/components/LandingPage/ContactForm";
import CTABanner from "@/components/LandingPage/CTABanner";
import FAQ from "@/components/LandingPage/FAQ";
import Footer from "@/components/LandingPage/Footer";
import HowItWorks from "@/components/LandingPage/HowItWorks";
import MainHeader from "@/components/LandingPage/MainHeader";
import Navbar from "@/components/LandingPage/Navbar";
import Testimonials from "@/components/LandingPage/Testimonials";
import TrustedBy from "@/components/LandingPage/TrustedBy";
import WhySalesense from "@/components/LandingPage/WhySalesense";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { isTauri } from "@/utils/tauri";

export default function LandingPage() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    if (isTauri()) return null;

    return (
        <div className="w-full min-h-screen bg-white">
            <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

            <MainHeader />

            <WhySalesense />

            <HowItWorks />

            <TrustedBy />

            <CTABanner />

            <Testimonials />

            <ContactForm />

            <FAQ />

            <Footer />
        </div>
    );
}

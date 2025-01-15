"use client";
import CTABanner from "@/components/LandingPage/CTABanner";
import FAQ from "@/components/LandingPage/FAQ";
import Footer from "@/components/LandingPage/Footer";
import HowItWorks from "@/components/LandingPage/HowItWorks";
import MainHeader from "@/components/LandingPage/MainHeader";
import Navbar from "@/components/LandingPage/Navbar";
import Testimonials from "@/components/LandingPage/Testimonials";
import TrustedBy from "@/components/LandingPage/TrustedBy";
import WhySalesense from "@/components/LandingPage/WhySalesense";
import { useState } from "react";

export default function App() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    return (
        <div className="w-full min-h-screen bg-white">
            <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

            <MainHeader />

            <WhySalesense />

            <CTABanner />

            <HowItWorks />

            <TrustedBy />

            <Testimonials />

            <FAQ />

            <Footer />
        </div>
    );
}

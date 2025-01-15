import { ChevronRight } from "lucide-react";
import Image from "next/image";

export default function MainHeader() {
    return (
        <section className="pt-32 pb-40 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative">
            <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                    Streamline Your Sales with
                    <br />
                    <span className="text-green-600 text-4xl sm:text-5xl md:text-6xl font-bold">
                        Kenyan Solutions
                    </span>
                </h1>
                <p className="text-xl text-gray-600 mb-8 max-w-2xl">
                    Seamlessly manage your sales with integrated M-Pesa payments
                    and KRA compliance. Built for Kenyan businesses.
                </p>
                <div className="flex flex-col w-full justify-center sm:flex-row gap-4 mb-16">
                    <button className="w-full md:w-auto lg:w-auto bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center">
                        Start Free Trial{" "}
                        <ChevronRight color="#fff" className="ml-2" size={18} />
                    </button>
                    <button className="w-full md:w-auto lg:w-auto border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center">
                        Learn more
                    </button>
                </div>
                <div className="relative w-full max-w-3xl mx-auto">
                    <Image
                        src="https://placehold.co/1200x800/e5e7eb/475569?text=Dashboard+Preview"
                        alt="SaleSense Dashboard Preview"
                        width={1200}
                        height={800}
                        className="w-full h-auto"
                    />
                </div>
            </div>
        </section>
    );
}

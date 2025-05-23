import { RootState } from "@/store/rootReducer";
import { ChevronRight, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSelector } from "react-redux";

export default function Navbar({
    isMenuOpen,
    setIsMenuOpen,
}: {
    isMenuOpen: boolean;
    setIsMenuOpen: (value: boolean) => void;
}) {
    const isSignedIn = useSelector((state: RootState) => state.auth.isSignedIn);

    return (
        <nav className="fixed w-full bg-white/80 backdrop-blur-sm z-50 border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link href="/" className="flex items-center">
                        <Image
                            src="/logos/salesense-horizontal.png"
                            width={160}
                            height={160}
                            alt="Logo"
                            className="hidden sm:block"
                        />
                        <Image
                            src="/logos/salesense-vertical.png"
                            width={65}
                            height={65}
                            alt="Logo"
                            className="block sm:hidden"
                        />
                    </Link>
                    <div className="hidden md:flex items-center space-x-8">
                        <a
                            href="/features"
                            className="text-gray-600 hover:text-gray-900"
                        >
                            Features
                        </a>
                        <a
                            href="/integration"
                            className="text-gray-600 hover:text-gray-900"
                        >
                            Integration
                        </a>
                        <a
                            href="/pricing"
                            className="text-gray-600 hover:text-gray-900"
                        >
                            Pricing
                        </a>
                        <a
                            href="/about"
                            className="text-gray-600 hover:text-gray-900"
                        >
                            About
                        </a>
                        {!isSignedIn && (
                            <a
                                href="/sign-in"
                                className="text-green-600 hover:text-gray-900"
                            >
                                Sign in
                            </a>
                        )}
                        {isSignedIn ? (
                            <a
                                href="/dashboard"
                                className="text-green-600 flex items-center"
                            >
                                Dashboard
                                <ChevronRight
                                    color="#16a34a"
                                    size={16}
                                    className="ml-1"
                                />
                            </a>
                        ) : (
                            <a
                                href="/sign-up"
                                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                            >
                                Get Started
                            </a>
                        )}
                    </div>
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-gray-600 hover:text-gray-900"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>
            {isMenuOpen && (
                <div className="md:hidden bg-white border-b">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        <a
                            href="features"
                            className="block px-3 py-2 text-gray-600 hover:text-gray-900"
                        >
                            Features
                        </a>
                        <a
                            href="integration"
                            className="block px-3 py-2 text-gray-600 hover:text-gray-900"
                        >
                            Integration
                        </a>
                        <a
                            href="pricing"
                            className="block px-3 py-2 text-gray-600 hover:text-gray-900"
                        >
                            Pricing
                        </a>
                        <a
                            href="/about"
                            className="block px-3 py-2 text-gray-600 hover:text-gray-900"
                        >
                            About
                        </a>
                        {!isSignedIn && (
                            <a
                                href="/sign-in"
                                className="block px-3 py-2 text-green-600 hover:text-gray-900"
                            >
                                Sign in
                            </a>
                        )}
                        {isSignedIn ? (
                            <a
                                href="/dashboard"
                                className="px-3 py-2 text-green-600 flex items-center"
                            >
                                Dashboard
                                <ChevronRight
                                    color="#16a34a"
                                    size={16}
                                    className="ml-1"
                                />
                            </a>
                        ) : (
                            <button className="w-full mt-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
                                Get Started
                            </button>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}

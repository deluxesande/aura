import React from "react";

export default function Footer() {
    return (
        <footer className="bg-green-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="text-sm font-semibold text-green-100 mb-4">
                            Product
                        </h3>
                        <ul className="space-y-2">
                            <li>
                                <a
                                    href="#"
                                    className="text-green-200 hover:text-white"
                                >
                                    Features
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-green-200 hover:text-white"
                                >
                                    Pricing
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-green-200 hover:text-white"
                                >
                                    Updates
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-green-100 mb-4">
                            Company
                        </h3>
                        <ul className="space-y-2">
                            <li>
                                <a
                                    href="#"
                                    className="text-green-200 hover:text-white"
                                >
                                    About
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-green-200 hover:text-white"
                                >
                                    Careers
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-green-200 hover:text-white"
                                >
                                    Contact
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-green-100 mb-4">
                            Resources
                        </h3>
                        <ul className="space-y-2">
                            <li>
                                <a
                                    href="#"
                                    className="text-green-200 hover:text-white"
                                >
                                    Blog
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-green-200 hover:text-white"
                                >
                                    Help Center
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-green-200 hover:text-white"
                                >
                                    Guides
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-green-100 mb-4">
                            Legal
                        </h3>
                        <ul className="space-y-2">
                            <li>
                                <a
                                    href="#"
                                    className="text-green-200 hover:text-white"
                                >
                                    Privacy
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-green-200 hover:text-white"
                                >
                                    Terms
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="text-green-200 hover:text-white"
                                >
                                    Security
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="mt-12 pt-8 border-t border-green-800">
                    <p className="text-green-200 text-center">
                        © 2025 SaleSense. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}

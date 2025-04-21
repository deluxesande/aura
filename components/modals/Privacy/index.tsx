import { motion } from "framer-motion";
import React from "react";

interface PrivacyPolicyModalProps {
    modalVariants: {
        hidden: { opacity: number; y: string };
        visible: {
            opacity: number;
            y: string;
            transition: {
                duration: number;
                staggerChildren: number;
                ease: string;
            };
        };
        exit: {
            opacity: number;
            y: string;
            transition: { duration: number; ease: string };
        };
    };
    setIsPrivacyOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function PrivacyPolicyModal({
    modalVariants,
    setIsPrivacyOpen,
}: PrivacyPolicyModalProps) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
            <motion.div
                className="bg-white rounded-lg shadow-lg max-w-3xl w-full p-6 overflow-y-auto max-h-[90vh]"
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.5, ease: "easeOut" }}
            >
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    Privacy Policy
                </h2>

                <div className="space-y-4 text-gray-700 text-sm">
                    <p>
                        At <strong>Salesense</strong>, your privacy is extremely
                        important to us. This Privacy Policy explains what data
                        we collect, why we collect it, and how you can control
                        your information. Our goal is to be transparent and help
                        you feel safe using our platform.
                    </p>

                    <h3 className="text-lg font-semibold text-gray-900 mt-6">
                        1. Information We Collect
                    </h3>
                    <p>
                        We collect the following types of data to help run
                        Salesense smoothly and personalize your experience:
                    </p>
                    <ul className="list-disc pl-5">
                        <li>
                            <strong>Personal Information:</strong> This includes
                            your name, email address, phone number, and other
                            identifiable details. We only ask for what we need
                            to serve you better.
                        </li>
                        <li>
                            <strong>Usage Data:</strong> Information like the
                            pages you visit, actions you take, and time spent on
                            the app. This helps us understand how you use
                            Salesense and improve your experience.
                        </li>
                        <li>
                            <strong>Device Data:</strong> Data like your IP
                            address, browser type, and operating system, which
                            help us optimize the app for different environments
                            and ensure security.
                        </li>
                    </ul>

                    <h3 className="text-lg font-semibold text-gray-900 mt-6">
                        2. How We Use Your Information
                    </h3>
                    <p>
                        We use the collected data for various purposes, such as:
                    </p>
                    <ul className="list-disc pl-5">
                        <li>
                            <strong>Creating and managing your account</strong>{" "}
                            — so you can log in, update settings, and access
                            services.
                        </li>
                        <li>
                            <strong>Improving your experience</strong> — by
                            understanding your behavior and preferences to
                            tailor the platform to your needs.
                        </li>
                        <li>
                            <strong>Customer support</strong> — allowing us to
                            assist you effectively when you reach out.
                        </li>
                        <li>
                            <strong>Security & compliance</strong> — helping us
                            prevent fraud and fulfill legal obligations.
                        </li>
                    </ul>

                    <h3 className="text-lg font-semibold text-gray-900 mt-6">
                        3. Data Sharing
                    </h3>
                    <p>
                        We value your trust and{" "}
                        <strong>do not sell or rent</strong> your personal data.
                        However, we may share your data in the following cases:
                    </p>
                    <ul className="list-disc pl-5">
                        <li>
                            <strong>With service providers:</strong> Trusted
                            companies that help us with analytics, hosting, and
                            customer support — under strict data protection
                            agreements.
                        </li>
                        <li>
                            <strong>Legal reasons:</strong> If required by law
                            or to protect our rights and users’ safety.
                        </li>
                        <li>
                            <strong>Business transitions:</strong> In the event
                            of a company merger, acquisition, or reorganization,
                            your data may be transferred securely.
                        </li>
                    </ul>

                    <h3 className="text-lg font-semibold text-gray-900 mt-6">
                        4. Your Rights
                    </h3>
                    <p>
                        Depending on your location, you may have the right to:
                    </p>
                    <ul className="list-disc pl-5">
                        <li>Access the data we hold about you</li>
                        <li>Request corrections or updates</li>
                        <li>Request deletion of your data</li>
                        <li>Restrict or object to data processing</li>
                        <li>Withdraw consent at any time</li>
                    </ul>
                    <p>
                        To make any requests, email us at{" "}
                        <strong>
                            <a
                                href="mailto:salesense4@gmail.com"
                                className="text-green-600"
                            >
                                salesense@gmail.com
                            </a>
                        </strong>
                        .
                    </p>

                    <h3 className="text-lg font-semibold text-gray-900 mt-6">
                        5. Cookies & Tracking
                    </h3>
                    <p>We use cookies and similar tools to:</p>
                    <ul className="list-disc pl-5">
                        <li>Remember your preferences and session details</li>
                        <li>
                            Improve the performance and security of the site
                        </li>
                        <li>
                            Analyze user behavior anonymously to make better
                            design decisions
                        </li>
                    </ul>
                    <p>
                        You can control cookies in your browser settings at any
                        time.
                    </p>

                    <h3 className="text-lg font-semibold text-gray-900 mt-6">
                        6. Data Retention
                    </h3>
                    <p>
                        We only keep your data for as long as necessary to serve
                        the purposes mentioned above — or longer if required by
                        law. When no longer needed, your data is securely
                        deleted.
                    </p>

                    <h3 className="text-lg font-semibold text-gray-900 mt-6">
                        7. Data Security
                    </h3>
                    <p>
                        Salesense implements industry-standard encryption,
                        authentication, and security practices to protect your
                        information from unauthorized access or misuse.
                    </p>

                    <h3 className="text-lg font-semibold text-gray-900 mt-6">
                        8. Third-Party Links
                    </h3>
                    <p>
                        Sometimes we link to other websites. If you click on a
                        third-party link, you&#39;re subject to their privacy
                        policy. We recommend reviewing their terms before
                        engaging.
                    </p>

                    <h3 className="text-lg font-semibold text-gray-900 mt-6">
                        9. Children’s Privacy
                    </h3>
                    <p>
                        Salesense is not intended for users under the age of 13.
                        We do not knowingly collect data from minors. If you
                        believe we have, please contact us immediately to
                        resolve the issue.
                    </p>

                    <h3 className="text-lg font-semibold text-gray-900 mt-6">
                        10. Changes to This Policy
                    </h3>
                    <p>
                        We may occasionally update this Privacy Policy. When we
                        do, we’ll post the latest version here and update the
                        effective date. Major changes will be communicated
                        directly.
                    </p>

                    <h3 className="text-lg font-semibold text-gray-900 mt-6">
                        11. Contact Us
                    </h3>
                    <p>Have questions or concerns? Reach out to us at:</p>
                    <p>
                        <strong>Email:</strong>{" "}
                        <a
                            href="mailto:salesense4@gmail.com"
                            className="text-green-600"
                        >
                            salesense@gmail.com
                        </a>{" "}
                        <br />
                        <strong>Website:</strong>{" "}
                        <a
                            href="https://aura-omega-snowy.vercel.app/"
                            className="text-green-600"
                        >
                            www.salesense.com
                        </a>
                    </p>
                </div>

                <div className="flex justify-end mt-6">
                    <button
                        onClick={() => setIsPrivacyOpen(false)}
                        className="px-4 py-2 w-full bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                        Close
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

import { motion } from "framer-motion";
import React from "react";

interface TermsModalProps {
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
    setIsTermsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function TermsModal({
    modalVariants,
    setIsTermsOpen,
}: TermsModalProps) {
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
                    Terms & Conditions
                </h2>

                <div className="space-y-4 text-gray-700 text-sm">
                    <p>
                        These Terms & Conditions govern your use of the
                        SaleSense platform. By accessing or using our services,
                        you agree to be bound by these terms. If you do not
                        agree, please do not use our services.
                    </p>

                    <h3 className="text-lg font-semibold text-gray-900 mt-6">
                        1. Acceptance of Terms
                    </h3>
                    <p>
                        By using SaleSense, you agree to comply with these Terms
                        & Conditions and any applicable laws and regulations.
                        These terms apply to all visitors, users, and others who
                        access or use the service.
                    </p>

                    <h3 className="text-lg font-semibold text-gray-900 mt-6">
                        2. Eligibility
                    </h3>
                    <p>
                        You must be at least 18 years old (or of legal age in
                        your country) to use SaleSense. If you are underage, you
                        may only use our services under the supervision of a
                        parent or guardian.
                    </p>

                    <h3 className="text-lg font-semibold text-gray-900 mt-6">
                        3. User Accounts
                    </h3>
                    <p>
                        When you create an account with us, you must provide
                        accurate and complete information. You are responsible
                        for maintaining the confidentiality of your account
                        credentials and for all activities under your account.
                    </p>

                    <h3 className="text-lg font-semibold text-gray-900 mt-6">
                        4. Use of the Platform
                    </h3>
                    <p>
                        You're responsible for how you use SaleSense. You agree
                        not to:
                    </p>
                    <ul className="list-disc pl-5">
                        <li>
                            Use the platform for any illegal or unauthorized
                            purpose
                        </li>
                        <li>Violate any applicable laws or regulations</li>
                        <li>
                            Upload malicious software or attempt to hack our
                            systems
                        </li>
                        <li>
                            Post or share inappropriate, offensive, or harmful
                            content
                        </li>
                    </ul>

                    <h3 className="text-lg font-semibold text-gray-900 mt-6">
                        5. Intellectual Property
                    </h3>
                    <p>
                        All content, features, and functionality on SaleSense
                        (including designs, text, graphics, logos, and code) are
                        the exclusive property of SaleSense or Deluxe
                        <sup>TM</sup> unless otherwise stated. Unauthorized use
                        is prohibited.
                    </p>

                    <h3 className="text-lg font-semibold text-gray-900 mt-6">
                        6. Payments & Subscriptions
                    </h3>
                    <p>
                        If you subscribe to any paid services, you agree to pay
                        the applicable fees. All payments are non-refundable
                        unless otherwise stated. We may change pricing at any
                        time with reasonable notice.
                    </p>

                    <h3 className="text-lg font-semibold text-gray-900 mt-6">
                        7. Termination
                    </h3>
                    <p>
                        We reserve the right to suspend or terminate your access
                        to SaleSense at any time for any reason, including
                        violation of these terms. You may also stop using our
                        services at any time.
                    </p>

                    <h3 className="text-lg font-semibold text-gray-900 mt-6">
                        8. Limitation of Liability
                    </h3>
                    <p>
                        SaleSense and its creators (including Deluxe
                        <sup>TM</sup>) will not be liable for any damages
                        arising from your use or inability to use the platform.
                        All services are provided "as is" without warranties.
                    </p>

                    <h3 className="text-lg font-semibold text-gray-900 mt-6">
                        9. Changes to Terms
                    </h3>
                    <p>
                        We may update these Terms & Conditions from time to
                        time. Any changes will be effective immediately upon
                        posting. It is your responsibility to review them
                        periodically.
                    </p>

                    <h3 className="text-lg font-semibold text-gray-900 mt-6">
                        10. Contact
                    </h3>
                    <p>
                        If you have any questions or concerns about these terms,
                        reach out to us at:
                    </p>
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
                        onClick={() => setIsTermsOpen(false)}
                        className="px-4 py-2 w-full bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                        Accept
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

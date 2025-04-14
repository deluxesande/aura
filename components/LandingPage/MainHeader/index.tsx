import { ChevronRight } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2,
            duration: 0.6,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, staggerChildren: 0.2 },
    },
};

const arrowVariants = {
    hidden: { opacity: 0, x: 40 }, // Start slightly off-screen to the right
    visible: {
        opacity: 1,
        x: 0, // Slide into place
        transition: {
            duration: 0.6,
            ease: "easeOut",
            repeat: Infinity, // Make it bounce
            repeatType: "reverse" as const, // Reverse the animation on repeat
        },
    },
};

export default function MainHeader() {
    return (
        <motion.section
            className="pt-32 pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <motion.div
                className="flex flex-col items-center text-center max-w-4xl mx-auto"
                variants={itemVariants}
            >
                <motion.h1
                    className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6"
                    variants={itemVariants}
                >
                    Streamline Your Sales with
                    <br />
                    <span className="text-green-600 text-4xl sm:text-5xl md:text-6xl font-bold">
                        Kenyan Solutions
                    </span>
                </motion.h1>
                <motion.p
                    className="text-xl text-gray-600 mb-8 max-w-2xl"
                    variants={itemVariants}
                >
                    Seamlessly manage your sales with integrated M-Pesa payments
                    and KRA compliance. Built for Kenyan businesses.
                </motion.p>
                <motion.div
                    className="flex flex-col w-full justify-center sm:flex-row gap-4 mb-16"
                    variants={itemVariants}
                >
                    <a
                        href="/sign-up"
                        className="w-full md:w-auto lg:w-auto bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                    >
                        Start Free Trial{" "}
                        <motion.span variants={arrowVariants}>
                            <ChevronRight
                                color="#fff"
                                className="ml-2"
                                size={18}
                            />
                        </motion.span>
                    </a>
                    <a
                        href="/features"
                        className="w-full md:w-auto lg:w-auto border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                    >
                        Learn more
                    </a>
                </motion.div>
                <motion.div
                    className="relative w-full max-w-7xl mx-auto"
                    variants={itemVariants}
                >
                    <Image
                        src="/ProductsPage.jpg"
                        alt="SaleSense Dashboard Preview"
                        width={1200}
                        height={800}
                        className="w-full h-auto clip-half"
                    />
                    {/* <video autoPlay loop muted>
                        <source src="/videos/Main.mp4"></source>
                        <source src="/videos/Main.webm"></source>
                    </video> */}
                </motion.div>
            </motion.div>
        </motion.section>
    );
}

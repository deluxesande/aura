"use client";
import "@/app/styles/globals.css";
import { Inter } from "next/font/google";

import ReduxProvider from "@/components/ReduxProvider";
import ToastProvider from "@/components/ToastProvider";
import { ClerkProvider } from "@clerk/nextjs";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { Analytics } from "@vercel/analytics/react";

import { metadata } from "./metadata";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const pathName = usePathname();
    return (
        <ClerkProvider>
            <html lang="en">
                <head>
                    <meta
                        name="description"
                        content={metadata.description ?? ""}
                    />
                    <link rel="icon" href="/logos/salesense-icon.png" />
                </head>
                <body className={`${inter.className} bg-[#f4f4f4]`}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={pathName}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <ReduxProvider>
                                <ToastProvider>
                                    {children}
                                    <Analytics />
                                </ToastProvider>
                            </ReduxProvider>
                        </motion.div>
                    </AnimatePresence>
                </body>
            </html>
        </ClerkProvider>
    );
}

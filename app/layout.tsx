"use client";
import "@/app/styles/globals.css";
import { Inter } from "next/font/google";

import ReduxProvider from "@/components/ReduxProvider";
import ToastProvider from "@/components/ToastProvider";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { metadata } from "./metadata";
import RoleGuard from "@/components/auth/RoleGuard";
import AuthProvider from "@/components/auth/AuthProvider";
import PageTransition from "@/components/PageTransitions";
import WelcomeTour from "@/components/WelcomeTour";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
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
                <body
                    className={`${inter.className} font-sans antialiased bg-[#f4f4f4]`}
                >
                    <ReduxProvider>
                        <AuthProvider>
                            <RoleGuard>
                                <ToastProvider>
                                    <PageTransition>
                                        {children}
                                        <WelcomeTour />
                                        <Analytics />
                                        <SpeedInsights />
                                    </PageTransition>
                                </ToastProvider>
                            </RoleGuard>
                        </AuthProvider>
                    </ReduxProvider>
                </body>
            </html>
        </ClerkProvider>
    );
}

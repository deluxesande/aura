import "@/app/styles/globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

import ReduxProvider from "@/components/ReduxProvider";
import ToastProvider from "@/components/ToastProvider";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Salesense",
    description:
        "Seamlessly integrates ERP with M-Pesa and KRA for efficient business management",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ClerkProvider>
            <html lang="en">
                <head>
                    <link rel="icon" href="/logos/salesense-vertical.png" />
                </head>
                <body className={`${inter.className} bg-[#f4f4f4]`}>
                    <ReduxProvider>
                        <ToastProvider>{children}</ToastProvider>
                    </ReduxProvider>
                </body>
            </html>
        </ClerkProvider>
    );
}

import React from "react";
import Link from "next/link";
import Image from "next/image";

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
}

export default function AuthLayout({
    children,
    title,
    subtitle,
}: AuthLayoutProps) {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Link
                    href="/"
                    className="flex justify-center text-2xl font-bold text-gray-900"
                >
                    <Image
                        src="/logos/salesense-horizontal.png"
                        width={160}
                        height={160}
                        alt="Logo"
                        className="hidden sm:block"
                    />
                </Link>
                <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
                    {title}
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    {subtitle}
                </p>
            </div>
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {children}
                </div>
            </div>
        </div>
    );
}

"use client";
import React from "react";
import Link from "next/link";
import AuthLayout from "@components/auth/AuthLayout";
import Image from "next/image";
import { useSignUp } from "@clerk/nextjs";

export default function SignupPage() {
    const { isLoaded, signUp, setActive } = useSignUp();

    return (
        <AuthLayout
            title="Create your account"
            subtitle="Start managing your business today"
        >
            {/* Google Auth Button */}
            <button
                type="button"
                className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
                <Image
                    className="h-5 w-5 mr-2"
                    src="https://www.svgrepo.com/show/475656/google-color.svg"
                    alt="Google logo"
                    width={20}
                    height={20}
                />
                Sign up with Google
            </button>
            <div className="mt-6 relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">
                        Or sign up with email
                    </span>
                </div>
            </div>
            <form className="mt-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label
                            htmlFor="first-name"
                            className="block text-sm font-medium text-gray-700"
                        >
                            First name
                        </label>
                        <div className="mt-1">
                            <input
                                id="first-name"
                                name="first-name"
                                type="text"
                                required
                                className="outline-none bg-slate-50 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                            />
                        </div>
                    </div>
                    <div>
                        <label
                            htmlFor="last-name"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Last name
                        </label>
                        <div className="mt-1">
                            <input
                                id="last-name"
                                name="last-name"
                                type="text"
                                required
                                className="outline-none bg-slate-50 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                            />
                        </div>
                    </div>
                </div>
                <div>
                    <label
                        htmlFor="business-name"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Business name
                    </label>
                    <div className="mt-1">
                        <input
                            id="business-name"
                            name="business-name"
                            type="text"
                            required
                            className="outline-none bg-slate-50 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                        />
                    </div>
                </div>
                <div>
                    <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Email address
                    </label>
                    <div className="mt-1">
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            className="outline-none bg-slate-50 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                        />
                    </div>
                </div>
                <div>
                    <label
                        htmlFor="password"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Password
                    </label>
                    <div className="mt-1">
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            className="outline-none bg-slate-50 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                        />
                    </div>
                </div>
                <div>
                    <button
                        type="submit"
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                        Create account
                    </button>
                </div>
            </form>
            <p className="mt-6 text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                    href="/sign-in"
                    className="font-medium text-green-600 hover:text-green-500"
                >
                    Sign in
                </Link>
            </p>
        </AuthLayout>
    );
}

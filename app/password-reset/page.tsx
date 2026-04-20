"use client";
import React, { useState } from "react";
import AuthLayout from "@components/auth/AuthLayout";
import { useSignIn } from "@clerk/nextjs";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { fetchUser } from "@/store/auth/authThunks";
import { signIn as setReduxLoading } from "@/store/slices/authSlice";
import { AppDispatch } from "@/store";

export default function ForgotPasswordPage() {
    const { isLoaded, signIn, setActive } = useSignIn();
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [password, setPassword] = useState("");
    const [successfulCreation, setSuccessfulCreation] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const dispatch = useDispatch<AppDispatch>();

    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isLoaded || isLoading) return;

        setIsLoading(true);
        try {
            await signIn.create({
                strategy: "reset_password_email_code",
                identifier: email,
            });

            setSuccessfulCreation(true);
            toast.success("Reset code sent to your email");
        } catch (err: any) {
            toast.error(
                err.errors?.[0]?.longMessage || "Failed to send reset code",
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isLoaded || isLoading) return;

        setIsLoading(true);
        try {
            const result = await signIn.attemptFirstFactor({
                strategy: "reset_password_email_code",
                code,
                password,
            });

            if (result.status === "complete") {
                await setActive({ session: result.createdSessionId });
                dispatch(setReduxLoading());

                try {
                    await dispatch(fetchUser()).unwrap();
                } catch (fetchError) {
                    // console.error(
                    //     "Profile fetch failed, redirecting anyway",
                    //     fetchError
                    // );
                }

                toast.success("Password reset successfully");

                router.push("/dashboard");
            } else {
                toast.error("Verification incomplete");
            }
        } catch (err: any) {
            toast.error(
                err.errors?.[0]?.longMessage || "Failed to reset password",
            );
        } finally {
            setIsLoading(false);
        }
    };

    if (!isLoaded) {
        return (
            <AuthLayout
                title="Forgot Password"
                subtitle="Reset your account access"
            >
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout
            title={successfulCreation ? "Set New Password" : "Forgot Password"}
            subtitle={
                successfulCreation
                    ? "Enter the code sent to your email and your new password"
                    : "Enter your email to receive a reset code"
            }
        >
            {/* FORM 1: EMAIL INPUT */}
            {!successfulCreation && (
                <form className="mt-6 space-y-6" onSubmit={handleSendCode}>
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Email Address
                        </label>
                        <div className="mt-1">
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isLoading}
                                className="outline-none bg-slate-50 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 disabled:opacity-50"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                        >
                            {isLoading ? "Sending..." : "Send Reset Code"}
                        </button>
                    </div>
                </form>
            )}

            {/* FORM 2: CODE & PASSWORD INPUT */}
            {successfulCreation && (
                <form className="mt-6 space-y-6" onSubmit={handleResetPassword}>
                    <div>
                        <label
                            htmlFor="code"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Verification Code
                        </label>
                        <div className="mt-1">
                            <input
                                id="code"
                                name="code"
                                type="text"
                                placeholder="Enter 6-digit code"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                required
                                disabled={isLoading}
                                className="outline-none bg-slate-50 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 disabled:opacity-50"
                            />
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700"
                        >
                            New Password
                        </label>
                        <div className="mt-1">
                            <input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Enter new password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isLoading}
                                className="outline-none bg-slate-50 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 disabled:opacity-50"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                        >
                            {isLoading ? "Resetting..." : "Reset Password"}
                        </button>
                    </div>
                </form>
            )}

            <p className="mt-6 text-center text-sm text-gray-600">
                Remember your password?{" "}
                <Link
                    href="/sign-in"
                    className="font-medium text-green-500 hover:text-green-500"
                >
                    Sign in
                </Link>
            </p>
        </AuthLayout>
    );
}

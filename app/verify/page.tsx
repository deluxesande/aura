"use client";
import React, { useState } from "react";
import AuthLayout from "@components/auth/AuthLayout";
import { useSignIn } from "@clerk/nextjs";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { signIn as signInAction, setUser } from "@/store/slices/authSlice";
import axios from "axios";
import Link from "next/link";

export default function VerifyPage() {
    const { isLoaded, signIn, setActive } = useSignIn();
    const [code, setCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const dispatch = useDispatch();

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isLoaded || isLoading) return;

        setIsLoading(true);
        try {
            const result = await signIn.attemptSecondFactor({
                strategy: "backup_code",
                code,
            });

            if (result.status === "complete") {
                await setActive({ session: result.createdSessionId });
                dispatch(signInAction());

                toast.success("Signed in successfully");
                router.push("/dashboard");

                // Fetch user data in background
                try {
                    const response = await axios.get("/api/auth/user/profile");
                    dispatch(setUser(response.data.user));
                } catch (error) {
                    // Silent error
                }
            }
        } catch (err: any) {
            console.log(err);
            toast.error(err.errors?.[0]?.longMessage || "Verification failed");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isLoaded) {
        return (
            <AuthLayout
                title="Verify your identity"
                subtitle="Enter the code sent to your email"
            >
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout
            title="Verify your identity"
            subtitle="Enter the code sent to your email"
        >
            <form className="mt-6 space-y-6" onSubmit={handleVerify}>
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
                            maxLength={6}
                            required
                            disabled={isLoading}
                            className="outline-none bg-slate-50 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 disabled:opacity-50"
                        />
                    </div>
                </div>
                <div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                    >
                        {isLoading ? "Verifying..." : "Verify"}
                    </button>
                </div>
            </form>
            <p className="mt-6 text-center text-sm text-gray-600">
                Back to{" "}
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

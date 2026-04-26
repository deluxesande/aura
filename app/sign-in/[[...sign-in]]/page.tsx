"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import AuthLayout from "@components/auth/AuthLayout";
import Image from "next/image";
import { useAuth, useSignIn } from "@clerk/nextjs";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { signIn as signInAction, setUser } from "@/store/slices/authSlice";
import { apiClient } from "@/utils/apiClient";
import { isTauri } from "@/utils/tauri";

export default function LoginPage() {
    const { isLoaded, signIn, setActive } = useSignIn();
    const { isSignedIn, userId } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();
    const dispatch = useDispatch();

    // Fetch user data when authenticated (background process)
    useEffect(() => {
        const fetchUserData = async () => {
            if (isSignedIn && userId) {
                // Redirect to products immediately
                router.push("/products");

                // Fetch user data in background
                try {
                    const response = await apiClient.get("/auth/user/profile");
                    dispatch(setUser(response.data.user));
                } catch (error) {
                    // silent fail
                }
            }
        };

        if (isLoaded) {
            fetchUserData();
        }
    }, [isSignedIn, userId, isLoaded, dispatch, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isLoaded || isLoading) return;

        setIsLoading(true);
        try {
            const result = await signIn.create({
                identifier: email,
                password,
            });

            if (result.status === "complete") {
                await setActive({ session: result.createdSessionId });
                dispatch(signInAction());

                // Redirect to products immediately
                router.push("/products");

                // Fetch user data in background
                try {
                    const response = await apiClient.get("/auth/user/profile");
                    dispatch(setUser(response.data.user));
                } catch (error) {
                    // silent fail
                }
            } else if (result.status === "needs_second_factor") {
                // Send the email code
                await signIn.prepareSecondFactor({
                    strategy: "email_code",
                });
                router.push("/verify");
            }
        } catch (err: any) {
            toast.error(err.errors?.[0]?.longMessage || "Sign in failed");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        if (!isLoaded || isLoading) return;

        if (isTauri()) {
            try {
                setIsLoading(true);
                const { open } = await import("@tauri-apps/plugin-shell");
                
                // Force Clerk to use the production domain for the OAuth flow.
                // This ensures Clerk returns a valid external verification URL.
                const response = await signIn.create({
                    strategy: "oauth_google",
                    redirectUrl: "https://trysalesense.online/products",
                });

                const externalUrl = 
                    response.firstFactorVerification?.externalVerificationRedirectURL ||
                    (response as any).verifications?.externalAccount?.externalVerificationRedirectURL;

                if (externalUrl) {
                    await open(externalUrl.toString());
                    toast.success("Opening Google Sign-In in your browser...");
                    setIsLoading(false);
                    return;
                }
            } catch (err: any) {
                console.error("Tauri Google Auth failed:", err);
            }
        }

        setIsLoading(true);
        try {
            await signIn.authenticateWithRedirect({
                strategy: "oauth_google",
                redirectUrl: "/sign-in",
                redirectUrlComplete: "/products",
                continueSignUp: false,
            });
        } catch (err: any) {
            toast.error("Failed to sign in with Google. Please try again.");
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Welcome back"
            subtitle="Log in to your account to continue"
        >
            {/* Google Auth Button */}
            <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
                <Image
                    className="h-5 w-5 mr-2"
                    src="https://www.svgrepo.com/show/475656/google-color.svg"
                    alt="Google logo"
                    width={20}
                    height={20}
                />
                Continue with Google
            </button>
            <div className="mt-6 relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">
                        Or continue with
                    </span>
                </div>
            </div>
            <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
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
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
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
                        Password
                    </label>
                    <div className="mt-1">
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isLoading}
                            className="outline-none bg-slate-50 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 disabled:opacity-50"
                        />
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <input
                            id="remember-me"
                            name="remember-me"
                            type="checkbox"
                            className="h-4 w-4 text-green-500 bg-slate-50 outline-none focus:ring-green-500 border-gray-300 rounded"
                        />
                        <label
                            htmlFor="remember-me"
                            className="ml-2 block text-sm text-gray-900"
                        >
                            Remember me
                        </label>
                    </div>
                    <div className="text-sm">
                        <Link
                            href="/password-reset"
                            className="font-medium text-green-500 hover:text-green-500"
                        >
                            Forgot your password?
                        </Link>
                    </div>
                </div>
                <div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                    >
                        {isLoading ? "Signing in..." : "Sign in"}
                    </button>
                </div>
            </form>
            <p className="mt-6 text-center text-sm text-gray-600">
                Don&apos;t have an account?{" "}
                <Link
                    href="/sign-up"
                    className="font-medium text-green-500 hover:text-green-500"
                >
                    Sign up
                </Link>
            </p>
        </AuthLayout>
    );
}

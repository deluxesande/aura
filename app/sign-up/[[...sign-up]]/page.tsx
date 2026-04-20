"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import AuthLayout from "@components/auth/AuthLayout";
import Image from "next/image";
import { useAuth, useSignUp } from "@clerk/nextjs";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { signIn as signInAction } from "@/store/slices/authSlice";

export default function SignupPage() {
    const { isLoaded, signUp, setActive } = useSignUp();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [codeSent, setCodeSent] = useState(false);
    const [code, setCode] = useState("");
    const { isSignedIn } = useAuth();

    const router = useRouter();
    const dispatch = useDispatch();

    // Check if the user is already signed in
    // Updated: Redirects to /payment
    useEffect(() => {
        if (isSignedIn) {
            router.push("/payment");
        }
    }, [isSignedIn, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isLoaded) return;
        const promise = async () => {
            try {
                await signUp.create({
                    emailAddress: email,
                    password,
                    firstName,
                    lastName,
                });

                await signUp.prepareEmailAddressVerification({
                    strategy: "email_code",
                });
                setCodeSent(true);
            } catch (err: any) {
                // toast.error(err.errors[0].message);
                throw err; // Re-throw to trigger toast.promise error
            }
        };

        toast.promise(promise(), {
            loading: "Creating account...",
            success: "Account created successfully! Please verify your email.",
            error: (err) =>
                err.errors?.[0]?.message || "Failed to create account.",
        });
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isLoaded) return;
        const promise = async () => {
            try {
                const result = await signUp.attemptEmailAddressVerification({
                    code,
                });

                if (result.status === "complete") {
                    await setActive({ session: result.createdSessionId });

                    dispatch(signInAction());

                    router.push("/payment");
                } else {
                    // console.error(JSON.stringify(result, null, 2));
                }
            } catch (err: any) {
                if (err.errors) {
                    err.errors.forEach((error: any) => {
                        toast.error(error.long_message || error.message);
                    });
                }
                throw err;
            }
        };

        toast.promise(promise(), {
            loading: "Verifying code...",
            success: "Code verified successfully! Redirecting to payment...",
            error: "Verification failed. Please try again.",
        });
    };

    const handleGoogleSignIn = async () => {
        if (!isLoaded) return;
        try {
            await signUp.authenticateWithRedirect({
                strategy: "oauth_google",
                redirectUrl: "/sso-callback",
                redirectUrlComplete: "/payment",
            });
            dispatch(signInAction());
        } catch (err: any) {
            toast.error("Failed to sign in with Google. Please try again.");
        }
    };

    return (
        <AuthLayout
            title="Create your account"
            subtitle="Start managing your business today"
        >
            {/* Google Auth Button */}
            <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
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
            <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
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
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                                className="outline-none bg-slate-50 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
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
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                required
                                className="outline-none bg-slate-50 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                            />
                        </div>
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
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                            required
                            className="outline-none bg-slate-50 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
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
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="outline-none bg-slate-50 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                        />
                    </div>
                </div>
                {codeSent && (
                    <div>
                        <label
                            htmlFor="verification-code"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Verification Code
                        </label>
                        <div className="mt-1">
                            <input
                                id="verification-code"
                                name="verification-code"
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                required
                                className="no-spinner outline-none bg-slate-50 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                            />
                        </div>
                    </div>
                )}
                {codeSent ? (
                    <button
                        type="submit"
                        onClick={handleVerify}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                    >
                        Verify Code
                    </button>
                ) : (
                    <button
                        type="submit"
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                    >
                        Create account
                    </button>
                )}
                <div id="clerk-captcha"></div>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
                Already have an account?{" "}
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

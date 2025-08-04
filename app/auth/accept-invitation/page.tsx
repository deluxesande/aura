"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, useClerk } from "@clerk/nextjs";
import axios from "axios";
import AuthLayout from "@components/auth/AuthLayout";
import Link from "next/link";

export default function AcceptInvitation() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { isLoaded } = useAuth();
    const clerk = useClerk();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [invitation, setInvitation] = useState<any>(null);
    const [credentials, setCredentials] = useState<any>(null);

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        password: "",
        confirmPassword: "",
    });

    const token = searchParams?.get("token");

    useEffect(() => {
        if (!isLoaded || !token) return;

        const validateInvitation = async () => {
            try {
                // First, validate that the invitation exists and is valid
                const response = await axios.get(
                    `/api/auth/invite/validate?token=${token}`
                );
                setInvitation(response.data.invitation);
                setShowForm(true);
                setLoading(false);
            } catch (err: any) {
                setError(err.response?.data?.error || "Invalid invitation");
                setLoading(false);
            }
        };

        validateInvitation();
    }, [isLoaded, token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await axios.post("/api/auth/invite/accept", {
                token,
                firstName: formData.firstName,
                lastName: formData.lastName,
                password: formData.password,
            });

            if (response.data.credentials) {
                setCredentials(response.data.credentials);
            }

            setSuccess(true);
            setLoading(false);

            // Auto-redirect to login after 5 seconds
            setTimeout(() => {
                router.push("/sign-in");
            }, 5000);
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to create account");
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <AuthLayout title="Processing invitation..." subtitle="Please wait">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">
                        Validating your invitation...
                    </p>
                </div>
            </AuthLayout>
        );
    }

    if (error) {
        return (
            <AuthLayout
                title="Invitation Error"
                subtitle="Something went wrong"
            >
                <div className="text-center">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        <p>{error}</p>
                    </div>
                    <Link
                        href="/"
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                        Go Home
                    </Link>
                </div>
            </AuthLayout>
        );
    }

    if (success) {
        return (
            <AuthLayout
                title="Account Created Successfully!"
                subtitle={`Welcome to ${invitation?.businessName}`}
            >
                <div className="text-center">
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
                        <p className="font-medium">
                            Your account has been created!
                        </p>
                        <p className="text-sm mt-1">
                            You can now access your account.
                        </p>
                    </div>

                    {credentials && (
                        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
                            <p className="font-medium mb-2">
                                Important: Save these credentials
                            </p>
                            <div className="text-sm space-y-1">
                                <p>
                                    <strong>Email:</strong> {credentials.email}
                                </p>
                                <p>
                                    <strong>Password:</strong>{" "}
                                    {credentials.password}
                                </p>
                                <p className="text-xs mt-2 italic">
                                    {credentials.message}
                                </p>
                            </div>
                        </div>
                    )}

                    <p className="text-sm text-gray-600 mb-6">
                        Redirecting to login page in 5 seconds...
                    </p>

                    <Link
                        href="/sign-in"
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                        Go to Login
                    </Link>
                </div>
            </AuthLayout>
        );
    }

    if (showForm && invitation) {
        return (
            <AuthLayout
                title="Accept Invitation"
                subtitle={`You've been invited to join ${invitation.businessName} as ${invitation.role}`}
            >
                <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label
                                htmlFor="firstName"
                                className="block text-sm font-medium text-gray-700"
                            >
                                First name
                            </label>
                            <div className="mt-1">
                                <input
                                    id="firstName"
                                    name="firstName"
                                    type="text"
                                    required
                                    value={formData.firstName}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            firstName: e.target.value,
                                        })
                                    }
                                    className="outline-none bg-slate-50 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="lastName"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Last name
                            </label>
                            <div className="mt-1">
                                <input
                                    id="lastName"
                                    name="lastName"
                                    type="text"
                                    required
                                    value={formData.lastName}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            lastName: e.target.value,
                                        })
                                    }
                                    className="outline-none bg-slate-50 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
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
                                disabled
                                value={invitation.email}
                                className="outline-none bg-gray-100 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 text-gray-500 cursor-not-allowed"
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
                                value={formData.password}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        password: e.target.value,
                                    })
                                }
                                placeholder="Minimum 8 characters"
                                className="outline-none bg-slate-50 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="confirmPassword"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Confirm Password
                        </label>
                        <div className="mt-1">
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                value={formData.confirmPassword}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        confirmPassword: e.target.value,
                                    })
                                }
                                className="outline-none bg-slate-50 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Creating Account..." : "Create Account"}
                    </button>
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

    return null;
}

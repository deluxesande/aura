import React, { useState } from "react";

const ProfileInfo: React.FC = () => {
    const [name, setName] = useState("John Doe");
    const [email, setEmail] = useState("john.doe@example.com");
    const [status, setStatus] = useState("");

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        // Add update profile logic here
        setStatus("profile-updated");
        setTimeout(() => setStatus(""), 2000);
    };

    const handleSendVerification = (event: React.FormEvent) => {
        event.preventDefault();
        // Add send verification logic here
        alert("Verification email sent");
    };

    return (
        <section>
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    Profile Information
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                    Update your account&apos;s profile information and email
                    address.
                </p>
            </header>

            <form
                id="send-verification"
                onSubmit={handleSendVerification}
                method="post"
            >
                {/* Add CSRF token if needed */}
            </form>

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                <div>
                    <label htmlFor="name" className="flex items-center gap-2">
                        Name
                    </label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        className="w-full px-4 py-2 rounded-lg outline-none bg-slate-50 focus:border-gray-400 border-2"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        autoFocus
                        autoComplete="name"
                    />
                </div>

                <div>
                    <label htmlFor="email" className="flex items-center gap-2">
                        Email
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        className="w-full px-4 py-2 rounded-lg outline-none bg-slate-50 focus:border-gray-400 border-2"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="username"
                    />
                    <div>
                        <p className="text-sm mt-2 text-gray-800">
                            Your email address is unverified.
                            <button
                                form="send-verification"
                                className="underline text-sm text-gray-600 hover:text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Click here to re-send the verification email.
                            </button>
                        </p>
                        {status === "verification-link-sent" && (
                            <p className="mt-2 font-medium text-sm text-green-600">
                                A new verification link has been sent to your
                                email address.
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        type="submit"
                        className="btn btn-md btn-ghost text-black flex items-center bg-green-400 w-full mt-8"
                    >
                        Save
                    </button>
                    {status === "profile-updated" && (
                        <p className="text-sm text-gray-600">Saved.</p>
                    )}
                </div>
            </form>
        </section>
    );
};

export default ProfileInfo;

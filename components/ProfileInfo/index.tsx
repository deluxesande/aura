import { useUser } from "@clerk/nextjs";
import React, { useState } from "react";

const ProfileInfo: React.FC = () => {
    const { user } = useUser();
    const [name, setName] = useState<string | undefined>(undefined);
    const [email, setEmail] = useState<string | undefined>(undefined);

    React.useEffect(() => {
        if (user) {
            setName(user.fullName || "John Doe");
            setEmail(
                user.emailAddresses[0]?.emailAddress || "johndoe@gmail.com"
            );
        }
    }, [user]); // Runs whenever `user` changes

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

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Add logic to upload the image and update the user's profile image
            alert("Profile image uploaded");
        }
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
                <div className="flex flex-col lg:flex-row items-center space-x-6">
                    <div className="flex lg:flex-col items-center mx-10">
                        <div className="flex flex-col items-center">
                            {user && user.imageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={user.imageUrl}
                                    alt="User Profile"
                                    className="w-24 h-24 rounded-full object-cover mb-4"
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-gray-300 mb-4"></div>
                            )}
                            <label
                                htmlFor="profileImage"
                                className="cursor-pointer btn btn-sm btn-ghost text-black flex items-center bg-green-400 px-4 py-2 rounded-lg"
                            >
                                Upload Profile
                            </label>
                            <input
                                id="profileImage"
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                        </div>
                    </div>
                    <div className="flex-1 space-y-4">
                        <div>
                            <label
                                htmlFor="name"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Name
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                className="mt-1 block w-full px-4 py-2 rounded-lg outline-none bg-slate-50 focus:border-gray-400 border-2"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                autoFocus
                                autoComplete="name"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                className="mt-1 block w-full px-4 py-2 rounded-lg outline-none bg-slate-50 focus:border-gray-400 border-2"
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
                                        Click here to re-send the verification
                                        email.
                                    </button>
                                </p>
                                {status === "verification-link-sent" && (
                                    <p className="mt-2 font-medium text-sm text-green-600">
                                        A new verification link has been sent to
                                        your email address.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-4">
                    <button
                        type="submit"
                        className="w-full lg:w-auto btn btn-md btn-ghost text-black flex items-center bg-green-400 px-4 py-2 rounded-lg"
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

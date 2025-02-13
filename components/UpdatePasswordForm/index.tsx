import React, { useState } from "react";

const UpdatePasswordForm: React.FC = () => {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [status, setStatus] = useState("");

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        // Add update password logic here
        setStatus("password-updated");
        setTimeout(() => setStatus(""), 2000);
    };

    return (
        <section>
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    Update Password
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                    Ensure your account is using a long, random password to stay
                    secure.
                </p>
            </header>

            <form onSubmit={handleSubmit} className="mt-6 w-full space-y-6">
                <div>
                    <label
                        htmlFor="current_password"
                        className="flex items-center gap-2"
                    >
                        Current Password
                    </label>
                    <input
                        id="current_password"
                        name="current_password"
                        type="password"
                        className="w-full px-4 py-2 rounded-lg outline-none bg-slate-50 focus:border-gray-400 border-2"
                        autoComplete="current-password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                </div>

                <div>
                    <label
                        htmlFor="password"
                        className="flex items-center gap-2"
                    >
                        New Password
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        className="w-full px-4 py-2 rounded-lg outline-none bg-slate-50 focus:border-gray-400 border-2"
                        autoComplete="new-password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                </div>

                <div>
                    <label
                        htmlFor="password_confirmation"
                        className="flex items-center gap-2"
                    >
                        Confirm Password
                    </label>
                    <input
                        id="password_confirmation"
                        name="password_confirmation"
                        type="password"
                        className="w-full px-4 py-2 rounded-lg outline-none bg-slate-50 focus:border-gray-400 border-2"
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </div>

                <div className="flex flex-col items-center gap-4">
                    <button
                        type="submit"
                        className="btn btn-md btn-ghost text-black flex items-center bg-green-400 w-full mt-8"
                    >
                        Save
                    </button>

                    {status === "password-updated" && (
                        <p className="text-sm text-gray-600">Saved.</p>
                    )}
                </div>
            </form>
        </section>
    );
};

export default UpdatePasswordForm;

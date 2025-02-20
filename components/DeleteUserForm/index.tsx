import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";

const DeleteUserForm: React.FC = () => {
    const { user } = useUser();
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [username, setUsername] = useState("");

    const handleDeleteAccount = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!user) return;

        if (
            username === user.emailAddresses[0].emailAddress ||
            username === user.fullName ||
            username === user.username
        ) {
            const promise = async () => {
                try {
                    await axios.delete(`/api/auth/delete/${user.id}`);
                } catch (err) {
                    if (err instanceof Error) {
                        toast.error(err.message);
                    } else {
                        toast.error("An error occurred");
                    }
                }
            };

            toast.promise(promise(), {
                loading: "Deleting account...",
                success: () => {
                    router.push("/sign-up");
                    return "Account deleted";
                },
                error: "An error occurred",
            });
        } else {
            toast.warning("Username does not match");
        }
    };

    return (
        <section className="space-y-6">
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    Delete Account
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                    Once your account is deleted, all of its resources and data
                    will be permanently deleted. Before deleting your account,
                    please download any data or information that you wish to
                    retain.
                </p>
            </header>

            <button
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                onClick={() => setIsModalOpen(true)}
            >
                Delete Account
            </button>

            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                        <form onSubmit={handleDeleteAccount}>
                            <h2 className="text-lg font-medium text-gray-900">
                                Are you sure you want to delete your account?
                            </h2>
                            <p className="mt-1 text-sm text-gray-600">
                                Once your account is deleted, all of its
                                resources and data will be permanently deleted.
                                Please enter your password to confirm you would
                                like to permanently delete your account.
                            </p>
                            <div className="mt-6">
                                <label htmlFor="username" className="sr-only">
                                    Password
                                </label>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    className="w-full px-4 py-2 rounded-lg outline-none bg-slate-50 focus:border-gray-400 border-2"
                                    placeholder="Username"
                                    value={username}
                                    onChange={(e) =>
                                        setUsername(e.target.value)
                                    }
                                    onPaste={(e) => e.preventDefault()}
                                />
                            </div>
                            <div className="mt-6 w-full flex justify-end">
                                <button
                                    type="button"
                                    className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 ml-3"
                                >
                                    Delete Account
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
};

export default DeleteUserForm;
